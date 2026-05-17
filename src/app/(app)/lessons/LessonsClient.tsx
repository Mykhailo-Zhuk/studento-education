"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Lesson, Group } from "@/lib/types";
import { PAGE_SIZE } from "./types";
import LessonMenu from "./components/LessonMenu";
import LessonModal from "./components/LessonModal";
import LessonList from "./components/LessonList";
import LessonsInsights from "./components/LessonsInsights";
import CalendarView from "./components/CalendarView";
import LessonPrepModal from "./components/LessonPrepModal";

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

  const openMenuLesson = openMenu
    ? (lessons.find((l) => l.id === openMenu.id) ?? null)
    : null;

  const sorted = useMemo(
    () => [...lessons].sort((a, b) => b.date.localeCompare(a.date)),
    [lessons],
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
    const res = await fetch(`/api/lessons/${id}`, { method: "DELETE" });
    if (!res.ok) {
      console.error("Failed to delete lesson");
      return;
    }
    setOpenMenu(null);
    await fetchLessons();
  }

  async function handleStatusChange(id: string, status: string) {
    const res = await fetch(`/api/lessons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      console.error("Failed to update lesson status");
      return;
    }
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
              {lessons.length} lessons across all groups.
            </p>
          </div>
          <div className="flex p-1 bg-surface-container rounded-lg border border-border-light w-full sm:w-auto">
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
            lessons={lessons}
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

      <button
        onClick={() => setModalLesson("new")}
        className="fixed bottom-10 right-10 w-14 h-14 bg-secondary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50"
      >
        <Plus size={24} />
      </button>
    </>
  );
}
