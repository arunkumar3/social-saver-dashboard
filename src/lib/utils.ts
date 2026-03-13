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
