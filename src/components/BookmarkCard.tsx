"use client";

import { Bookmark } from "@/lib/types";
import { formatTimeAgo, truncate, getTypeIcon, getTypeColor } from "@/lib/utils";

interface BookmarkCardProps {
  bookmark: Bookmark;
  isExpanded: boolean;
  onExpand: (id: string) => void;
  onActionToggle: (id: string, status: "pending" | "done" | "skipped") => void;
}

export function BookmarkCard({ bookmark, isExpanded, onExpand, onActionToggle }: BookmarkCardProps) {
  const nextStatus = bookmark.action_status === "done" ? "pending" : "done";

  return (
    <div
      className={`rounded-xl border bg-surface-2 transition-all ${
        isExpanded ? "border-brand-blue" : "border-gray-800 hover:border-gray-600"
      }`}
    >
      {/* Collapsed card */}
      <button
        onClick={() => onExpand(bookmark.id)}
        className="w-full p-4 text-left"
      >
        {/* Header: type + author + time */}
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-xs ${getTypeColor(
              bookmark.type
            )}`}
          >
            {getTypeIcon(bookmark.type)}
          </span>
          <span className="text-sm font-medium text-gray-200">{bookmark.author}</span>
          <span className="text-xs text-gray-500">
            {bookmark.author_handle?.startsWith("@") ? bookmark.author_handle : `@${bookmark.author_handle}`}
          </span>
          <span className="ml-auto text-xs text-gray-500">
            {formatTimeAgo(bookmark.saved_at)}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-sm font-medium text-white">
          {bookmark.title}
        </h3>

        {/* Bottom row: badges */}
        <div className="flex flex-wrap items-center gap-2">
          {bookmark.category && (
            <span className="rounded-full bg-brand-blue/15 px-2 py-0.5 text-[11px] font-medium text-brand-blue">
              {bookmark.category}
            </span>
          )}
          {bookmark.action_item && (
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                bookmark.action_status === "done"
                  ? "bg-green-500/15 text-green-400"
                  : bookmark.action_status === "pending"
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-gray-500/15 text-gray-400"
              }`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  bookmark.action_status === "done"
                    ? "bg-green-400"
                    : bookmark.action_status === "pending"
                    ? "bg-amber-400"
                    : "bg-gray-400"
                }`}
              />
              {truncate(bookmark.action_item, 40)}
            </span>
          )}
        </div>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-gray-800 p-4">
          {/* Full text */}
          <div className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
            {bookmark.full_text}
          </div>

          {/* Images */}
          {bookmark.images && bookmark.images.length > 0 && (
            <div className="mb-4 flex gap-2 overflow-x-auto">
              {bookmark.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className="h-32 w-auto rounded-lg border border-gray-700 object-cover"
                />
              ))}
            </div>
          )}

          {/* Key insights */}
          {bookmark.key_insights && bookmark.key_insights.length > 0 && (
            <div className="mb-4">
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Key Insights
              </h4>
              <ul className="space-y-1">
                {bookmark.key_insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-blue" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action item */}
          {bookmark.action_item && (
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-surface-3 p-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onActionToggle(bookmark.id, nextStatus);
                }}
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition ${
                  bookmark.action_status === "done"
                    ? "border-green-500 bg-green-500 text-black"
                    : "border-gray-600 hover:border-brand-blue"
                }`}
              >
                {bookmark.action_status === "done" && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6l2.5 2.5 4.5-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              <span
                className={`text-sm ${
                  bookmark.action_status === "done" ? "text-gray-500 line-through" : "text-gray-200"
                }`}
              >
                {bookmark.action_item}
              </span>
            </div>
          )}

          {/* Footer: open original */}
          <div className="flex items-center justify-between">
            {bookmark.source_date && (
              <span className="text-xs text-gray-500">
                Originally posted {formatTimeAgo(bookmark.source_date)}
              </span>
            )}
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-sm text-brand-blue hover:underline"
            >
              Open Original →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
