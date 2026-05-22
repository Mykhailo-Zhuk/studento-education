"use client";

import { Search, RotateCcw } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

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
    <div className="bg-white p-4 rounded-xl border border-border-light shadow-sm flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex w-full sm:flex-1 sm:min-w-50 items-center gap-3 px-3 py-2 bg-surface-gray-light border border-border-light rounded-lg">
        <Search size={16} className="text-text-muted shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title or date..."
          className="bg-transparent border-none focus:ring-0 w-full text-[14px] outline-none placeholder:text-text-muted"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
        <div className="min-w-36">
          <CustomSelect
            value={groupFilter}
            onChange={onGroupChange}
            options={[
              { value: "all", label: "All Groups" },
              ...groups.map((g) => ({ value: g, label: g })),
            ]}
          />
        </div>
        <div className="min-w-36">
          <CustomSelect
            value={typeFilter}
            onChange={onTypeChange}
            options={[
              { value: "all", label: "All Types" },
              ...types.map((t) => ({ value: t, label: t })),
            ]}
          />
        </div>
        <div className="min-w-36">
          <CustomSelect
            value={statusFilter}
            onChange={onStatusChange}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "planning", label: "Planning" },
              { value: "completed", label: "Completed" },
            ]}
          />
        </div>
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
