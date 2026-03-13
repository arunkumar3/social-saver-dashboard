"use client";

import { ViewMode } from "@/lib/types";

interface SearchBarProps {
  query: string;
  onSearch: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function SearchBar({
  query,
  onSearch,
  viewMode,
  onViewModeChange,
  onToggleSidebar,
  sidebarOpen,
}: SearchBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-gray-800 bg-surface-2 px-4 py-3">
      {/* Mobile sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:bg-surface-3 hover:text-white md:hidden"
        aria-label="Toggle filters"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M3 5h14M3 10h14M3 15h14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Search input */}
      <div className="relative min-w-0 flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search bookmarks..."
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-surface-3 py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-brand-blue"
        />
      </div>

      {/* View toggle */}
      <div className="flex rounded-lg border border-gray-700">
        <button
          onClick={() => onViewModeChange("grid")}
          className={`rounded-l-lg px-3 py-2 text-sm transition ${
            viewMode === "grid"
              ? "bg-brand-blue text-white"
              : "text-gray-400 hover:bg-surface-3 hover:text-white"
          }`}
        >
          All Bookmarks
        </button>
        <button
          onClick={() => onViewModeChange("actions")}
          className={`rounded-r-lg px-3 py-2 text-sm transition ${
            viewMode === "actions"
              ? "bg-brand-blue text-white"
              : "text-gray-400 hover:bg-surface-3 hover:text-white"
          }`}
        >
          Action Items
        </button>
      </div>
    </div>
  );
}
