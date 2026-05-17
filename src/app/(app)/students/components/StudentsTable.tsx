"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  GitBranch,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  SortTh,
  TH_BASE,
  TrendIcon,
  HomeworkDots,
  formatDisplayDate,
} from "./TablePrimitives";
import {
  TYPE_COLOR,
  COLUMN_DEFS,
  PAGE_SIZE,
  type StudentRow,
  type ColumnId,
  type SortKey,
  type SortDir,
} from "../types";

interface Props {
  paginated: StudentRow[];
  totalCount: number;
  visibleCols: Set<ColumnId>;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  safePage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onEdit: (s: StudentRow) => void;
  onDelete: (id: string) => void;
}

export default function StudentsTable({
  paginated,
  totalCount,
  visibleCols,
  sortKey,
  sortDir,
  onSort,
  safePage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}: Props) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const col = (id: ColumnId) => visibleCols.has(id);
  const totalCols =
    2 + COLUMN_DEFS.filter((c) => visibleCols.has(c.id)).length;

  useEffect(() => {
    if (!openMenuId) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [openMenuId]);

  return (
    <>
      <div className="md:hidden space-y-4">
        {paginated.length === 0 ? (
          <div className="bg-white rounded-xl border border-border-light shadow-sm p-6 text-center text-[14px] text-text-muted">
            No students match your filters.
          </div>
        ) : (
          paginated.map((s) => (
            <article key={s.id} className="bg-white rounded-2xl border border-border-light shadow-sm p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0"
                  style={{ background: `linear-gradient(135deg, ${s.gradientFrom}, ${s.gradientTo})` }}
                >
                  {s.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[16px] font-semibold text-text-primary truncate">{s.name}</h3>
                  <p className="text-[12px] text-text-muted truncate">{s.contact}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-[12px] whitespace-nowrap ${s.groupColor}`}>{s.group}</span>
                    <span className={`px-3 py-1 rounded-full text-[12px] whitespace-nowrap ${TYPE_COLOR[s.type] ?? "bg-gray-50 text-gray-500 border border-gray-200"}`}>{s.type}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div>
                  <p className="text-text-muted uppercase tracking-wider text-[10px] font-semibold">HW Score</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-semibold text-text-primary">{s.grade}</span>
                    <TrendIcon trend={s.gradeTrend} />
                  </div>
                </div>
                <div>
                  <p className="text-text-muted uppercase tracking-wider text-[10px] font-semibold">Status</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${s.statusDot}`} />
                    <span className={`font-semibold ${s.statusColor}`}>{s.statusLabel}</span>
                  </div>
                </div>
                <div>
                  <p className="text-text-muted uppercase tracking-wider text-[10px] font-semibold">Started</p>
                  <p className="mt-1 text-text-secondary">{formatDisplayDate(s.started)}</p>
                </div>
                <div>
                  <p className="text-text-muted uppercase tracking-wider text-[10px] font-semibold">Finished</p>
                  <p className="mt-1 text-text-secondary">{formatDisplayDate(s.finished)}</p>
                </div>
              </div>

              <div className="space-y-2 text-[13px]">
                <div className="truncate">
                  <span className="text-text-muted">GitHub: </span>
                  {s.githubUsername ? (
                    <a href={`https://github.com/${s.githubUsername}`} target="_blank" rel="noreferrer" className="text-primary underline">
                      {s.githubUsername}
                    </a>
                  ) : (
                    <span className="text-text-secondary">—</span>
                  )}
                </div>
                <div>
                  <span className="text-text-muted">Notes: </span>
                  <span className="text-text-secondary">{s.notes ?? "—"}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => onEdit(s)}
                  className="px-4 py-2 rounded-xl border border-border-light text-[13px] font-semibold text-text-primary hover:bg-surface-gray-light transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(s.id)}
                  className="px-4 py-2 rounded-xl border border-error text-[13px] font-semibold text-error hover:bg-error-light transition-colors"
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="hidden md:block bg-white rounded-xl border border-border-light shadow-sm overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-gray-light border-b border-border-light">
              <SortTh label="Student Name" sortKey="name" currentKey={sortKey} dir={sortDir} onSort={onSort} />
              {col("group") && <SortTh label="Group" sortKey="group" currentKey={sortKey} dir={sortDir} onSort={onSort} />}
              {col("type") && <SortTh label="Type" sortKey="type" currentKey={sortKey} dir={sortDir} onSort={onSort} />}
              {col("grade") && <SortTh label="HW Score" sortKey="gradeNum" currentKey={sortKey} dir={sortDir} onSort={onSort} />}
              {col("hw_count") && <th className={TH_BASE}># HW</th>}
              {col("homework") && <th className={TH_BASE}>Homework</th>}
              {col("status") && <SortTh label="Status" sortKey="statusLabel" currentKey={sortKey} dir={sortDir} onSort={onSort} />}
              {col("started") && <SortTh label="Started" sortKey="started" currentKey={sortKey} dir={sortDir} onSort={onSort} />}
              {col("finished") && <SortTh label="Finished" sortKey="finished" currentKey={sortKey} dir={sortDir} onSort={onSort} />}
              {col("github") && <th className={TH_BASE}>GitHub</th>}
              {col("notes") && <th className={TH_BASE}>Notes</th>}
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="px-6 py-10 text-center text-[14px] text-text-muted">
                  No students match your filters.
                </td>
              </tr>
            ) : (
              paginated.map((s) => (
                <tr key={s.id} className="hover:bg-surface-gray-light transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold"
                          style={{ background: `linear-gradient(135deg, ${s.gradientFrom}, ${s.gradientTo})` }}
                        >
                          {s.initials}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${s.statusOnline} border-2 border-white rounded-full`} />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-text-primary whitespace-nowrap">{s.name}</p>
                        <p className="text-[12px] text-text-muted">{s.contact}</p>
                      </div>
                    </div>
                  </td>

                  {col("group") && (
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[13px] whitespace-nowrap ${s.groupColor}`}>{s.group}</span>
                    </td>
                  )}
                  {col("type") && (
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[13px] whitespace-nowrap ${TYPE_COLOR[s.type] ?? "bg-gray-50 text-gray-500 border border-gray-200"}`}>{s.type}</span>
                    </td>
                  )}
                  {col("grade") && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-semibold text-text-primary">{s.grade}</span>
                        <TrendIcon trend={s.gradeTrend} />
                      </div>
                    </td>
                  )}
                  {col("hw_count") && (
                    <td className="px-6 py-4 text-[15px] font-semibold text-text-primary">
                      {s.homeworkScores
                        ? s.homeworkScores.split(",").filter((v) => v.trim() !== "").length
                        : "—"}
                    </td>
                  )}
                  {col("homework") && (
                    <td className="px-6 py-4"><HomeworkDots scores={s.homeworkScores} /></td>
                  )}
                  {col("status") && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${s.statusDot}`} />
                        <span className={`text-[14px] font-semibold whitespace-nowrap ${s.statusColor}`}>{s.statusLabel}</span>
                      </div>
                    </td>
                  )}
                  {col("started") && (
                    <td className="px-6 py-4 text-[14px] text-text-secondary whitespace-nowrap">{formatDisplayDate(s.started)}</td>
                  )}
                  {col("finished") && (
                    <td className="px-6 py-4 text-[14px] text-text-secondary whitespace-nowrap">{formatDisplayDate(s.finished)}</td>
                  )}
                  {col("github") && (
                    <td className="px-6 py-4">
                      {s.githubUsername ? (
                        <a href={`https://github.com/${s.githubUsername}`} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-[14px] text-primary hover:underline whitespace-nowrap">
                          <GitBranch size={14} />
                          {s.githubUsername}
                        </a>
                      ) : (
                        <span className="text-[14px] text-text-muted">—</span>
                      )}
                    </td>
                  )}
                  {col("notes") && (
                    <td className="px-6 py-4 max-w-[220px]">
                      <p className="text-[14px] text-text-secondary truncate" title={s.notes ?? ""}>{s.notes ?? "—"}</p>
                    </td>
                  )}

                  <td className="px-6 py-4 text-right">
                    <div ref={openMenuId === s.id ? menuRef : null} className="relative inline-block">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === s.id ? null : s.id)}
                        className="p-2 text-text-muted hover:text-primary transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenuId === s.id && (
                        <div className="absolute right-0 top-9 z-20 bg-white border border-border-light rounded-lg shadow-lg py-1 min-w-[130px]">
                          <button
                            onClick={() => { onEdit(s); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[14px] text-text-primary hover:bg-surface-gray-light"
                          >
                            <Pencil size={14} className="text-text-secondary" /> Edit
                          </button>
                          <button
                            onClick={() => { onDelete(s.id); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[14px] text-error hover:bg-error-light"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <p className="text-[14px] text-text-muted">
          Showing {totalCount === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} to{" "}
          {Math.min(safePage * PAGE_SIZE, totalCount)} of {totalCount} students
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onPageChange(Math.max(1, safePage - 1))}
            disabled={safePage === 1}
            className="w-8 h-8 flex items-center justify-center rounded border border-border-light text-text-muted hover:bg-surface-gray-light disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 flex items-center justify-center rounded text-[14px] ${
                p === safePage
                  ? "bg-primary text-white"
                  : "border border-border-light text-text-muted hover:bg-surface-gray-light"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
            disabled={safePage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded border border-border-light text-text-muted hover:bg-surface-gray-light disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
