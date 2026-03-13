"use client";

import { useState } from "react";
import { FilterState } from "@/lib/types";
import { getTypeIcon, getCategoryColor } from "@/lib/utils";

interface FilterSidebarProps {
  filters: FilterState;
  categories: string[];
  typeCounts: { tweet: number; thread: number; article: number };
  onFilterChange: (filters: FilterState) => void;
  open: boolean;
  onClose: () => void;
}

const TYPES = ["tweet", "thread", "article"] as const;
const MAIN_CATEGORIES = [
  "AI/ML & Tech",
  "Trading & Finance",
  "AI Project Ideas",
  "Career & Productivity",
];
const ACTION_STATUSES = [
  { value: null, label: "All" },
  { value: "pending", label: "Pending" },
  { value: "done", label: "Done" },
  { value: "skipped", label: "Skipped" },
] as const;

export function FilterSidebar({
  filters,
  categories,
  typeCounts,
  onFilterChange,
  open,
  onClose,
}: FilterSidebarProps) {
  const [otherExpanded, setOtherExpanded] = useState(false);

  // Split categories into main and other
  const mainCats = categories.filter((c) =>
    MAIN_CATEGORIES.some((mc) => c.startsWith(mc.split(" ")[0]))
  );
  const otherCats = categories.filter(
    (c) => !MAIN_CATEGORIES.some((mc) => c.startsWith(mc.split(" ")[0]))
  );

  function toggleType(type: string) {
    const next = new Set(filters.types);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    onFilterChange({ ...filters, types: next });
  }

  function toggleCategory(cat: string) {
    const next = new Set(filters.categories);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    onFilterChange({ ...filters, categories: next });
  }

  function toggleAllOther() {
    const next = new Set(filters.categories);
    const allSelected = otherCats.every((c) => next.has(c));
    if (allSelected) {
      otherCats.forEach((c) => next.delete(c));
    } else {
      otherCats.forEach((c) => next.add(c));
    }
    onFilterChange({ ...filters, categories: next });
  }

  function setActionStatus(status: string | null) {
    onFilterChange({ ...filters, actionStatus: status });
  }

  function clearAll() {
    onFilterChange({
      types: new Set(),
      categories: new Set(),
      actionStatus: null,
    });
  }

  const hasActiveFilters =
    filters.types.size > 0 || filters.categories.size > 0 || filters.actionStatus !== null;

  const sidebar = (
    <div className="flex h-full w-64 flex-col border-r border-gray-800 bg-surface-2 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-300">Filters</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-white md:hidden">
          ✕
        </button>
      </div>

      {/* Type filter */}
      <div className="mb-6">
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">Type</h3>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((type) => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${
                filters.types.size === 0 || filters.types.has(type)
                  ? "bg-brand-blue/20 text-brand-blue"
                  : "bg-surface-3 text-gray-500 hover:text-gray-300"
              }`}
            >
              <span>{getTypeIcon(type)}</span>
              <span className="capitalize">{type}</span>
              <span className="ml-1 text-[10px] opacity-70">
                {typeCounts[type as keyof typeof typeCounts]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            Category
          </h3>
          <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
            {/* Main categories */}
            {mainCats.map((cat) => (
              <label
                key={cat}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-surface-3"
              >
                <input
                  type="checkbox"
                  checked={filters.categories.size === 0 || filters.categories.has(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="accent-brand-blue"
                />
                <span className={`inline-block h-2 w-2 rounded-full ${getCategoryColor(cat).split(" ")[0].replace("/15", "")}`} />
                <span className="text-gray-300">{cat}</span>
              </label>
            ))}

            {/* Other categories — grouped */}
            {otherCats.length > 0 && (
              <div className="mt-1">
                <button
                  onClick={() => setOtherExpanded(!otherExpanded)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1 text-sm text-gray-400 hover:bg-surface-3 hover:text-gray-200"
                >
                  <span className="text-[10px]">{otherExpanded ? "▼" : "▶"}</span>
                  <span>Other ({otherCats.length})</span>
                </button>

                {otherExpanded && (
                  <div className="ml-2 mt-1 flex flex-col gap-1 border-l border-gray-700 pl-2">
                    {/* Toggle all others */}
                    <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs hover:bg-surface-3">
                      <input
                        type="checkbox"
                        checked={otherCats.every(
                          (c) => filters.categories.size === 0 || filters.categories.has(c)
                        )}
                        onChange={toggleAllOther}
                        className="accent-brand-blue"
                      />
                      <span className="text-gray-400 italic">Select all</span>
                    </label>
                    {otherCats.map((cat) => (
                      <label
                        key={cat}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs hover:bg-surface-3"
                      >
                        <input
                          type="checkbox"
                          checked={filters.categories.size === 0 || filters.categories.has(cat)}
                          onChange={() => toggleCategory(cat)}
                          className="accent-brand-blue"
                        />
                        <span className="text-gray-300">
                          {cat.startsWith("Other: ") ? cat.slice(7) : cat}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action status filter */}
      <div className="mb-6">
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
          Action Status
        </h3>
        <div className="flex flex-col gap-1">
          {ACTION_STATUSES.map(({ value, label }) => (
            <button
              key={label}
              onClick={() => setActionStatus(value)}
              className={`rounded px-3 py-1.5 text-left text-sm transition ${
                filters.actionStatus === value
                  ? "bg-brand-blue/20 text-brand-blue"
                  : "text-gray-400 hover:bg-surface-3 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear all */}
      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="mt-auto rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-400 transition hover:bg-surface-3 hover:text-white"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block">{sidebar}</div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <div className="absolute left-0 top-0 h-full">{sidebar}</div>
        </div>
      )}
    </>
  );
}
