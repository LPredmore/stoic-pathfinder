import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY secret");
      return new Response(
        JSON.stringify({ error: "Missing OPENAI_API_KEY", status: 400 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));

    const {
      messages,
      prompt,
      model = "gpt-4o-mini",
      stream = false,
      temperature = 0.2,
      top_p = 0.9,
      max_tokens = 600,
    } = body ?? {};

    // Normalize messages: accept either an array of messages or a single prompt string
    const normalizedMessages = Array.isArray(messages) && messages.length
      ? messages
      : [
          { role: "system", content: "You are a concise, encouraging Stoic accountability coach." },
          { role: "user", content: String(prompt ?? "Say hello in 1 sentence.") },
        ];

    console.log("Calling OpenAI", { model, msgCount: normalizedMessages.length });

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: normalizedMessages,
        temperature,
        top_p,
        max_tokens,
        stream,
      }),
    });

    const text = await openaiRes.text();
    let parsed: any;
    try { parsed = JSON.parse(text); } catch { parsed = text; }

    if (!openaiRes.ok) {
      console.error("OpenAI returned non-OK", { status: openaiRes.status, parsed });
      // Return a 200 with error payload so the client can surface it nicely
      return new Response(
        JSON.stringify({ error: "OpenAI error", status: openaiRes.status, openai: parsed }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Unhandled error in openai-chat", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
