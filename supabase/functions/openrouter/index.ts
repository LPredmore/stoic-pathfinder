import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-debug",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const debug = req.headers.get("x-debug") === "1";
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is not set in Edge Function secrets");
      return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY is not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      messages,
      prompt,
      model = "meta-llama/llama-3.3-70b-instruct:free",
      stream = false,
      temperature = 0.2,
      top_p = 0.9,
      max_tokens = 1000,
      metadata,
    } = await req.json();

    // Normalize to OpenAI-compatible messages array
    const normalizedMessages = Array.isArray(messages) && messages.length
      ? messages
      : [
          { role: "system", content: "You are a concise, practical Stoic coaching assistant." },
          { role: "user", content: String(prompt ?? "Hello") },
        ];

    const baseBody = {
      messages: normalizedMessages,
      stream,
      temperature,
      top_p,
      max_tokens,
    };

    const refererHeader = req.headers.get("origin") ?? req.headers.get("referer") ?? "https://9d8ea720-a5bf-47e0-bec8-dc498c38b65c.lovableproject.com";

    // Discover models available to this API key
    let availableIds = new Set<string>();
    try {
      const modelsRes = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}` },
      });
      if (modelsRes.ok) {
        const modelsJson = await modelsRes.json();
        const ids: string[] = (modelsJson?.data ?? []).map((m: any) => m.id);
        availableIds = new Set(ids);
        console.log("Available models (count)", ids.length);
      } else {
        console.warn("Failed to fetch models list", modelsRes.status);
      }
    } catch (e) {
      console.warn("Error fetching models list", e);
    }

    // Preferred candidates; we'll filter to what's available for this key
    const preferred = [
      model,
      "openai/gpt-4o-mini",
      "gpt-4o-mini",
      "openrouter/auto",
      "meta-llama/llama-3.3-70b-instruct:free",
      "meta-llama/llama-3.1-8b-instruct:free",
      "mistralai/mistral-7b-instruct:free",
      "qwen/qwen-2.5-7b-instruct:free",
    ];

    let modelsToTry = Array.from(new Set(
      (availableIds.size > 0
        ? preferred.filter((id) => id === "openrouter/auto" || availableIds.has(id))
        : preferred)
    ));

    // If we have availability info but nothing matched, fall back to any free model available
    if (availableIds.size > 0 && modelsToTry.length === 0) {
      const freeAvailable = Array.from(availableIds).filter((id) => id.endsWith(":free"));
      modelsToTry = freeAvailable.length ? freeAvailable : Array.from(availableIds);
    }

    let lastError: any = null;
    const tried: string[] = [];

    for (const candidate of modelsToTry) {
      tried.push(candidate);
      const body = { ...baseBody, model: candidate };
      console.log("Invoking OpenRouter", { model: candidate, refererHeader, msgCount: normalizedMessages.length });

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          // Intentionally omit Referer headers to avoid domain restrictions
          "X-Title": metadata?.title ?? "Stoic Coach",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        // If streaming requested, proxy the stream
        if (stream) {
          return new Response(res.body, {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": res.headers.get("Content-Type") ?? "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        }

        const data = await res.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const errTxt = await res.text();
      let parsed: any = null;
      try { parsed = JSON.parse(errTxt); } catch { /* not json */ }
      const reqId = res.headers.get("x-request-id") || res.headers.get("openrouter-request-id") || undefined;
      lastError = {
        error: "OpenRouter error",
        status: res.status,
        reqId,
        model: candidate,
        referer: refererHeader,
        msgCount: normalizedMessages.length,
        tried,
        openrouter: parsed ?? errTxt,
      };
      console.error("OpenRouter returned non-OK", lastError);

      // Only fall back automatically on the specific 404 provider-unavailable case
      const isNoProvider404 = res.status === 404 && (parsed?.error?.message?.includes("No allowed providers") || parsed?.error?.code === 404);
      if (!isNoProvider404) {
        break;
      }
    }

    // If we reach here, all attempts failed; return 200 with error payload so client can display a friendly message
    return new Response(JSON.stringify(lastError ?? { error: "OpenRouter error", status: 500 }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("openrouter function error", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
