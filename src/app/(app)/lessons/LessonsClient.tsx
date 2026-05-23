"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, FileText } from "lucide-react";
import { useNotifications } from "@/contexts/notifications";
import { supabase } from "@/lib/supabase";
import type { Lesson, Group } from "@/lib/types";
import { PAGE_SIZE, formatDisplayDate } from "./types";
import { downloadJSON, downloadCSV, downloadExcel } from "@/lib/import-export";
import ImportExportButtons from "@/components/ui/ImportExportButtons";
import LessonMenu from "./components/LessonMenu";
import LessonModal from "./components/LessonModal";
import LessonList from "./components/LessonList";
import LessonsInsights from "./components/LessonsInsights";
import CalendarView from "./components/CalendarView";
import LessonPrepModal from "./components/LessonPrepModal";
import LessonFilters from "./components/LessonFilters";
import ReportModal from "./components/ReportModal";

export default function LessonsClient({
  initialLessons,
  groups,
}: {
  initialLessons: Lesson[];
  groups: Group[];
}) {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOptimized, setAiOptimized] = useState(false);
  const [prepLesson, setPrepLesson] = useState<Lesson | null>(null);
  const [openMenu, setOpenMenu] = useState<{
    id: string;
    top: number;
    right: number;
  } | null>(null);
  const [modalLesson, setModalLesson] = useState<Lesson | "new" | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const { add: notify } = useNotifications();

  const openMenuLesson = openMenu
    ? (lessons.find((l) => l.id === openMenu.id) ?? null)
    : null;

  const groupNames = useMemo(
    () =>
      [...new Set(lessons.map((l) => l.group_name).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [lessons],
  );

  const typeNames = useMemo(
    () =>
      [...new Set(lessons.map((l) => l.type).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [lessons],
  );

  const filteredLessons = useMemo(() => {
    const query = search.trim().toLowerCase();
    return lessons.filter((lesson) => {
      const matchesSearch =
        query.length === 0 ||
        lesson.title.toLowerCase().includes(query) ||
        lesson.group_name.toLowerCase().includes(query) ||
        lesson.date.toLowerCase().includes(query) ||
        formatDisplayDate(lesson.date).toLowerCase().includes(query);
      const matchesGroup = groupFilter === "all" || lesson.group_name === groupFilter;
      const matchesType = typeFilter === "all" || lesson.type === typeFilter;
      return matchesSearch && matchesGroup && matchesType;
    });
  }, [lessons, search, groupFilter, typeFilter]);

  const sorted = useMemo(
    () => [...filteredLessons].sort((a, b) => b.date.localeCompare(a.date)),
    [filteredLessons],
  );

  const grouped = useMemo(() => {
    return sorted.slice(0, visibleCount).reduce<
      { lesson: Lesson; showDate: boolean }[]
    >((acc, lesson) => {
      const previousDate = acc.at(-1)?.lesson.date ?? "";
      const showDate = !!(lesson.date && lesson.date !== previousDate);
      acc.push({ lesson, showDate });
      return acc;
    }, []);
  }, [sorted, visibleCount]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, groupFilter, typeFilter]);

  const weeklyData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    lessons.forEach((l) => {
      if (!l.date) return;
      counts[(new Date(l.date).getDay() + 6) % 7]++;
    });
    return counts;
  }, [lessons]);

  const bestDayIdx = weeklyData.indexOf(Math.max(...weeklyData));

  async function handleReoptimize() {
    setAiLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setAiLoading(false);
    setAiOptimized(true);
  }

  async function handleDelete(id: string) {
    const lesson = lessons.find((l) => l.id === id);
    const res = await fetch(`/api/lessons/${id}`, { method: "DELETE" });
    if (!res.ok) {
      notify("Failed to delete lesson", "error");
      return;
    }
    notify(`Lesson "${lesson?.title ?? ""}" deleted`);
    setOpenMenu(null);
    await fetchLessons();
  }

  async function handleStatusChange(id: string, status: string) {
    const lesson = lessons.find((l) => l.id === id);
    const res = await fetch(`/api/lessons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      notify("Failed to update lesson status", "error");
      return;
    }
    notify(`Lesson "${lesson?.title ?? ""}" marked ${status}`);
    await fetchLessons();
    setOpenMenu(null);
  }

  async function fetchLessons() {
    const { data } = await supabase
      .from("lessons")
      .select("*")
      .order("date", { ascending: false })
      .limit(500);
    setLessons(data ?? []);
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("lessons")
        .select("*")
        .order("date", { ascending: false })
        .limit(500);

      if (cancelled) return;
      setLessons(data ?? []);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleSaved() {
    void fetchLessons();
  }

  function handleMenuOpen(id: string, top: number, right: number) {
    setOpenMenu((prev) => (prev?.id === id ? null : { id, top, right }));
  }

  function resetFilters() {
    setSearch("");
    setGroupFilter("all");
    setTypeFilter("all");
  }

  const LESSON_HEADERS = ["Title", "Group", "Type", "Date", "Status", "Hours", "YouTube URL", "Has Homework", "Has Feedback", "Comment"];

  function getLessonRows() {
    return lessons.map((l) => [l.title, l.group_name, l.type, l.date, l.status, l.hours, l.youtube_url ?? "", l.has_homework ? "true" : "false", l.has_feedback ? "true" : "false", l.comment ?? ""]);
  }

  function handleExport(format: "json" | "csv" | "excel") {
    if (format === "json") {
      downloadJSON(lessons, "lessons");
    } else if (format === "csv") {
      downloadCSV(LESSON_HEADERS, getLessonRows(), "lessons");
    } else {
      downloadExcel(LESSON_HEADERS, getLessonRows(), "lessons", "Lessons");
    }
  }

  async function handleImport(importedRows: Record<string, string>[]) {
    for (const row of importedRows) {
      await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: row["Title"] ?? row["title"] ?? "",
          group_name: row["Group"] ?? row["group_name"] ?? "",
          type: row["Type"] ?? row["type"] ?? "",
          date: row["Date"] ?? row["date"] ?? new Date().toISOString().slice(0, 10),
          status: row["Status"] ?? row["status"] ?? "planned",
          hours: Number(row["Hours"] ?? row["hours"] ?? 1),
          youtube_url: row["YouTube URL"] ?? row["youtube_url"] ?? null,
          has_homework: (row["Has Homework"] ?? row["has_homework"] ?? "false") === "true",
          has_feedback: (row["Has Feedback"] ?? row["has_feedback"] ?? "false") === "true",
          comment: row["Comment"] ?? row["comment"] ?? null,
        }),
      });
    }
    await fetchLessons();
  }

  return (
    <>
      {/* Dropdown: rendered outside cards to avoid backdrop-blur stacking context */}
      {openMenu && openMenuLesson && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpenMenu(null)}
          />
          <div
            className="fixed z-50 w-52 bg-white rounded-xl shadow-xl border border-border-light py-1.5"
            style={{ top: openMenu.top, right: openMenu.right }}
          >
            <LessonMenu
              lesson={openMenuLesson}
              onEdit={() => {
                setModalLesson(openMenuLesson);
                setOpenMenu(null);
              }}
              onDelete={() => handleDelete(openMenuLesson.id)}
              onStatusChange={(s) => handleStatusChange(openMenuLesson.id, s)}
            />
          </div>
        </>
      )}

      <div className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4">
          <div>
            <h2 className="text-[26px] sm:text-[32px] font-bold text-text-primary tracking-tight">
              Lessons
            </h2>
            <p className="text-[13px] sm:text-[14px] text-text-secondary mt-1 max-w-2xl">
              {filteredLessons.length === lessons.length
                ? `${lessons.length} lessons across all groups.`
                : `${filteredLessons.length} of ${lessons.length} lessons match the filters.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <ImportExportButtons onExport={handleExport} onImport={handleImport} />
            <button
              onClick={() => setReportOpen(true)}
              className="flex items-center gap-2 px-3 py-2 border border-border-light rounded-lg text-[13px] font-semibold text-text-secondary hover:bg-surface-gray-light transition-colors"
            >
              <FileText size={15} />
              Report
            </button>
            <div className="flex p-1 bg-surface-container rounded-lg border border-border-light sm:w-auto">
              {(["list", "calendar"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-[13px] font-bold transition-all ${
                    view === v
                      ? "bg-white shadow-sm text-primary"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {v === "list" ? "List View" : "Calendar"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <LessonFilters
          search={search}
          onSearchChange={setSearch}
          groupFilter={groupFilter}
          onGroupChange={setGroupFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          groups={groupNames}
          types={typeNames}
          onReset={resetFilters}
        />

        {view === "list" ? (
        <LessonList
          grouped={grouped}
          totalCount={sorted.length}
          visibleCount={visibleCount}
          onLoadMore={() => setVisibleCount((c) => c + PAGE_SIZE)}
          onMenuOpen={handleMenuOpen}
          onPrepareContent={(lesson) => setPrepLesson(lesson)}
          openMenuId={openMenu?.id ?? null}
        />
        ) : (
          <CalendarView
            lessons={filteredLessons}
            calendarDate={calendarDate}
            onPrev={() =>
              setCalendarDate(
                (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1),
              )
            }
            onNext={() =>
              setCalendarDate(
                (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1),
              )
            }
          />
        )}

        <LessonsInsights
          weeklyData={weeklyData}
          bestDayIdx={bestDayIdx}
          lessonsCount={lessons.length}
          aiLoading={aiLoading}
          aiOptimized={aiOptimized}
          onReoptimize={handleReoptimize}
        />
      </div>

      {modalLesson !== null && (
        <LessonModal
          lesson={modalLesson === "new" ? undefined : modalLesson}
          groups={groups}
          onClose={() => setModalLesson(null)}
          onSaved={() => {
            handleSaved();
            setModalLesson(null);
          }}
        />
      )}

      {prepLesson && (
        <LessonPrepModal
          lesson={prepLesson}
          onClose={() => setPrepLesson(null)}
          onEdit={() => {
            setModalLesson(prepLesson);
            setPrepLesson(null);
          }}
        />
      )}

      {reportOpen && (
        <ReportModal lessons={lessons} onClose={() => setReportOpen(false)} />
      )}

      <button
        onClick={() => setModalLesson("new")}
        className="fixed bottom-10 right-10 w-14 h-14 bg-secondary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50"
      >
        <Plus size={24} />
      </button>
    </>
  );
}
