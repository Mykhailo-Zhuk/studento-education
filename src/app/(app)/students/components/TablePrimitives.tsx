import {
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronsUpDown,
} from "lucide-react";
import type { SortKey, SortDir } from "../types";
import type { Homework } from "@/lib/types";

export { CustomSelect } from "@/components/ui/CustomSelect";

export function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <ArrowUp size={14} className="text-success" />;
  if (trend === "down")
    return <ArrowDown size={14} className="text-error" />;
  return <Minus size={14} className="text-text-muted" />;
}

export const TH_BASE =
  "px-6 py-3 text-[12px] font-semibold text-text-secondary uppercase tracking-widest whitespace-nowrap";

export function SortTh({
  label,
  sortKey,
  currentKey,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = sortKey === currentKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      className={`${TH_BASE} cursor-pointer select-none group hover:bg-surface-gray-light dark:hover:bg-surface-gray-dark`}
    >
      <div className="flex items-center gap-1">
        {label}
        <span
          className={
            active
              ? "text-primary"
              : "text-[#cbd5e1] group-hover:text-text-muted"
          }
        >
          {active ? (
            dir === "asc" ? (
              <ArrowUp size={11} />
            ) : (
              <ArrowDown size={11} />
            )
          ) : (
            <ChevronsUpDown size={11} />
          )}
        </span>
      </div>
    </th>
  );
}

export function HomeworkDots({
  records,
  homeworkMap = {},
}: {
  records: import("@/lib/types").StudentHomeworkRecord[];
  homeworkMap?: Record<string, Homework>;
}) {
  if (records.length === 0)
    return <span className="text-[14px] text-text-muted">—</span>;
  return (
    <div className="flex items-center">
      {records.map((r, i) => {
        const hw = r.homework_id ? homeworkMap[r.homework_id] : null;
        const label = hw ? `${hw.title} (${r.date})` : r.date;
        return (
          <div
            key={r.id}
            title={`${label}: ${r.completed ? "Done" : "Not done"}`}
            className={`w-5 h-5 rounded-full border-2 border-white shrink-0 ${i > 0 ? "-ml-2" : ""} ${r.completed ? "bg-success" : "bg-border-light"}`}
          />
        );
      })}
    </div>
  );
}

export function formatDisplayDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}-${date.getFullYear()}`;
}
