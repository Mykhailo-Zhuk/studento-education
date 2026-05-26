"use client";

import { useRef, useState } from "react";
import { Filter, Search, X } from "lucide-react";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function openSearch() {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function closeSearch() {
    setSearchOpen(false);
    onSearchChange("");
  }

  function handleBlur() {
    if (!search) setSearchOpen(false);
  }

  return (
    <div className="flex flex-wrap gap-3 items-center mb-6">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm cursor-pointer transition-colors ${
          filterType === null
            ? "bg-primary text-white border-primary"
            : "bg-white border-border-light hover:bg-surface-container-low"
        }`}
      >
        <Filter size={16} className={filterType === null ? "text-white" : "text-primary"} />
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

      {searchOpen ? (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-border-light rounded-full shadow-sm">
          <Search size={14} className="text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="Search groups..."
            className="bg-transparent outline-none text-[13px] w-40 placeholder:text-text-muted"
          />
          <button onClick={closeSearch} className="text-text-muted hover:text-primary transition-colors shrink-0">
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={openSearch}
          className="p-2 rounded-full border border-border-light bg-white shadow-sm hover:bg-surface-container-low transition-colors text-text-muted hover:text-primary"
        >
          <Search size={16} />
        </button>
      )}
    </div>
  );
}
