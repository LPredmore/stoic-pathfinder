import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
      model = "google/gemini-2.0-flash",
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

    const body = {
      model,
      messages: normalizedMessages,
      stream,
      temperature,
      top_p,
      max_tokens,
    };

    const referer = req.headers.get("origin") ?? "https://lovable.dev";

    const openrouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": referer,
        "Referer": referer,
        "X-Title": metadata?.title ?? "Stoic Coach",
      },
      body: JSON.stringify(body),
    });

    if (!openrouterRes.ok) {
      const errTxt = await openrouterRes.text();
      console.error("OpenRouter returned non-OK", openrouterRes.status, errTxt);
      return new Response(JSON.stringify({ error: "OpenRouter error", details: errTxt }), {
        status: openrouterRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If streaming requested, just proxy the stream
    if (stream) {
      return new Response(openrouterRes.body, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": openrouterRes.headers.get("Content-Type") ?? "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const data = await openrouterRes.json();
    return new Response(JSON.stringify(data), {
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
