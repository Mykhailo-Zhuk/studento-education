"use client";

import { Search, RotateCcw } from "lucide-react";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  groupFilter: string;
  onGroupChange: (v: string) => void;
  typeFilter: string;
  onTypeChange: (v: string) => void;
  groups: string[];
  types: string[];
  onReset: () => void;
}

const selectCls =
  "px-3 py-2 border border-border-light rounded-lg text-[14px] text-text-primary focus:ring-primary focus:border-primary outline-none bg-white w-full sm:w-auto";

export default function LessonFilters({
  search,
  onSearchChange,
  groupFilter,
  onGroupChange,
  typeFilter,
  onTypeChange,
  groups,
  types,
  onReset,
}: Props) {
  return (
    <div className="bg-white p-4 rounded-xl border border-border-light shadow-sm flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex w-full sm:flex-1 sm:min-w-50 items-center gap-3 px-3 py-2 bg-surface-gray-light border border-border-light rounded-lg">
        <Search size={16} className="text-text-muted shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, group or date…"
          className="bg-transparent border-none focus:ring-0 w-full text-[14px] outline-none placeholder:text-text-muted"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
        <select
          value={groupFilter}
          onChange={(e) => onGroupChange(e.target.value)}
          className={selectCls}
        >
          <option value="all">All Groups</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
          className={selectCls}
        >
          <option value="all">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          onClick={onReset}
          title="Reset filters"
          className="p-2 border border-border-light rounded-lg hover:bg-surface-gray-light text-text-secondary w-full sm:w-auto flex items-center justify-center"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}
