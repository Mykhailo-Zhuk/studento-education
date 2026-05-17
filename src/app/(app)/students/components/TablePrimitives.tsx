import {
  ArrowUp,
  ArrowDown,
  Minus,
  TrendingUp,
  Zap,
  ChevronsUpDown,
} from "lucide-react";
import type { SortKey, SortDir } from "../types";

export function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <ArrowUp size={14} className="text-success" />;
  if (trend === "down")
    return <ArrowDown size={14} className="text-error" />;
  return <Minus size={14} className="text-text-muted" />;
}

export function StatIcon({ iconName }: { iconName?: string }) {
  if (iconName === "trending")
    return <TrendingUp size={20} className="text-primary" />;
  if (iconName === "zap")
    return <Zap size={20} className="text-secondary" fill="#006b5f" />;
  return null;
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
      className={`${TH_BASE} cursor-pointer select-none group hover:bg-[#f1f5f9]`}
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

export function HomeworkDots({ scores }: { scores: string | null }) {
  if (!scores) return <span className="text-[14px] text-text-muted">—</span>;
  const items = scores
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "");
  if (items.length === 0)
    return <span className="text-[14px] text-text-muted">—</span>;
  return (
    <div className="flex items-center">
      {items.map((v, i) => (
        <div
          key={i}
          title={`HW ${i + 1}: ${v === "1" ? "Done" : "Not done"}`}
          className={`w-5 h-5 rounded-full border-2 border-white shrink-0 ${i > 0 ? "-ml-2" : ""} ${v === "1" ? "bg-success" : "bg-border-light"}`}
        />
      ))}
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
