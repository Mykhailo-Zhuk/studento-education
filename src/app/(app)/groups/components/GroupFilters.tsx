"use client";

import { Filter, Search } from "lucide-react";
import { GROUP_TYPES } from "../types";

interface Props {
  filterType: string | null;
  onChange: (value: string | null) => void;
  shownCount: number;
  search: string;
  onSearchChange: (v: string) => void;
}

export default function GroupFilters({
  filterType,
  onChange,
  shownCount,
  search,
  onSearchChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* Search row */}
      <div className="flex items-center gap-3 px-3 py-2 bg-white border border-border-light rounded-lg">
        <Search size={16} className="text-text-muted shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search groups..."
          className="bg-transparent outline-none text-[14px] flex-1 placeholder:text-text-muted"
        />
      </div>
      {/* Type filters row */}
      <div className="flex flex-wrap gap-3 items-center">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm cursor-pointer transition-colors ${
          filterType === null
            ? "bg-primary text-white border-primary"
            : "bg-white border-border-light hover:bg-surface-container-low"
        }`}
      >
        <Filter
          size={16}
          className={filterType === null ? "text-white" : "text-primary"}
        />
        <span className="text-[13px] font-semibold">All</span>
      </button>

      {GROUP_TYPES.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(filterType === t ? null : t)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm cursor-pointer transition-colors ${
            filterType === t
              ? "bg-primary text-white border-primary"
              : "bg-white border-border-light hover:bg-surface-container-low"
          }`}
        >
          <span className="text-[13px]">{t}</span>
        </button>
      ))}

        <span className="ml-auto text-[12px] text-text-muted">Showing {shownCount}</span>
      </div>
    </div>
  );
}
