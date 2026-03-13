"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Bookmark, FilterState, ViewMode } from "@/lib/types";
import { StatsBar } from "./StatsBar";
import { SearchBar } from "./SearchBar";
import { FilterSidebar } from "./FilterSidebar";
import { BookmarkGrid } from "./BookmarkGrid";
import { ActionItemsView } from "./ActionItemsView";

export function DashboardShell() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    types: new Set(),
    categories: new Set(),
    actionStatus: null,
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch bookmarks
  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("bookmarks")
      .select("*")
      .order("saved_at", { ascending: false });

    if (fetchError) {
      setError("Couldn't connect to database. Check your connection and try again.");
      setLoading(false);
      return;
    }
    setBookmarks(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Compute stats from ALL bookmarks (not filtered)
  const stats = useMemo(() => {
    const typeCounts = { tweet: 0, thread: 0, article: 0 };
    let pendingActions = 0;
    for (const b of bookmarks) {
      if (b.type in typeCounts) typeCounts[b.type as keyof typeof typeCounts]++;
      if (b.action_item && b.action_status === "pending") pendingActions++;
    }
    return { total: bookmarks.length, typeCounts, pendingActions };
  }, [bookmarks]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const b of bookmarks) {
      if (b.category) cats.add(b.category);
    }
    return Array.from(cats).sort();
  }, [bookmarks]);

  // Filter bookmarks
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((b) => {
      // Search
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const matchesTitle = b.title?.toLowerCase().includes(q);
        const matchesText = b.full_text?.toLowerCase().includes(q);
        const matchesAuthor = b.author?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesText && !matchesAuthor) return false;
      }

      // Type filter
      if (filters.types.size > 0 && !filters.types.has(b.type)) return false;

      // Category filter
      if (filters.categories.size > 0) {
        if (!b.category || !filters.categories.has(b.category)) return false;
      }

      // Action status filter
      if (filters.actionStatus !== null) {
        if (b.action_status !== filters.actionStatus) return false;
      }

      return true;
    });
  }, [bookmarks, debouncedSearch, filters]);

  // Toggle card expansion
  function handleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  // Toggle action status
  async function handleActionToggle(id: string, newStatus: "pending" | "done" | "skipped") {
    // Optimistic update
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, action_status: newStatus } : b))
    );
    const { error } = await supabase
      .from("bookmarks")
      .update({ action_status: newStatus })
      .eq("id", id);
    if (error) {
      // Revert on failure
      fetchBookmarks();
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-brand-blue" />
          <p className="text-sm text-gray-400">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-4xl">⚠️</div>
          <p className="text-lg font-medium text-gray-300">{error}</p>
          <button
            onClick={fetchBookmarks}
            className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state (no bookmarks at all)
  if (bookmarks.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-5xl">📑</div>
          <h2 className="text-xl font-semibold text-gray-200">No bookmarks yet</h2>
          <p className="max-w-sm text-sm text-gray-500">
            Save some content from X using the Social Saver Pro extension, and they&apos;ll appear
            here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-surface px-6 py-4">
        <h1 className="text-xl font-bold text-white">
          Social Saver <span className="text-brand-blue">Pro</span>
        </h1>
      </header>

      <StatsBar
        total={stats.total}
        typeCounts={stats.typeCounts}
        pendingActions={stats.pendingActions}
      />

      <div className="flex">
        <FilterSidebar
          filters={filters}
          categories={categories}
          typeCounts={stats.typeCounts}
          onFilterChange={setFilters}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="min-w-0 flex-1">
          <SearchBar
            query={searchQuery}
            onSearch={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
            sidebarOpen={sidebarOpen}
          />

          {viewMode === "grid" ? (
            <BookmarkGrid
              bookmarks={filteredBookmarks}
              expandedId={expandedId}
              onExpand={handleExpand}
              onActionToggle={handleActionToggle}
            />
          ) : (
            <ActionItemsView
              bookmarks={filteredBookmarks}
              onToggle={handleActionToggle}
            />
          )}
        </main>
      </div>
    </div>
  );
}
