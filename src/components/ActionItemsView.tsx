"use client";

import { Bookmark } from "@/lib/types";
import { truncate, getCategoryColor } from "@/lib/utils";

interface ActionItemsViewProps {
  bookmarks: Bookmark[];
  onToggle: (id: string, status: "pending" | "done" | "skipped") => void;
  onMarkAllDone: () => void;
}

export function ActionItemsView({ bookmarks, onToggle, onMarkAllDone }: ActionItemsViewProps) {
  const actionBookmarks = bookmarks
    .filter((b) => b.action_item)
    .sort((a, b) => {
      const order = { pending: 0, done: 1, skipped: 2 };
      return order[a.action_status] - order[b.action_status];
    });

  const pendingCount = actionBookmarks.filter((b) => b.action_status === "pending").length;

  if (actionBookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-3 text-4xl">✅</div>
        <p className="text-lg font-medium text-gray-400">No action items yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Save and categorize bookmarks to see tasks here.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-2 p-4">
      {/* Mark all done button */}
      {pendingCount > 0 && (
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            {pendingCount} pending action{pendingCount !== 1 ? "s" : ""}
          </span>
          <button
            onClick={onMarkAllDone}
            className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:bg-surface-3 hover:text-white"
          >
            Mark all done
          </button>
        </div>
      )}

      {actionBookmarks.map((bookmark) => {
        const isDone = bookmark.action_status === "done";
        const isSkipped = bookmark.action_status === "skipped";
        const nextStatus = isDone ? "pending" : "done";

        return (
          <div
            key={bookmark.id}
            className={`flex items-start gap-3 rounded-lg border p-4 transition ${
              isDone
                ? "border-green-900/50 bg-green-950/20"
                : isSkipped
                ? "border-gray-800 bg-surface-2 opacity-60"
                : "border-blue-900/50 bg-surface-2"
            }`}
          >
            {/* Toggle checkbox */}
            <button
              onClick={() => onToggle(bookmark.id, nextStatus)}
              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition ${
                isDone
                  ? "border-green-500 bg-green-500 text-black"
                  : "border-gray-600 hover:border-brand-blue"
              }`}
            >
              {isDone && (
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

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium ${
                  isDone ? "text-gray-500 line-through" : "text-white"
                }`}
              >
                {bookmark.action_item}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                From: {truncate(bookmark.title, 60)} — {bookmark.author_handle?.startsWith("@") ? bookmark.author_handle : `@${bookmark.author_handle}`}
              </p>
            </div>

            {/* Category badge */}
            {bookmark.category && (
              <span
                className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${getCategoryColor(bookmark.category)}`}
              >
                {bookmark.category}
              </span>
            )}

            {/* Status badge */}
            <span
              className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                isDone
                  ? "bg-green-500/15 text-green-400"
                  : isSkipped
                  ? "bg-gray-500/15 text-gray-400"
                  : "bg-amber-500/15 text-amber-400"
              }`}
            >
              {bookmark.action_status}
            </span>
          </div>
        );
      })}
    </div>
  );
}
