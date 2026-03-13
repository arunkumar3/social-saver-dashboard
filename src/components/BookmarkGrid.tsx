"use client";

import { Bookmark } from "@/lib/types";
import { BookmarkCard } from "./BookmarkCard";

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  expandedId: string | null;
  onExpand: (id: string) => void;
  onActionToggle: (id: string, status: "pending" | "done" | "skipped") => void;
}

export function BookmarkGrid({ bookmarks, expandedId, onExpand, onActionToggle }: BookmarkGridProps) {
  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-3 text-4xl">🔍</div>
        <p className="text-lg font-medium text-gray-400">No bookmarks match your filters</p>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          isExpanded={expandedId === bookmark.id}
          onExpand={onExpand}
          onActionToggle={onActionToggle}
        />
      ))}
    </div>
  );
}
