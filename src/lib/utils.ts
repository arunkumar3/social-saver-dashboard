export function formatTimeAgo(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

export function truncate(text: string, maxLen: number): string {
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}

export function getTypeIcon(type: string): string {
  switch (type) {
    case "tweet":
      return "𝕏";
    case "thread":
      return "🧵";
    case "article":
      return "📄";
    default:
      return "📌";
  }
}

export function getCategoryColor(category: string): string {
  if (category.startsWith("AI/ML")) return "bg-emerald-500/15 text-emerald-400";
  if (category.startsWith("Trading")) return "bg-amber-500/15 text-amber-400";
  if (category.startsWith("AI Project")) return "bg-violet-500/15 text-violet-400";
  if (category.startsWith("Career")) return "bg-pink-500/15 text-pink-400";
  return "bg-gray-500/15 text-gray-400";
}

export function getCategoryDot(category: string): string {
  if (category.startsWith("AI/ML")) return "bg-emerald-400";
  if (category.startsWith("Trading")) return "bg-amber-400";
  if (category.startsWith("AI Project")) return "bg-violet-400";
  if (category.startsWith("Career")) return "bg-pink-400";
  return "bg-gray-400";
}

export function formatForClipboard(b: {
  title: string;
  author: string;
  author_handle: string;
  type: string;
  category: string | null;
  url: string;
  source_date: string | null;
  full_text: string;
  key_insights: string[] | null;
  action_item: string | null;
}): string {
  const lines: string[] = [
    `Title: ${b.title}`,
    `Author: ${b.author} (${b.author_handle})`,
    `Type: ${b.type}`,
    ...(b.category ? [`Category: ${b.category}`] : []),
    `URL: ${b.url}`,
    ...(b.source_date ? [`Date: ${b.source_date}`] : []),
    "",
    b.full_text,
  ];

  if (b.key_insights && b.key_insights.length > 0) {
    lines.push("", "Key Insights:");
    b.key_insights.forEach((insight) => lines.push(`  • ${insight}`));
  }

  if (b.action_item) {
    lines.push("", `Action Item: ${b.action_item}`);
  }

  return lines.join("\n");
}

export function generatePDFHtml(b: {
  title: string;
  author: string;
  author_handle: string;
  type: string;
  category: string | null;
  url: string;
  source_date: string | null;
  full_text: string;
  key_insights: string[] | null;
  action_item: string | null;
}): string {
  const insightsHtml =
    b.key_insights && b.key_insights.length > 0
      ? `<div class="insights">
          <h2>Key Insights</h2>
          <ul>${b.key_insights.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>
        </div>`
      : "";

  const actionHtml = b.action_item
    ? `<div class="action"><h2>Action Item</h2><p>${escapeHtml(b.action_item)}</p></div>`
    : "";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${escapeHtml(b.title)}</title>
<style>
  @media print { @page { margin: 20mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; line-height: 1.6; }
  .header { background: #1a1a2e; color: #fff; padding: 32px; margin: -20mm -20mm 24px -20mm; padding: 40px calc(20mm + 8px); }
  .header h1 { font-size: 22px; margin-bottom: 8px; }
  .header .meta { font-size: 13px; color: #94a3b8; }
  .header .meta span { margin-right: 16px; }
  .body { font-size: 15px; white-space: pre-wrap; margin-bottom: 24px; }
  .insights { margin-bottom: 24px; }
  .insights h2, .action h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #6366f1; margin-bottom: 8px; }
  .insights ul { padding-left: 20px; }
  .insights li { margin-bottom: 4px; }
  .action { background: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
  .action p { font-size: 14px; }
  .footer { border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between; }
</style></head><body>
  <div class="header">
    <h1>${escapeHtml(b.title)}</h1>
    <div class="meta">
      <span>${escapeHtml(b.author)} (${escapeHtml(b.author_handle)})</span>
      <span>${b.type}</span>
      ${b.category ? `<span>${escapeHtml(b.category)}</span>` : ""}
    </div>
  </div>
  <div class="body">${escapeHtml(b.full_text)}</div>
  ${insightsHtml}
  ${actionHtml}
  <div class="footer">
    <span>${escapeHtml(b.url)}</span>
    <span>${b.source_date || ""}</span>
  </div>
</body></html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getTypeColor(type: string): string {
  switch (type) {
    case "tweet":
      return "bg-blue-500/20 text-blue-400";
    case "thread":
      return "bg-purple-500/20 text-purple-400";
    case "article":
      return "bg-green-500/20 text-green-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
}
