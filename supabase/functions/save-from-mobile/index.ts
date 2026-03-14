import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    "authorization, x-client-info, apikey, content-type, x-ssp-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ═══════════════════════════════════════════════════════════════
// URL CLEANING
// ═══════════════════════════════════════════════════════════════

function cleanTweetUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim());

    // Normalize twitter.com → x.com
    if (url.hostname === "twitter.com" || url.hostname === "www.twitter.com") {
      url.hostname = "x.com";
    }

    // Must be x.com or mobile.x.com
    if (url.hostname !== "x.com" && url.hostname !== "mobile.x.com") {
      return null;
    }

    // Extract /user/status/id pattern
    const match = url.pathname.match(/^\/(\w+)\/status\/(\d+)/);
    if (!match) return null;

    // Return clean URL without query params or tracking
    return `https://x.com/${match[1]}/status/${match[2]}`;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// oEmbed EXTRACTION
// ═══════════════════════════════════════════════════════════════

interface OEmbedResult {
  author: string;
  author_handle: string;
  full_text: string;
}

function stripHtml(html: string): string {
  // Remove all HTML tags
  let text = html.replace(/<[^>]+>/g, " ");
  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

async function fetchOEmbed(url: string): Promise<OEmbedResult> {
  const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`;

  const res = await fetch(oembedUrl);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`oEmbed ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();

  // Extract author handle from author_url (e.g., "https://twitter.com/username")
  let author_handle = "";
  if (data.author_url) {
    const handleMatch = data.author_url.match(/(?:twitter\.com|x\.com)\/(\w+)/);
    if (handleMatch) author_handle = `@${handleMatch[1]}`;
  }

  // Parse tweet text from HTML
  const full_text = stripHtml(data.html || "");

  return {
    author: data.author_name || "Unknown",
    author_handle,
    full_text,
  };
}

// ═══════════════════════════════════════════════════════════════
// AI CATEGORIZATION (call process-bookmark internally)
// ═══════════════════════════════════════════════════════════════

async function triggerCategorization(bookmarkId: string): Promise<void> {
  try {
    const fnUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/process-bookmark`;

    await fetch(fnUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({ bookmarkId }),
    });
  } catch (err) {
    // Non-fatal — bookmark is saved, categorization can retry later
    console.warn("[save-from-mobile] Categorization trigger failed:", (err as Error).message);
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // ── Auth: check shared secret ──
  const mobileKey = Deno.env.get("SSP_MOBILE_KEY");
  if (mobileKey) {
    const providedKey = req.headers.get("x-ssp-key");
    if (providedKey !== mobileKey) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
  }

  try {
    const body = await req.json();
    const rawUrl = body.url;

    if (!rawUrl || typeof rawUrl !== "string") {
      return jsonResponse({ error: "Missing or invalid 'url' field" }, 400);
    }

    // 1. Clean URL
    const cleanUrl = cleanTweetUrl(rawUrl);
    if (!cleanUrl) {
      return jsonResponse(
        { error: "Invalid tweet URL. Expected: https://x.com/user/status/123" },
        400
      );
    }

    // 2. Check for duplicate
    const { data: existing } = await supabase
      .from("bookmarks")
      .select("id, title, category")
      .eq("url", cleanUrl)
      .maybeSingle();

    if (existing) {
      return jsonResponse({
        success: true,
        duplicate: true,
        id: existing.id,
        title: existing.title,
        category: existing.category,
        message: "Already saved",
      });
    }

    // 3. Fetch content via oEmbed
    let author = "Unknown";
    let author_handle = "";
    let full_text = "";
    let oembedFailed = false;

    try {
      const oembed = await fetchOEmbed(cleanUrl);
      author = oembed.author;
      author_handle = oembed.author_handle;
      full_text = oembed.full_text;
    } catch (err) {
      console.warn("[save-from-mobile] oEmbed failed:", (err as Error).message);
      oembedFailed = true;
    }

    // 4. Build title
    const title = oembedFailed
      ? `Uncategorized — ${cleanUrl}`
      : full_text.slice(0, 100) || `Tweet by ${author}`;

    // 5. Save to bookmarks
    const { data: saved, error: insertErr } = await supabase
      .from("bookmarks")
      .insert({
        url: cleanUrl,
        type: "tweet",
        title,
        author,
        author_handle,
        full_text: full_text || null,
        saved_at: new Date().toISOString(),
        ai_processed: false,
      })
      .select("id, title")
      .single();

    if (insertErr) {
      throw new Error(`DB insert failed: ${insertErr.message}`);
    }

    // 6. Trigger AI categorization (non-blocking)
    if (!oembedFailed && full_text.length >= 10) {
      // Don't await — let it run in background so response is fast
      triggerCategorization(saved.id);
    }

    return jsonResponse({
      success: true,
      id: saved.id,
      title: saved.title,
      oembedFailed,
      message: oembedFailed
        ? "Saved URL only — oEmbed failed, flagged for manual review"
        : "Saved and categorizing",
    });
  } catch (err) {
    console.error("[save-from-mobile] Error:", err);
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
