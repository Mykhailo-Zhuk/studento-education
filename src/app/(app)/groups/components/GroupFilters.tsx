"use client";

import { Filter } from "lucide-react";
import { GROUP_TYPES } from "../types";

interface Props {
  filterType: string | null;
  onChange: (value: string | null) => void;
  shownCount: number;
}

export default function GroupFilters({
  filterType,
  onChange,
  shownCount,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
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

      <div className="ml-auto flex items-center gap-3">
        <span className="text-[12px] text-text-muted">
          Showing {shownCount} group{shownCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
