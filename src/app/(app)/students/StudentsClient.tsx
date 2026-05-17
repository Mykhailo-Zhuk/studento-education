"use client";

import { useState, useMemo } from "react";
import { Download, UserPlus, Zap } from "lucide-react";
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
}

export default function StudentsClient({ rows, uniqueGroups, stats }: Props) {
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

  function resetFilters() {
    setSearch("");
    setGroupFilter("All Groups");
    setGradeFilter("All Grades");
    setPage(1);
  }

  function handleExportCSV() {
    const headers = [
      "Name",
      "Contact",
      "Group",
      "Type",
      "HW Score",
      "Status",
      "Started",
      "Finished",
      "GitHub",
      "Notes",
    ];
    const csvRows = [
      headers.join(","),
      ...rows.map((r) =>
        [
          r.name,
          r.contact,
          r.group,
          r.type,
          r.grade,
          r.statusLabel,
          r.started,
          r.finished ?? "",
          r.githubUsername ?? "",
          `"${(r.notes ?? "").replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
    URL.revokeObjectURL(url);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-3 w-full lg:w-auto">
          <button
            onClick={handleExportCSV}
            className="px-4 py-3 border border-border-light bg-white rounded-lg text-[14px] flex items-center justify-center gap-2 hover:bg-surface-gray-light transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
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
