import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Utility: strip markdown code fences
function stripCodeFences(s: string): string {
  return s.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return new Response(JSON.stringify({ error: "Supabase env not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? undefined;

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: authHeader ? { Authorization: authHeader } : {} },
    });

    const adminClient = SUPABASE_SERVICE_ROLE_KEY
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : null;

    const { messages, mode } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Identify user profile id under RLS using the user's JWT
    const { data: profileRow, error: profileErr } = await userClient
      .from("profiles")
      .select("id, display_name, memory_store")
      .single();

    if (profileErr || !profileRow) {
      return new Response(JSON.stringify({ error: "No profile found for user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const profileId: string = profileRow.id;
    const knownMemory = (profileRow as any).memory_store ?? {};

    // Optionally fetch small bits of context to personalize
    const [{ data: goalsData }, { data: relsData }] = await Promise.all([
      userClient.from("goals").select("title").order("created_at", { ascending: false }).limit(3),
      userClient.from("relationships").select("name").order("created_at", { ascending: false }).limit(5),
    ]);

    // Load admin settings and mode instructions with service role (bypass RLS for config)
    let persona = "You are a compassionate, pragmatic Stoic accountability coach.";
    let principles: string[] = [];
    let safety: { boundaries?: string; prohibited?: string; escalation?: string } = {};
    let opening = "";
    let closing = "";
    let responseStyle = "concise";
    let modeInstructions = "";

    if (adminClient) {
      const [{ data: settings }, { data: modeRow }] = await Promise.all([
        adminClient
          .from("ai_therapist_settings")
          .select("persona, principles, safety_boundaries, prohibited_topics, escalation_policy, session_opening, session_closing, response_style")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        mode
          ? adminClient
              .from("ai_training")
              .select("instructions")
              .eq("mode", mode)
              .maybeSingle()
          : Promise.resolve({ data: null } as any),
      ]);

      if (settings) {
        persona = settings.persona ?? persona;
        principles = Array.isArray(settings.principles) ? settings.principles : principles;
        safety = {
          boundaries: settings.safety_boundaries ?? undefined,
          prohibited: settings.prohibited_topics ?? undefined,
          escalation: settings.escalation_policy ?? undefined,
        };
        opening = settings.session_opening ?? opening;
        closing = settings.session_closing ?? closing;
        responseStyle = settings.response_style ?? responseStyle;
      }
      if (modeRow?.instructions) modeInstructions = modeRow.instructions;
    }

    // Build a contextual system prompt
    const knownContextPieces: string[] = [];
    if (profileRow.display_name) knownContextPieces.push(`Name: ${profileRow.display_name}`);
    if (goalsData?.length) knownContextPieces.push(`Recent goals: ${goalsData.map(g => g.title).join(", ")}`);
    if (relsData?.length) knownContextPieces.push(`People mentioned: ${relsData.map(r => r.name).join(", ")}`);

    const systemPrompt = [
      persona,
      principles.length ? `Guiding principles: ${principles.join("; ")}` : "",
      safety.boundaries ? `Safety boundaries: ${safety.boundaries}` : "",
      safety.prohibited ? `Prohibited topics: ${safety.prohibited}` : "",
      safety.escalation ? `Escalation policy: ${safety.escalation}` : "",
      opening ? `Session opening guidance: ${opening}` : "",
      closing ? `Session closing guidance: ${closing}` : "",
      modeInstructions ? `Mode instructions (${mode ?? "default"}): ${modeInstructions}` : "",
      "Always be warm, curious, and non-interrogative. At most one gentle follow-up question when it helps move the user forward.",
      "Personalize using the KNOWN PROFILE CONTEXT when relevant.",
      knownContextPieces.length ? `KNOWN PROFILE CONTEXT: ${knownContextPieces.join(" | ")}` : "",
      "If the user shares new stable personal info (values, boundaries, stuck points, goals, relationships), respond naturally first."
    ].filter(Boolean).join("\n\n");

    // Call OpenRouter for the assistant reply
    let replyText = "(no response)";
    if (!OPENROUTER_API_KEY) {
      console.warn("OPENROUTER_API_KEY missing – returning canned reply");
      replyText = "I'm here to help. It looks like my AI backend isn't configured yet.";
    } else {
      const openrouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "X-Title": "Stoic Coach",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct:free",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          temperature: 0.3,
          top_p: 0.9,
          max_tokens: 600,
        }),
      });

      if (!openrouterRes.ok) {
        const txt = await openrouterRes.text();
        console.error("OpenRouter error", txt);
        replyText = "I ran into an issue reaching my model provider. Please try again shortly.";
      } else {
        const json = await openrouterRes.json();
        replyText = json?.choices?.[0]?.message?.content ?? replyText;
      }
    }

    // Memory extraction prompt
    const extractionSystem = `You extract structured, stable user information from a chat turn.\nOnly include items you are highly confident about and that are NEW relative to KNOWN_MEMORY.\nReturn STRICT JSON matching this schema (no commentary):\n{\n  "values": string[],\n  "boundaries": string[],\n  "stuck_points": string[],\n  "goals": { "title": string, "description"?: string }[],\n  "relationships": { "name": string, "relationship_type"?: string, "details"?: { "how_we_met"?: string, "personality_traits"?: string[], "interests"?: string[] } }[],\n  "notes": string[]\n}`;

    const extractionUser = [
      `KNOWN_MEMORY: ${JSON.stringify(knownMemory).slice(0, 4000)}`,
      `LAST_USER_MESSAGE: ${messages[messages.length - 1]?.content ?? ""}`,
      `ASSISTANT_REPLY: ${replyText}`,
      "Extract only if confident and helpful. If nothing new, return empty arrays.",
    ].join("\n\n");

    let extracted: any = { values: [], boundaries: [], stuck_points: [], goals: [], relationships: [], notes: [] };

    if (OPENROUTER_API_KEY) {
      const extRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "X-Title": "Stoic Memory Extractor",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct:free",
          messages: [
            { role: "system", content: extractionSystem },
            { role: "user", content: extractionUser },
          ],
          temperature: 0,
          max_tokens: 500,
        }),
      });

      if (extRes.ok) {
        const data = await extRes.json();
        const raw = data?.choices?.[0]?.message?.content ?? "{}";
        try {
          const parsed = JSON.parse(stripCodeFences(raw));
          if (parsed && typeof parsed === "object") extracted = {
            values: Array.isArray(parsed.values) ? parsed.values : [],
            boundaries: Array.isArray(parsed.boundaries) ? parsed.boundaries : [],
            stuck_points: Array.isArray(parsed.stuck_points) ? parsed.stuck_points : [],
            goals: Array.isArray(parsed.goals) ? parsed.goals : [],
            relationships: Array.isArray(parsed.relationships) ? parsed.relationships : [],
            notes: Array.isArray(parsed.notes) ? parsed.notes : [],
          };
        } catch (e) {
          console.warn("Failed to parse extraction JSON", e);
        }
      } else {
        console.warn("Extractor model error", await extRes.text());
      }
    }

    // Write memories conservatively under RLS as the user
    let saved = { values: 0, boundaries: 0, stuck_points: 0, goals: 0, relationships: 0, notes: 0 };

    // Merge values/notes into profiles.memory_store JSON
    try {
      const newMemory: any = {
        ...(knownMemory || {}),
        values: Array.from(new Set([...(knownMemory?.values ?? []), ...(extracted.values ?? [])])),
        notes: Array.from(new Set([...(knownMemory?.notes ?? []), ...(extracted.notes ?? [])])),
      };
      if (JSON.stringify(newMemory) !== JSON.stringify(knownMemory)) {
        const { error: memErr } = await userClient
          .from("profiles")
          .update({ memory_store: newMemory })
          .eq("id", profileId);
        if (!memErr) {
          saved.values = (extracted.values ?? []).length;
          saved.notes = (extracted.notes ?? []).length;
        } else {
          console.warn("Failed updating memory_store", memErr);
        }
      }
    } catch (e) {
      console.warn("memory_store merge error", e);
    }

    // Boundaries
    if (Array.isArray(extracted.boundaries) && extracted.boundaries.length) {
      const { data: existing } = await userClient
        .from("boundaries")
        .select("boundary")
        .eq("profile_id", profileId);
      const existingSet = new Set((existing ?? []).map((r: any) => (r.boundary || "").toLowerCase()));
      const toInsert = extracted.boundaries
        .map((b: any) => String(b).trim())
        .filter((b: string) => b && !existingSet.has(b.toLowerCase()))
        .map((b: string) => ({ boundary: b, profile_id: profileId }));
      if (toInsert.length) {
        const { error } = await userClient.from("boundaries").insert(toInsert);
        if (!error) saved.boundaries = toInsert.length; else console.warn("Insert boundaries error", error);
      }
    }

    // Stuck points
    if (Array.isArray(extracted.stuck_points) && extracted.stuck_points.length) {
      const { data: existing } = await userClient
        .from("stuck_points")
        .select("point")
        .eq("profile_id", profileId);
      const existingSet = new Set((existing ?? []).map((r: any) => (r.point || "").toLowerCase()));
      const toInsert = extracted.stuck_points
        .map((p: any) => String(p).trim())
        .filter((p: string) => p && !existingSet.has(p.toLowerCase()))
        .map((p: string) => ({ point: p, profile_id: profileId }));
      if (toInsert.length) {
        const { error } = await userClient.from("stuck_points").insert(toInsert);
        if (!error) saved.stuck_points = toInsert.length; else console.warn("Insert stuck_points error", error);
      }
    }

    // Goals
    if (Array.isArray(extracted.goals) && extracted.goals.length) {
      const { data: existing } = await userClient
        .from("goals")
        .select("title")
        .eq("profile_id", profileId);
      const existingSet = new Set((existing ?? []).map((r: any) => (r.title || "").toLowerCase()));
      const toInsert = extracted.goals
        .map((g: any) => ({ title: String(g.title || "").trim(), description: g.description ? String(g.description) : null }))
        .filter((g: any) => g.title && !existingSet.has(g.title.toLowerCase()))
        .map((g: any) => ({ title: g.title, description: g.description, profile_id: profileId }));
      if (toInsert.length) {
        const { error } = await userClient.from("goals").insert(toInsert);
        if (!error) saved.goals = toInsert.length; else console.warn("Insert goals error", error);
      }
    }

    // Relationships (basic)
    if (Array.isArray(extracted.relationships) && extracted.relationships.length) {
      const { data: existing } = await userClient
        .from("relationships")
        .select("id, name")
        .eq("profile_id", profileId);
      const existingMap = new Map<string, string>((existing ?? []).map((r: any) => [String(r.name || "").toLowerCase(), r.id]));

      for (const rel of extracted.relationships) {
        const name = String(rel?.name || "").trim();
        if (!name) continue;
        let relId = existingMap.get(name.toLowerCase());
        if (!relId) {
          const { data: ins, error } = await userClient
            .from("relationships")
            .insert({ name, relationship_type: rel?.relationship_type || "unknown", profile_id: profileId })
            .select("id")
            .single();
          if (error) {
            console.warn("Insert relationship error", error);
          } else if (ins?.id) {
            relId = ins.id;
            existingMap.set(name.toLowerCase(), relId);
            saved.relationships += 1;
          }
        }
        if (relId && rel?.details) {
          const { error } = await userClient
            .from("relationship_details")
            .insert({ relationship_id: relId, how_we_met: rel.details.how_we_met ?? null, personality_traits: rel.details.personality_traits ?? null, interests: rel.details.interests ?? null });
          if (error) console.warn("Insert relationship_details error", error);
        }
      }
    }

    return new Response(
      JSON.stringify({ reply: replyText, memoriesSaved: saved, mode: mode ?? null }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ai-coach error", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
