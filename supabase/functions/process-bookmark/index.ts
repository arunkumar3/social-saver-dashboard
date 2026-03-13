// TODO: Remove --no-verify-jwt and verify tokens properly once user auth is added

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildPrompt } from "./prompt.ts";

// ═══════════════════════════════════════════════════════════════
// SUPABASE CLIENT (service role — bypasses RLS)
// ═══════════════════════════════════════════════════════════════

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ═══════════════════════════════════════════════════════════════
// CORS
// ═══════════════════════════════════════════════════════════════

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ═══════════════════════════════════════════════════════════════
// AI PROVIDERS
// ═══════════════════════════════════════════════════════════════

async function callGemini(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

async function callClaude(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error("Claude returned empty response");
  return text;
}

async function callAI(prompt: string): Promise<string> {
  try {
    return await callGemini(prompt);
  } catch (geminiErr) {
    console.warn("[process-bookmark] Gemini failed, falling back to Claude:", (geminiErr as Error).message);
    try {
      return await callClaude(prompt);
    } catch (claudeErr) {
      throw new Error(
        `Both AI providers failed. Gemini: ${(geminiErr as Error).message} | Claude: ${(claudeErr as Error).message}`
      );
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// JSON PARSING SAFETY
// ═══════════════════════════════════════════════════════════════

interface AIResult {
  category: string;
  action_item: string | null;
  key_insights: string[];
}

function parseAIResponse(raw: string): AIResult {
  let text = raw.trim();

  // Strip markdown code fences
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  // Extract first JSON object
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error(`No JSON object found in AI response: ${raw.slice(0, 200)}`);
  }

  const parsed = JSON.parse(match[0]);

  return {
    category: typeof parsed.category === "string" ? parsed.category : "Other: Uncategorized",
    action_item: typeof parsed.action_item === "string" ? parsed.action_item : null,
    key_insights: Array.isArray(parsed.key_insights)
      ? parsed.key_insights.filter((x: unknown) => typeof x === "string")
      : [],
  };
}

// ═══════════════════════════════════════════════════════════════
// BOOKMARK PROCESSING
// ═══════════════════════════════════════════════════════════════

interface ProcessResult {
  success: boolean;
  bookmarkId?: string;
  category?: string;
  error?: string;
}

async function processBookmark(bookmarkId: string): Promise<ProcessResult> {
  // 1. Fetch bookmark
  const { data: bookmark, error: fetchErr } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("id", bookmarkId)
    .single();

  if (fetchErr || !bookmark) {
    return { success: false, bookmarkId, error: `Bookmark not found: ${fetchErr?.message || "no data"}` };
  }

  // 2. Skip if already processed
  if (bookmark.ai_processed) {
    return { success: true, bookmarkId, category: bookmark.category, error: "Already processed" };
  }

  // 3. Skip if insufficient content
  if (!bookmark.full_text || bookmark.full_text.length < 10) {
    return { success: false, bookmarkId, error: "Insufficient content for categorization" };
  }

  // 4. Build prompt and call AI
  const prompt = buildPrompt({
    full_text: bookmark.full_text,
    type: bookmark.type || "tweet",
    author: bookmark.author || "Unknown",
    author_handle: bookmark.author_handle || "",
    title: bookmark.title || "",
  });

  const rawResponse = await callAI(prompt);

  // 5. Parse response
  const result = parseAIResponse(rawResponse);

  // 6. Update DB — don't swallow errors
  const { error: updateErr } = await supabase
    .from("bookmarks")
    .update({
      category: result.category,
      action_item: result.action_item,
      key_insights: result.key_insights,
      ai_processed: true,
      ai_processed_at: new Date().toISOString(),
    })
    .eq("id", bookmarkId);

  if (updateErr) {
    throw new Error(`DB update failed for ${bookmarkId}: ${updateErr.message}`);
  }

  return { success: true, bookmarkId, category: result.category };
}

// ═══════════════════════════════════════════════════════════════
// BATCH PROCESSING
// ═══════════════════════════════════════════════════════════════

interface BatchResult {
  processed: number;
  failed: number;
  errors: string[];
}

async function processBatch(): Promise<BatchResult> {
  const { data: bookmarks, error } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("ai_processed", false)
    .order("saved_at", { ascending: true })
    .limit(50);

  if (error) {
    throw new Error(`Failed to query bookmarks: ${error.message}`);
  }

  if (!bookmarks || bookmarks.length === 0) {
    return { processed: 0, failed: 0, errors: [] };
  }

  let processed = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const { id } of bookmarks) {
    try {
      const result = await processBookmark(id);
      if (result.success) {
        processed++;
      } else {
        failed++;
        errors.push(`${id}: ${result.error}`);
      }
    } catch (err) {
      failed++;
      errors.push(`${id}: ${(err as Error).message}`);
    }

    // Rate limit: 500ms between calls
    await new Promise((r) => setTimeout(r, 500));
  }

  return { processed, failed, errors };
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Batch mode
    if (body.batch === true) {
      const result = await processBatch();
      return jsonResponse(result);
    }

    // Single bookmark
    if (body.bookmarkId) {
      const result = await processBookmark(body.bookmarkId);
      return jsonResponse(result, result.success ? 200 : 400);
    }

    return jsonResponse({ error: "Provide bookmarkId or { batch: true }" }, 400);
  } catch (err) {
    console.error("[process-bookmark] Error:", err);
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
