"use client";

import { Bookmark } from "@/lib/types";
import { formatTimeAgo, truncate, getTypeIcon, getTypeColor, getCategoryColor } from "@/lib/utils";

interface BookmarkCardProps {
  bookmark: Bookmark;
  isExpanded: boolean;
  onExpand: (id: string) => void;
  onActionToggle: (id: string, status: "pending" | "done" | "skipped") => void;
}

function CheckboxIcon({ checked }: { checked: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      {checked && (
        <path
          d="M2.5 6l2.5 2.5 4.5-5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function BookmarkCard({ bookmark, isExpanded, onExpand, onActionToggle }: BookmarkCardProps) {
  const isDone = bookmark.action_status === "done";
  const nextStatus = isDone ? "pending" : "done";

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
            {formatTimeAgo(bookmark.source_date || bookmark.saved_at)}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-sm font-medium text-white">
          {bookmark.title}
        </h3>

        {/* Bottom row: category badge + action item with inline checkbox */}
        <div className="flex flex-wrap items-center gap-2">
          {bookmark.category && (
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${getCategoryColor(bookmark.category)}`}>
              {bookmark.category}
            </span>
          )}
          {bookmark.action_item && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onActionToggle(bookmark.id, nextStatus);
              }}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium transition ${
                isDone
                  ? "bg-green-500/15 text-green-400"
                  : bookmark.action_status === "pending"
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-gray-500/15 text-gray-400"
              }`}
            >
              {/* Inline checkbox */}
              <span
                className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded border transition ${
                  isDone
                    ? "border-green-500 bg-green-500 text-black"
                    : "border-gray-500"
                }`}
              >
                <CheckboxIcon checked={isDone} />
              </span>
              <span className={isDone ? "line-through opacity-60" : ""}>
                {truncate(bookmark.action_item, 35)}
              </span>
            </span>
          )}
        </div>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-gray-800 p-4">
          {/* Larger category badge */}
          {bookmark.category && (
            <div className="mb-4">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getCategoryColor(bookmark.category)}`}>
                {bookmark.category}
              </span>
            </div>
          )}

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

          {/* Key insights — with left border accent */}
          {bookmark.key_insights && bookmark.key_insights.length > 0 && (
            <div className="mb-4 border-l-2 border-brand-blue pl-3">
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

          {/* Action item with pending/done/skip toggle */}
          {bookmark.action_item && (
            <div className="mb-4 rounded-lg bg-surface-3 p-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onActionToggle(bookmark.id, isDone ? "pending" : "done");
                  }}
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition ${
                    isDone
                      ? "border-green-500 bg-green-500 text-black"
                      : "border-gray-600 hover:border-brand-blue"
                  }`}
                >
                  <CheckboxIcon checked={isDone} />
                </button>
                <span
                  className={`flex-1 text-sm ${
                    isDone ? "text-gray-500 line-through" : "text-gray-200"
                  }`}
                >
                  {bookmark.action_item}
                </span>
                {/* Skip button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onActionToggle(
                      bookmark.id,
                      bookmark.action_status === "skipped" ? "pending" : "skipped"
                    );
                  }}
                  className={`rounded px-2 py-0.5 text-[11px] font-medium transition ${
                    bookmark.action_status === "skipped"
                      ? "bg-gray-500/20 text-gray-300"
                      : "text-gray-500 hover:bg-gray-500/10 hover:text-gray-300"
                  }`}
                >
                  {bookmark.action_status === "skipped" ? "Unskip" : "Skip"}
                </button>
              </div>
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
