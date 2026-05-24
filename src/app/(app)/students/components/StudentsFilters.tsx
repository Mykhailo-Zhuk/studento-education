"use client";

import { useState, useRef, useEffect } from "react";
import { Search, RotateCcw, Columns3 } from "lucide-react";
import { COLUMN_DEFS, type ColumnId } from "../types";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  groupFilter: string;
  onGroupChange: (v: string) => void;
  gradeFilter: string;
  onGradeChange: (v: string) => void;
  uniqueGroups: string[];
  onReset: () => void;
  visibleCols: Set<ColumnId>;
  onToggleCol: (id: ColumnId) => void;
}

export default function StudentsFilters({
  search,
  onSearchChange,
  groupFilter,
  onGroupChange,
  gradeFilter,
  onGradeChange,
  uniqueGroups,
  onReset,
  visibleCols,
  onToggleCol,
}: Props) {
  const [colPickerOpen, setColPickerOpen] = useState(false);
  const colPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        colPickerRef.current &&
        !colPickerRef.current.contains(e.target as Node)
      ) {
        setColPickerOpen(false);
      }
    }
    if (colPickerOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [colPickerOpen]);

  return (
    <div className="bg-white p-3 sm:p-4 rounded-xl border border-border-light shadow-sm mb-6 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-center justify-between">
      <div className="flex flex-1 min-w-0 sm:min-w-[280px] items-center gap-3 px-3 py-2 bg-surface-gray-light border border-border-light rounded-lg">
        <Search size={16} className="text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or contact..."
          className="bg-transparent border-none focus:ring-0 w-full text-[14px] outline-none placeholder:text-text-muted"
        />
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <div className="min-w-36">
          <CustomSelect
            value={groupFilter}
            onChange={onGroupChange}
            options={[
              { value: "All Groups", label: "All Groups" },
              ...uniqueGroups.map((g) => ({ value: g, label: g })),
            ]}
          />
        </div>
        <div className="min-w-36">
          <CustomSelect
            value={gradeFilter}
            onChange={onGradeChange}
            options={[
              { value: "All Grades", label: "All Grades" },
              { value: "A (90-100)", label: "A (90-100)" },
              { value: "B (80-89)", label: "B (80-89)" },
              { value: "C (70-79)", label: "C (70-79)" },
            ]}
          />
        </div>
        <button
          onClick={onReset}
          title="Reset filters"
          className="p-2 border border-border-light rounded-lg hover:bg-surface-gray-light text-text-secondary"
        >
          <RotateCcw size={16} />
        </button>

        <div className="relative" ref={colPickerRef}>
          <button
            onClick={() => setColPickerOpen((v) => !v)}
            title="Choose columns"
            className={`p-2 border rounded-lg transition-colors text-text-secondary ${
              colPickerOpen
                ? "border-primary bg-[#f3e8ff] text-primary"
                : "border-border-light hover:bg-surface-gray-light"
            }`}
          >
            <Columns3 size={16} />
          </button>
          {colPickerOpen && (
            <div className="absolute right-0 top-10 z-30 bg-white border border-border-light rounded-xl shadow-lg py-2 w-44">
              <p className="px-3 py-1 text-[11px] font-semibold text-text-muted uppercase tracking-widest">
                Колонки
              </p>
              {COLUMN_DEFS.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-surface-gray-light cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={visibleCols.has(c.id)}
                    onChange={() => onToggleCol(c.id)}
                    className="accent-primary w-3.5 h-3.5"
                  />
                  <span className="text-[13px] text-text-primary">{c.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
