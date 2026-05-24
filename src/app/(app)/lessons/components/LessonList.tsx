import { Users, MoreVertical } from "lucide-react";
import type { Lesson } from "@/lib/types";
import { BORDER_COLOR, formatDisplayDate, mapStatus } from "../types";
import { StatusBadge, LessonAction } from "./LessonBadges";

interface GroupedLesson {
  lesson: Lesson;
  showDate: boolean;
}

interface Props {
  grouped: GroupedLesson[];
  totalCount: number;
  visibleCount: number;
  onLoadMore: () => void;
  onMenuOpen: (id: string, top: number, right: number) => void;
  onPrepareContent: (lesson: Lesson) => void;
  openMenuId: string | null;
}

export default function LessonList({
  grouped,
  totalCount,
  visibleCount,
  onLoadMore,
  onMenuOpen,
  onPrepareContent,
  openMenuId,
}: Props) {
  const hasMore = visibleCount < totalCount;

  return (
    <>
      <div className="flex flex-col gap-4">
        {grouped.map(({ lesson, showDate }) => {
          const status = mapStatus(lesson.status);
          const isCompleted = status === "completed";
          return (
            <div key={lesson.id}>
              {showDate && (
                <div className="flex items-center gap-3 mb-4 mt-2">
                  <span className="text-[12px] font-semibold text-text-muted uppercase tracking-widest">
                    {formatDisplayDate(lesson.date)}
                  </span>
                  <div className="flex-1 h-px bg-border-light" />
                </div>
              )}
              {/* Mobile card */}
              <article
                className={[
                  "md:hidden bg-white border border-border-light rounded-xl shadow-sm overflow-hidden border-l-4",
                  BORDER_COLOR[status],
                  isCompleted ? "opacity-80" : "",
                ].join(" ")}
              >
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border-light">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-[15px] font-bold text-text-primary truncate ${isCompleted ? "line-through text-text-muted" : ""}`}>
                      {lesson.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge status={status} />
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container text-primary font-semibold">
                        {lesson.type}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      onMenuOpen(lesson.id, rect.bottom + 4, window.innerWidth - rect.right);
                    }}
                    className={`p-2 rounded-lg text-text-muted hover:text-primary hover:bg-surface-gray-light transition-colors shrink-0 ${openMenuId === lesson.id ? "bg-surface-container text-primary" : ""}`}
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
                <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                  <div>
                    <span className="text-text-muted text-[11px]">Group</span>
                    <p className="text-text-primary truncate">{lesson.group_name}</p>
                  </div>
                  <div>
                    <span className="text-text-muted text-[11px]">Date</span>
                    <p className="text-text-primary">{formatDisplayDate(lesson.date)}</p>
                  </div>
                  <div>
                    <span className="text-text-muted text-[11px]">Duration</span>
                    <p className="text-text-primary">{lesson.hours}h · {lesson.hours * 60} min</p>
                  </div>
                  <div>
                    <span className="text-text-muted text-[11px]">Extras</span>
                    <p className="flex gap-2 mt-0.5">
                      {lesson.has_homework && <span className="text-[11px] text-warning font-semibold">📋 HW</span>}
                      {lesson.has_feedback && <span className="text-[11px] text-success font-semibold">✓ FB</span>}
                      {!lesson.has_homework && !lesson.has_feedback && <span className="text-text-muted">—</span>}
                    </p>
                  </div>
                </div>
                {(status !== "completed" || lesson.youtube_url || lesson.comment) && (
                  <div className="px-4 py-2.5 border-t border-border-light flex flex-wrap items-center gap-3">
                    {(status !== "completed" || lesson.youtube_url) && (
                      <LessonAction
                        status={status}
                        youtubeUrl={lesson.youtube_url}
                        onPrepareContent={() => onPrepareContent(lesson)}
                      />
                    )}
                    {lesson.comment && (
                      <span className="text-[12px] text-text-muted italic truncate">{lesson.comment}</span>
                    )}
                  </div>
                )}
              </article>

              {/* Desktop card */}
              <div
                className={[
                  "hidden md:flex flex-col md:flex-row bg-white/70 backdrop-blur-sm border border-border-light/80 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all gap-4 sm:gap-6 md:items-center border-l-4",
                  BORDER_COLOR[status],
                  isCompleted ? "opacity-80" : "",
                ].join(" ")}
              >
                <div className="flex-shrink-0 w-full md:w-32 text-left md:text-left">
                  <div className={`text-[18px] sm:text-[20px] font-semibold text-text-primary ${isCompleted ? "line-through text-text-muted" : ""}`}>
                    {lesson.hours}h
                  </div>
                  <div className="text-[12px] text-text-muted">{lesson.hours * 60} minutes</div>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-wrap">
                    <h3 className="text-[18px] sm:text-[24px] font-semibold text-text-primary leading-tight">
                      {lesson.title}
                    </h3>
                    <StatusBadge status={status} />
                  </div>
                  <div className="flex items-center gap-3 sm:gap-6 text-text-secondary text-[13px] sm:text-[14px] flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Users size={16} />
                      {lesson.group_name}
                    </span>
                    <span className="px-2 py-0.5 bg-surface-container text-primary rounded text-[12px] font-semibold">
                      {lesson.type}
                    </span>
                    {lesson.has_homework && (
                      <span className="text-[12px] text-warning font-semibold">📋 Has Homework</span>
                    )}
                    {lesson.has_feedback && (
                      <span className="text-[12px] text-success font-semibold">✓ Feedback Given</span>
                    )}
                  </div>
                  {lesson.comment && (
                    <p className="text-[13px] text-text-muted italic">{lesson.comment}</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
                  <LessonAction
                    status={status}
                    youtubeUrl={lesson.youtube_url}
                    onPrepareContent={() => onPrepareContent(lesson)}
                  />
                  <button
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      onMenuOpen(
                        lesson.id,
                        rect.bottom + 4,
                        window.innerWidth - rect.right,
                      );
                    }}
                    className={`p-3 border border-border-light rounded-xl hover:bg-surface-gray-light transition-all self-end sm:self-auto ${openMenuId === lesson.id ? "bg-surface-container border-primary" : ""}`}
                  >
                    <MoreVertical size={16} className="text-text-secondary" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onLoadMore}
            className="px-8 py-3 border border-primary text-primary rounded-xl font-bold hover:bg-primary/5 transition-all text-[14px]"
          >
            Load more ({totalCount - visibleCount} remaining)
          </button>
        </div>
      )}
    </>
  );
}
