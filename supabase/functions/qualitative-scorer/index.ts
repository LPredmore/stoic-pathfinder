import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
}

const supabase = createClient(supabaseUrl!, serviceKey!, {
  auth: { persistSession: false },
});

type Mapping = {
  question_id: string;
  map: Record<string, number>; // raw response (normalized) -> score 1..5
};

type Payload = {
  mappings?: Mapping[];
  default_score?: number; // optional fallback if mapping missing
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mappings = [], default_score }: Payload = await req.json().catch(() => ({ mappings: [] }));

    const { data: textRows, error: textErr } = await supabase
      .from("text_responses")
      .select("profile_id,question_id,response,updated_at");
    if (textErr) throw textErr;

    const { data: qualRows, error: qualErr } = await supabase
      .from("qualitative_scores")
      .select("profile_id,question_id,updated_at");
    if (qualErr) throw qualErr;

    const qualIndex = new Map<string, string>();
    (qualRows || []).forEach((r: any) => {
      qualIndex.set(`${r.profile_id}:${r.question_id}`, r.updated_at);
    });

    const mappingIndex = new Map<string, Mapping>();
    mappings.forEach((m) => mappingIndex.set(m.question_id, m));

    const toUpsert: { profile_id: string; question_id: string; score: number }[] = [];

    for (const r of textRows || []) {
      const key = `${(r as any).profile_id}:${(r as any).question_id}`;
      const existingUpdatedAt = qualIndex.get(key);
      if (!existingUpdatedAt || new Date((r as any).updated_at) > new Date(existingUpdatedAt)) {
        const qid = (r as any).question_id as string;
        const raw = normalize((r as any).response as string);
        const mapping = mappingIndex.get(qid);
        let score: number | undefined = mapping?.map?.[raw];
        if (score === undefined && typeof default_score === "number") {
          score = default_score;
        }
        if (typeof score === "number" && score >= 1 && score <= 5) {
          toUpsert.push({
            profile_id: (r as any).profile_id,
            question_id: qid,
            score,
          });
        }
      }
    }

    if (toUpsert.length > 0) {
      const { error: upErr } = await supabase
        .from("qualitative_scores")
        .upsert(toUpsert, { onConflict: "profile_id,question_id" });
      if (upErr) throw upErr;
    }

    return new Response(
      JSON.stringify({ processed: toUpsert.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("qualitative-scorer error:", error);
    return new Response(
      JSON.stringify({ error: (error as any).message ?? "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
