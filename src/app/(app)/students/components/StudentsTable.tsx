"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  GitBranch,
  Pencil,
  Trash2,
  X,
  Star,
} from "lucide-react";
import type { StudentHomeworkRecord, Homework } from "@/lib/types";
import {
  CustomSelect,
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

interface HwPopupState {
  studentId: string;
  studentGroup: string;
  completed: boolean;
  top: number;
  left: number;
}

interface HwListState {
  studentId: string;
  top: number;
  left: number;
}

interface HwDetailState {
  record: StudentHomeworkRecord;
  homework: Homework | null;
}

// ─── Custom select ────────────────────────────────────────────────────────────

// ─── Add-homework popup ───────────────────────────────────────────────────────

function formatHwDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

function HomeworkPopup({
  homeworks,
  completed,
  top,
  left,
  onSubmit,
  onClose,
}: {
  homeworks: Homework[];
  completed: boolean;
  top: number;
  left: number;
  onSubmit: (date: string, hwId: string | null) => void;
  onClose: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [hwId, setHwId] = useState(homeworks[0]?.id ?? "");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [onClose]);

  function handleSubmit() {
    const selectedHw = homeworks.find((h) => h.id === hwId);
    const date = selectedHw?.date ?? today;
    onSubmit(date, hwId || null);
  }

  return createPortal(
    <div
      ref={ref}
      style={{ position: "fixed", top, left }}
      className="z-50 bg-white border border-border-light rounded-xl shadow-xl p-3 w-80 modal-panel"
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-[12px] font-semibold ${completed ? "text-success" : "text-error"}`}
        >
          {completed ? "Mark as Done" : "Mark as Missed"}
        </span>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-primary transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
        Homework
      </label>
      <div className="mb-3">
        <CustomSelect
          value={hwId}
          onChange={setHwId}
          options={[
            { value: "", label: "— No specific HW —" },
            ...homeworks.map((hw) => ({
              value: hw.id,
              label: `${hw.title} (${formatHwDate(hw.date)})`,
            })),
          ]}
        />
      </div>

      <button
        onClick={handleSubmit}
        className={`w-full py-1.5 rounded-lg text-[13px] font-semibold text-white transition-colors ${
          completed
            ? "bg-success hover:bg-success/80"
            : "bg-error hover:bg-error/80"
        }`}
      >
        Confirm
      </button>
    </div>,
    document.body,
  );
}

// ─── Homework list popup (manage / delete) ────────────────────────────────────

function HomeworkListPopup({
  records,
  homeworkMap,
  top,
  left,
  onDelete,
  onSelect,
  onClose,
}: {
  records: StudentHomeworkRecord[];
  homeworkMap: Record<string, Homework>;
  top: number;
  left: number;
  onDelete: (recordId: string) => void;
  onSelect: (record: StudentHomeworkRecord, homework: Homework | null) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      style={{ position: "fixed", top, left }}
      className="z-9999 bg-white border border-border-light rounded-xl shadow-xl w-100 overflow-hidden modal-panel"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
        <span className="text-[13px] font-semibold text-text-primary">
          Homework Records
        </span>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-primary transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {records.length === 0 ? (
        <p className="px-4 py-4 text-[13px] text-text-muted">No records yet.</p>
      ) : (
        <ul className="max-h-64 overflow-y-auto divide-y divide-border-light">
          {records.map((r) => {
            const hw = r.homework_id ? homeworkMap[r.homework_id] : null;
            return (
              <li
                key={r.id}
                className="flex items-center gap-2 px-4 py-2.5 hover:bg-surface-gray-light group"
              >
                <button
                  className="flex-1 flex items-center gap-2 text-left min-w-0"
                  onClick={() => onSelect(r, hw)}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${r.completed ? "bg-success" : "bg-error"}`}
                  />
                  <span className="text-[13px] text-text-primary truncate">
                    {hw ? hw.title : "—"}
                  </span>
                  <span className="text-[11px] text-text-muted shrink-0 ml-auto pl-2">
                    {r.date}
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(r.id);
                  }}
                  title="Delete record"
                  className="shrink-0 p-1 text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={13} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>,
    document.body,
  );
}

// ─── Homework detail drawer ───────────────────────────────────────────────────

function HomeworkDetailDrawer({
  record,
  homework,
  onClose,
}: {
  record: StudentHomeworkRecord;
  homework: Homework | null;
  onClose: () => void;
}) {
  const [readContent, setReadContent] = useState<string | null>(null);
  const [writeContent, setWriteContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!homework?.title) return;
    const hw = homework;
    async function load() {
      setLoading(true);
      const folder = encodeURIComponent(hw.title);
      try {
        const [read, write] = await Promise.all([
          fetch(
            `/api/homework/github-content?folder=${folder}&file=What-to-read`,
          ).then((r) => r.json()) as Promise<{
            content?: string;
            error?: string;
          }>,
          fetch(
            `/api/homework/github-content?folder=${folder}&file=What-to-write`,
          ).then((r) => r.json()) as Promise<{
            content?: string;
            error?: string;
          }>,
        ]);
        setReadContent(read.content ?? read.error ?? null);
        setWriteContent(write.content ?? write.error ?? null);
      } catch {
        setReadContent("Failed to load content.");
        setWriteContent("Failed to load content.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [homework]);

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full md:w-110 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-light shrink-0">
          <h2 className="text-[16px] font-semibold text-text-primary truncate pr-4">
            {homework?.title ?? "Homework Details"}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-primary shrink-0 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Meta */}
        <div className="px-5 py-4 bg-surface-gray-light border-b border-border-light shrink-0">
          <div className="grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <p className="text-text-muted text-[11px] uppercase tracking-wider font-semibold mb-0.5">
                Date
              </p>
              <p className="text-text-primary font-medium">{record.date}</p>
            </div>
            <div>
              <p className="text-text-muted text-[11px] uppercase tracking-wider font-semibold mb-0.5">
                Status
              </p>
              <p
                className={`font-semibold ${record.completed ? "text-success" : "text-error"}`}
              >
                {record.completed ? "Completed" : "Missed"}
              </p>
            </div>
            {homework && (
              <>
                <div>
                  <p className="text-text-muted text-[11px] uppercase tracking-wider font-semibold mb-0.5">
                    Group
                  </p>
                  <p className="text-text-primary">{homework.group_name}</p>
                </div>
                <div>
                  <p className="text-text-muted text-[11px] uppercase tracking-wider font-semibold mb-0.5">
                    Type
                  </p>
                  <p className="text-text-primary">{homework.type}</p>
                </div>
              </>
            )}
          </div>
          {homework?.notes && (
            <div className="mt-3">
              <p className="text-text-muted text-[11px] uppercase tracking-wider font-semibold mb-0.5">
                Notes
              </p>
              <p className="text-[13px] text-text-secondary">
                {homework.notes}
              </p>
            </div>
          )}
        </div>

        {/* GitHub content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {!homework ? (
            <p className="text-[13px] text-text-muted">
              No homework linked to this record.
            </p>
          ) : loading ? (
            <p className="text-[13px] text-text-muted">Loading content…</p>
          ) : (
            <>
              <section>
                <h3 className="text-[12px] font-semibold text-text-muted uppercase tracking-widest mb-2">
                  What to Read
                </h3>
                <pre className="text-[13px] text-text-primary whitespace-pre-wrap font-sans bg-surface-gray-light rounded-lg p-3 leading-relaxed">
                  {readContent ?? "—"}
                </pre>
              </section>
              <section>
                <h3 className="text-[12px] font-semibold text-text-muted uppercase tracking-widest mb-2">
                  What to Write
                </h3>
                <pre className="text-[13px] text-text-primary whitespace-pre-wrap font-sans bg-surface-gray-light rounded-lg p-3 leading-relaxed">
                  {writeContent ?? "—"}
                </pre>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border-light flex items-center justify-end gap-2 shrink-0">
          {homework && (
            <a
              href={`/homework/${homework.id}/edit`}
              className="px-4 py-2 rounded-lg border border-primary text-primary text-[13px] font-semibold hover:bg-primary hover:text-white transition-colors"
            >
              Edit
            </a>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border-light text-text-primary text-[13px] font-semibold hover:bg-surface-gray-light transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main table ───────────────────────────────────────────────────────────────

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
  localRecords: Record<string, StudentHomeworkRecord[]>;
  onHomeworkAdd: (
    id: string,
    completed: boolean,
    date: string,
    homeworkId: string | null,
  ) => void;
  onHomeworkDelete: (studentId: string, recordId: string) => void;
  homeworks: Homework[];
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
  localRecords,
  onHomeworkAdd,
  onHomeworkDelete,
  homeworks,
}: Props) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openMobileMenu, setOpenMobileMenu] = useState<{
    id: string;
    top: number;
    right: number;
  } | null>(null);
  const [hwPopup, setHwPopup] = useState<HwPopupState | null>(null);
  const [hwListPopup, setHwListPopup] = useState<HwListState | null>(null);
  const [hwDetail, setHwDetail] = useState<HwDetailState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const col = (id: ColumnId) => visibleCols.has(id);
  const totalCols = 2 + COLUMN_DEFS.filter((c) => visibleCols.has(c.id)).length;

  const effectiveRecords = (s: StudentRow) =>
    s.id in localRecords ? localRecords[s.id] : s.homeworkRecords;

  const homeworkMap = Object.fromEntries(homeworks.map((h) => [h.id, h]));

  const hwBtnBase =
    "w-7 h-7 rounded-full text-[13px] font-bold flex items-center justify-center transition-colors";

  function openHwPopup(
    studentId: string,
    studentGroup: string,
    completed: boolean,
    e: React.MouseEvent<HTMLButtonElement>,
  ) {
    const rect = e.currentTarget.getBoundingClientRect();
    const popupW = 320;
    const popupH = 180;
    const top =
      window.innerHeight - rect.bottom >= popupH
        ? rect.bottom + 4
        : rect.top - popupH - 4;
    const rawLeft = rect.right - popupW;
    const left = Math.max(8, Math.min(rawLeft, window.innerWidth - popupW - 8));
    setHwPopup({ studentId, studentGroup, completed, top, left });
    setHwListPopup(null);
    setOpenMenuId(null);
  }

  function openHwListPopup(
    studentId: string,
    e: React.MouseEvent<HTMLButtonElement>,
  ) {
    const rect = e.currentTarget.getBoundingClientRect();
    const popupW = 400;
    const popupH = 320;
    const top =
      window.innerHeight - rect.bottom >= popupH
        ? rect.bottom + 4
        : Math.max(8, rect.top - popupH - 4);
    const rawLeft = rect.left;
    const left = Math.max(8, Math.min(rawLeft, window.innerWidth - popupW - 8));
    setHwListPopup({ studentId, top, left });
    setHwPopup(null);
    setOpenMenuId(null);
  }

  useEffect(() => {
    if (!openMenuId) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setOpenMenuId(null);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [openMenuId]);

  const activePopupHomeworks = hwPopup
    ? homeworks.filter((h) => h.group_name === hwPopup.studentGroup)
    : [];

  const listPopupStudent = hwListPopup
    ? paginated.find((s) => s.id === hwListPopup.studentId)
    : null;
  const listPopupRecords = listPopupStudent
    ? effectiveRecords(listPopupStudent)
    : [];

  // ─── HW column cell shared ─────────────────────────────────────────────────

  function HwCell({ s }: { s: StudentRow }) {
    return (
      <div className="flex items-center gap-2">
        <HomeworkDots records={effectiveRecords(s)} homeworkMap={homeworkMap} />
        <div className="flex gap-1 shrink-0">
          <button
            onClick={(e) => openHwPopup(s.id, s.group, true, e)}
            title="Mark homework done"
            className={`${hwBtnBase} bg-success-light text-success hover:bg-success hover:text-white active:scale-95 transition-all duration-200 cursor-pointer`}
          >
            +
          </button>
          <button
            onClick={(e) => openHwPopup(s.id, s.group, false, e)}
            title="Mark homework missed"
            className={`${hwBtnBase} bg-error-light text-error hover:bg-[#dc262684] hover:text-white active:scale-95 transition-all duration-200 cursor-pointer`}
          >
            −
          </button>
          <button
            onClick={(e) => openHwListPopup(s.id, e)}
            title="Manage homework records"
            className={`${hwBtnBase} bg-surface-gray-light text-text-muted hover:bg-primary hover:text-white cross-hover active:scale-95 transition-all duration-200 cursor-pointer`}
          >
            <X size={12} />
          </button>
        </div>
      </div>
    );
  }

  const openMobileMenuStudent = openMobileMenu
    ? (paginated.find((s) => s.id === openMobileMenu.id) ?? null)
    : null;

  return (
    <>
      {/* Mobile card menu portal */}
      {openMobileMenu &&
        openMobileMenuStudent &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpenMobileMenu(null)}
            />
            <div
              style={{
                position: "fixed",
                top: openMobileMenu.top,
                right: openMobileMenu.right,
                zIndex: 50,
              }}
              className="bg-surface border border-border-light rounded-lg shadow-lg py-1 min-w-32"
            >
              <button
                onClick={() => {
                  onEdit(openMobileMenuStudent);
                  setOpenMobileMenu(null);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[14px] text-text-primary hover:bg-surface-gray-light"
              >
                <Pencil size={14} className="text-text-secondary" /> Edit
              </button>
              <button
                onClick={() => {
                  onDelete(openMobileMenuStudent.id);
                  setOpenMobileMenu(null);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[14px] text-error hover:bg-error-light"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </>,
          document.body,
        )}

      {/* ── Mobile cards ───────────────────────────────────────────────────── */}
      <div className="md:hidden space-y-4">
        {paginated.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border-light shadow-sm p-6 text-center text-[14px] text-text-muted">
            No students match your filters.
          </div>
        ) : (
          paginated.map((s) => (
            <article
              key={s.id}
              className="bg-surface rounded-xl border border-border-light shadow-sm"
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border-light">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${s.gradientFrom}, ${s.gradientTo})`,
                  }}
                >
                  {s.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-bold text-text-primary truncate">
                    {s.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${s.groupColor}`}
                    >
                      {s.group}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${TYPE_COLOR[s.type] ?? "bg-gray-50 text-gray-500 border border-gray-200 dark:bg-surface-gray-dark dark:text-text-primary dark:border-border-light"}`}
                    >
                      {s.type}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  <button
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setOpenMobileMenu(
                        openMobileMenu?.id === s.id
                          ? null
                          : {
                              id: s.id,
                              top: rect.bottom + 4,
                              right: window.innerWidth - rect.right,
                            },
                      );
                    }}
                    className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-surface-gray-light transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                <div>
                  <span className="text-text-muted text-[11px]">HW Score</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-semibold text-text-primary">
                      {s.grade}
                    </span>
                    <TrendIcon trend={s.gradeTrend} />
                    <span className="text-[11px] text-text-muted">
                      ({effectiveRecords(s).length})
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-text-muted text-[11px]">Status</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${s.statusDot}`}
                    />
                    <span className={`font-semibold ${s.statusColor}`}>
                      {s.statusLabel}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-text-muted text-[11px]">Started</span>
                  <p className="text-text-primary mt-0.5">
                    {formatDisplayDate(s.started)}
                  </p>
                </div>
                <div>
                  <span className="text-text-muted text-[11px]">Finished</span>
                  <p className="text-text-primary mt-0.5">
                    {formatDisplayDate(s.finished)}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-border-light space-y-2 text-[13px] overflow-x-auto">
                <div className="flex items-center gap-2">
                  <span className="text-text-muted text-[11px] shrink-0">
                    Homework
                  </span>
                  <HwCell s={s} />
                </div>
                {s.contact && (
                  <div className="truncate">
                    <span className="text-text-muted text-[11px]">
                      Telegram{" "}
                    </span>
                    <span className="text-text-secondary">{s.contact}</span>
                  </div>
                )}
                {s.githubUsername && (
                  <div className="truncate">
                    <span className="text-text-muted text-[11px]">GitHub </span>
                    <a
                      href={`https://github.com/${s.githubUsername}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      {s.githubUsername}
                    </a>
                  </div>
                )}
                {s.notes && (
                  <div>
                    <span className="text-text-muted text-[11px]">Notes </span>
                    <span className="text-text-secondary">{s.notes}</span>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      {/* ── Desktop table ──────────────────────────────────────────────────── */}
      <div className="hidden md:block bg-white rounded-xl border border-border-light shadow-sm overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-gray-light border-b border-border-light">
              <SortTh
                label="Student Name"
                sortKey="name"
                currentKey={sortKey}
                dir={sortDir}
                onSort={onSort}
              />
              {col("group") && (
                <SortTh
                  label="Group"
                  sortKey="group"
                  currentKey={sortKey}
                  dir={sortDir}
                  onSort={onSort}
                />
              )}
              {col("type") && (
                <SortTh
                  label="Type"
                  sortKey="type"
                  currentKey={sortKey}
                  dir={sortDir}
                  onSort={onSort}
                />
              )}
              {col("grade") && (
                <SortTh
                  label="HW Score"
                  sortKey="gradeNum"
                  currentKey={sortKey}
                  dir={sortDir}
                  onSort={onSort}
                />
              )}
              {col("hw_count") && <th className={TH_BASE}># HW</th>}
              {col("homework") && <th className={TH_BASE}>Homework</th>}
              {col("status") && (
                <SortTh
                  label="Status"
                  sortKey="statusLabel"
                  currentKey={sortKey}
                  dir={sortDir}
                  onSort={onSort}
                />
              )}
              {col("started") && (
                <SortTh
                  label="Started"
                  sortKey="started"
                  currentKey={sortKey}
                  dir={sortDir}
                  onSort={onSort}
                />
              )}
              {col("finished") && (
                <SortTh
                  label="Finished"
                  sortKey="finished"
                  currentKey={sortKey}
                  dir={sortDir}
                  onSort={onSort}
                />
              )}
              {col("github") && <th className={TH_BASE}>GitHub</th>}
              {col("exam_project") && <th className={TH_BASE}>Exam Project</th>}
              {col("notes") && <th className={TH_BASE}>Notes</th>}
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={totalCols}
                  className="px-6 py-10 text-center text-[14px] text-text-muted"
                >
                  No students match your filters.
                </td>
              </tr>
            ) : (
              paginated.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-surface-gray-light transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold"
                          style={{
                            background: `linear-gradient(135deg, ${s.gradientFrom}, ${s.gradientTo})`,
                          }}
                        >
                          {s.initials}
                        </div>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${s.statusOnline} border-2 border-white rounded-full`}
                        />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-text-primary whitespace-nowrap">
                          {s.name}
                        </p>
                        <p className="text-[12px] text-text-muted">
                          {s.contact}
                        </p>
                      </div>
                    </div>
                  </td>

                  {col("group") && (
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[13px] whitespace-nowrap ${s.groupColor}`}
                      >
                        {s.group}
                      </span>
                    </td>
                  )}
                  {col("type") && (
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[13px] whitespace-nowrap ${TYPE_COLOR[s.type] ?? "bg-gray-50 text-gray-500 border border-gray-200"}`}
                      >
                        {s.type}
                      </span>
                    </td>
                  )}
                  {col("grade") && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-semibold text-text-primary">
                          {s.grade}
                        </span>
                        <TrendIcon trend={s.gradeTrend} />
                      </div>
                    </td>
                  )}
                  {col("hw_count") && (
                    <td className="px-6 py-4 text-[15px] font-semibold text-text-primary">
                      {effectiveRecords(s).length || "—"}
                    </td>
                  )}
                  {col("homework") && (
                    <td className="px-6 py-4">
                      <HwCell s={s} />
                    </td>
                  )}
                  {col("status") && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${s.statusDot}`}
                        />
                        <span
                          className={`text-[14px] font-semibold whitespace-nowrap ${s.statusColor}`}
                        >
                          {s.statusLabel}
                        </span>
                      </div>
                    </td>
                  )}
                  {col("started") && (
                    <td className="px-6 py-4 text-[14px] text-text-secondary whitespace-nowrap">
                      {formatDisplayDate(s.started)}
                    </td>
                  )}
                  {col("finished") && (
                    <td className="px-6 py-4 text-[14px] text-text-secondary whitespace-nowrap">
                      {formatDisplayDate(s.finished)}
                    </td>
                  )}
                  {col("github") && (
                    <td className="px-6 py-4">
                      {s.githubUsername ? (
                        <a
                          href={`https://github.com/${s.githubUsername}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-[14px] text-primary hover:underline whitespace-nowrap"
                        >
                          <GitBranch size={14} />
                          {s.githubUsername}
                        </a>
                      ) : (
                        <span className="text-[14px] text-text-muted">—</span>
                      )}
                    </td>
                  )}
                  {col("exam_project") && (
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {s.examProjectUrl ? (
                          <a
                            href={s.examProjectUrl}
                            target="_blank"
                            rel="noreferrer"
                            title={s.examProjectUrl}
                            className="text-warning hover:opacity-70 transition-opacity"
                          >
                            <Star size={18} fill="currentColor" />
                          </a>
                        ) : (
                          <Star size={18} className="text-text-muted" />
                        )}
                      </div>
                    </td>
                  )}
                  {col("notes") && (
                    <td className="px-6 py-4 max-w-55">
                      <p
                        className="text-[14px] text-text-secondary truncate"
                        title={s.notes ?? ""}
                      >
                        {s.notes ?? "—"}
                      </p>
                    </td>
                  )}

                  <td className="px-6 py-4 text-right">
                    <div
                      ref={openMenuId === s.id ? menuRef : null}
                      className="relative inline-block"
                    >
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === s.id ? null : s.id)
                        }
                        className="p-2 text-text-muted hover:text-primary transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenuId === s.id && (
                        <div className="absolute right-0 top-9 z-20 bg-white border border-border-light rounded-lg shadow-lg py-1 min-w-32.5 modal-panel">
                          <button
                            onClick={() => {
                              onEdit(s);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[14px] text-text-primary hover:bg-surface-gray-light"
                          >
                            <Pencil size={14} className="text-text-secondary" />{" "}
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              onDelete(s.id);
                              setOpenMenuId(null);
                            }}
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

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
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

      {/* ── Floating popups / drawer ────────────────────────────────────────── */}
      {hwPopup && (
        <HomeworkPopup
          homeworks={activePopupHomeworks}
          completed={hwPopup.completed}
          top={hwPopup.top}
          left={hwPopup.left}
          onSubmit={(date, hwId) => {
            onHomeworkAdd(hwPopup.studentId, hwPopup.completed, date, hwId);
            setHwPopup(null);
          }}
          onClose={() => setHwPopup(null)}
        />
      )}

      {hwListPopup && (
        <HomeworkListPopup
          records={listPopupRecords}
          homeworkMap={homeworkMap}
          top={hwListPopup.top}
          left={hwListPopup.left}
          onDelete={(recordId) =>
            onHomeworkDelete(hwListPopup.studentId, recordId)
          }
          onSelect={(record, homework) => {
            setHwListPopup(null);
            setHwDetail({ record, homework });
          }}
          onClose={() => setHwListPopup(null)}
        />
      )}

      {hwDetail && (
        <HomeworkDetailDrawer
          record={hwDetail.record}
          homework={hwDetail.homework}
          onClose={() => setHwDetail(null)}
        />
      )}
    </>
  );
}
