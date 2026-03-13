"use client";

import { getCategoryColor } from "@/lib/utils";

interface StatsBarProps {
  total: number;
  typeCounts: { tweet: number; thread: number; article: number };
  pendingActions: number;
  topCategory: { name: string; count: number } | null;
}

export function StatsBar({ total, typeCounts, pendingActions, topCategory }: StatsBarProps) {
  return (
    <div className="border-b border-gray-800 bg-surface-2 px-6 py-4">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6">
        <StatItem label="Total Bookmarks" value={total} />
        <div className="h-8 w-px bg-gray-700" />
        <StatItem label="Tweets" value={typeCounts.tweet} icon="𝕏" color="text-blue-400" />
        <StatItem label="Threads" value={typeCounts.thread} icon="🧵" color="text-purple-400" />
        <StatItem label="Articles" value={typeCounts.article} icon="📄" color="text-green-400" />
        <div className="h-8 w-px bg-gray-700" />
        <StatItem
          label="Pending Actions"
          value={pendingActions}
          color={pendingActions > 0 ? "text-amber-400" : "text-gray-400"}
        />
        {topCategory && (
          <>
            <div className="h-8 w-px bg-gray-700" />
            <div className="flex items-center gap-2">
              <div>
                <p className="text-xs text-gray-400">Top Category</p>
                <p className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryColor(topCategory.name)}`}>
                    {topCategory.name}
                  </span>
                  <span className="text-sm font-semibold text-gray-300">{topCategory.count}</span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon?: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className="text-lg">{icon}</span>}
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`text-xl font-semibold ${color || "text-white"}`}>{value}</p>
      </div>
    </div>
  );
}
