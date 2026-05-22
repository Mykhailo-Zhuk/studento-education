"use client";

import { useState, useMemo } from "react";
import { UserPlus, Zap } from "lucide-react";
import { downloadJSON, downloadCSV, downloadExcel } from "@/lib/import-export";
import ImportExportButtons from "@/components/ui/ImportExportButtons";
import {
  type StudentRow,
  type StatItem,
  type ColumnId,
  type SortKey,
  type SortDir,
  DEFAULT_VISIBLE,
  GRADE_RANGES,
  PAGE_SIZE,
} from "./types";
import type { StudentHomeworkRecord, Homework } from "@/lib/types";
import { StatIcon } from "./components/TablePrimitives";
import StudentsFilters from "./components/StudentsFilters";
import StudentsTable from "./components/StudentsTable";
import AddStudentModal from "./components/AddStudentModal";
import EditStudentModal from "./components/EditStudentModal";
import DeleteStudentModal from "./components/DeleteStudentModal";

export type { StudentRow, StatItem };

interface Props {
  rows: StudentRow[];
  uniqueGroups: string[];
  stats: StatItem[];
  homeworks: Homework[];
}

export default function StudentsClient({ rows, uniqueGroups, stats, homeworks }: Props) {
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("All Groups");
  const [gradeFilter, setGradeFilter] = useState("All Grades");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [visibleCols, setVisibleCols] =
    useState<Set<ColumnId>>(DEFAULT_VISIBLE);
  const [sortKey, setSortKey] = useState<SortKey>("started");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localRecords, setLocalRecords] = useState<Record<string, StudentHomeworkRecord[]>>({});

  function toggleCol(id: ColumnId) {
    setVisibleCols((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  async function handleHomeworkDelete(studentId: string, recordId: string) {
    const current =
      localRecords[studentId] ??
      rows.find((r) => r.id === studentId)?.homeworkRecords ??
      [];
    setLocalRecords((prev) => ({
      ...prev,
      [studentId]: current.filter((r) => r.id !== recordId),
    }));
    try {
      const res = await fetch(`/api/students/${studentId}/homework/${recordId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setLocalRecords((prev) => ({ ...prev, [studentId]: current }));
      }
    } catch {
      setLocalRecords((prev) => ({ ...prev, [studentId]: current }));
    }
  }

  async function handleHomeworkAdd(id: string, completed: boolean, date: string, homeworkId: string | null) {
    const tempId = `tmp-${id}-${Date.now()}`;
    const tempRecord: StudentHomeworkRecord = {
      id: tempId,
      student_id: id,
      homework_id: homeworkId,
      date,
      completed,
      created_at: new Date().toISOString(),
    };

    setLocalRecords((prev) => ({
      ...prev,
      [id]: [...(prev[id] ?? rows.find((r) => r.id === id)?.homeworkRecords ?? []), tempRecord],
    }));

    try {
      const res = await fetch(`/api/students/${id}/homework`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, completed, homework_id: homeworkId }),
      });
      if (res.ok) {
        const real = (await res.json()) as StudentHomeworkRecord;
        setLocalRecords((prev) => ({
          ...prev,
          [id]: (prev[id] ?? []).map((r) => (r.id === tempId ? real : r)),
        }));
      } else {
        setLocalRecords((prev) => ({
          ...prev,
          [id]: (prev[id] ?? []).filter((r) => r.id !== tempId),
        }));
      }
    } catch {
      setLocalRecords((prev) => ({
        ...prev,
        [id]: (prev[id] ?? []).filter((r) => r.id !== tempId),
      }));
    }
  }

  function resetFilters() {
    setSearch("");
    setGroupFilter("All Groups");
    setGradeFilter("All Grades");
    setPage(1);
  }

  const EXPORT_HEADERS = ["Name", "Telegram", "Group", "Type", "Status", "Started", "Finished", "GitHub", "Notes"];

  function getExportRows() {
    return rows.map((r) => [r.name, r.contact, r.group, r.type, r.statusLabel, r.started, r.finished ?? "", r.githubUsername ?? "", r.notes ?? ""]);
  }

  function handleExport(format: "json" | "csv" | "excel") {
    if (format === "json") {
      downloadJSON(rows.map((r) => ({ name: r.name, telegram: r.contact, group_name: r.group, type: r.type, status: r.statusLabel, started: r.started, finished: r.finished ?? null, github_username: r.githubUsername ?? null, notes: r.notes ?? null })), "students");
    } else if (format === "csv") {
      downloadCSV(EXPORT_HEADERS, getExportRows(), "students");
    } else {
      downloadExcel(EXPORT_HEADERS, getExportRows(), "students", "Students");
    }
  }

  async function handleImport(importedRows: Record<string, string>[]) {
    for (const row of importedRows) {
      await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: row["Name"] ?? row["name"] ?? "",
          telegram: row["Telegram"] ?? row["telegram"] ?? null,
          group_name: row["Group"] ?? row["group_name"] ?? "",
          type: row["Type"] ?? row["type"] ?? "",
          status: row["Status"] ?? row["status"] ?? "active",
          started: row["Started"] ?? row["started"] ?? new Date().toISOString().slice(0, 10),
          finished: row["Finished"] ?? row["finished"] ?? null,
          github_username: row["GitHub"] ?? row["github_username"] ?? null,
          notes: row["Notes"] ?? row["notes"] ?? null,
        }),
      });
    }
    window.location.reload();
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((r) => {
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.contact.toLowerCase().includes(q);
      const matchGroup =
        groupFilter === "All Groups" || r.group === groupFilter;
      const matchGrade =
        gradeFilter === "All Grades" ||
        (GRADE_RANGES[gradeFilter] && GRADE_RANGES[gradeFilter](r.gradeNum));
      return matchSearch && matchGroup && matchGrade;
    });
  }, [rows, search, groupFilter, gradeFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const empty = (v: unknown) => v === null || v === undefined || v === "";
      if (empty(av) && empty(bv)) return 0;
      if (empty(av)) return 1;
      if (empty(bv)) return -1;
      if (typeof av === "number" && typeof bv === "number")
        return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
        <div>
          <h2 className="text-[26px] sm:text-[32px] font-bold text-text-primary tracking-tight">
            Students Performance
          </h2>
          <p className="text-[13px] sm:text-[14px] text-text-secondary mt-2 max-w-2xl">
            Monitoring {rows.length} individual learners across{" "}
            {uniqueGroups.length} AI-orchestrated tracks.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
          <ImportExportButtons onExport={handleExport} onImport={handleImport} />
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-3 bg-primary text-white rounded-lg text-[14px] font-semibold flex items-center justify-center gap-2 shadow-lg hover:bg-primary-hover transition-colors"
          >
            <UserPlus size={16} />
            Add Student
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white p-6 rounded-xl border border-border-light shadow-sm"
          >
            <p className="text-[12px] font-semibold text-text-muted uppercase tracking-widest">
              {s.label}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className={`text-[32px] font-bold ${s.valueColor}`}>
                {s.value}
              </span>
              {s.badge ? (
                <span
                  className={`px-2 py-0.5 rounded-full text-[12px] font-semibold ${s.badgeClasses}`}
                >
                  {s.badge}
                </span>
              ) : (
                <StatIcon iconName={s.iconName} />
              )}
            </div>
          </div>
        ))}
      </div>

      <StudentsFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        groupFilter={groupFilter}
        onGroupChange={(v) => {
          setGroupFilter(v);
          setPage(1);
        }}
        gradeFilter={gradeFilter}
        onGradeChange={(v) => {
          setGradeFilter(v);
          setPage(1);
        }}
        uniqueGroups={uniqueGroups}
        onReset={resetFilters}
        visibleCols={visibleCols}
        onToggleCol={toggleCol}
      />

      <StudentsTable
        paginated={paginated}
        totalCount={sorted.length}
        visibleCols={visibleCols}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        safePage={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
        onEdit={setEditingStudent}
        onDelete={setDeletingId}
        localRecords={localRecords}
        onHomeworkAdd={handleHomeworkAdd}
        onHomeworkDelete={handleHomeworkDelete}
        homeworks={homeworks}
      />

      <button className="fixed bottom-10 right-10 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50 group">
        <Zap size={24} fill="white" />
        <span className="absolute right-16 bg-bg-dark text-white px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[14px] pointer-events-none">
          Ask AI Assistant
        </span>
      </button>

      {showAddModal && (
        <AddStudentModal
          uniqueGroups={uniqueGroups}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          uniqueGroups={uniqueGroups}
          onClose={() => setEditingStudent(null)}
        />
      )}
      {deletingId && (
        <DeleteStudentModal
          id={deletingId}
          onClose={() => setDeletingId(null)}
        />
      )}
    </>
  );
}
