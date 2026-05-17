"use client";

import { Search, RotateCcw, XCircle } from "lucide-react";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  groupFilter: string;
  onGroupChange: (v: string) => void;
  typeFilter: string;
  onTypeChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  groups: string[];
  types: string[];
  onReset: () => void;
}

export default function HomeworkFilters({
  search,
  onSearchChange,
  groupFilter,
  onGroupChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
  groups,
  types,
  onReset,
}: Props) {
  return (
    <div className="bg-white p-4 rounded-xl border border-border-light shadow-sm mb-6 flex flex-wrap gap-3 items-center justify-between">
      <div className="flex flex-1 min-w-[300px] items-center gap-3 px-3 py-2 bg-surface-gray-light border border-border-light rounded-lg">
        <Search size={16} className="text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title or date..."
          className="bg-transparent border-none focus:ring-0 w-full text-[14px] outline-none placeholder:text-text-muted"
        />
      </div>
      <div className="flex gap-3">
        <select
          value={groupFilter}
          onChange={(e) => onGroupChange(e.target.value)}
          className="px-3 py-2 border border-border-light rounded-lg text-[14px] text-text-primary focus:ring-primary focus:border-primary outline-none bg-white"
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
          className="px-3 py-2 border border-border-light rounded-lg text-[14px] text-text-primary focus:ring-primary focus:border-primary outline-none bg-white"
        >
          <option value="all">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 border border-border-light rounded-lg text-[14px] text-text-primary focus:ring-primary focus:border-primary outline-none bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="planning">Planning</option>
          <option value="completed">Completed</option>
        </select>
        <button
          onClick={onReset}
          title="Reset filters"
          className="p-2 border border-border-light rounded-lg hover:bg-surface-gray-light text-text-secondary"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}
