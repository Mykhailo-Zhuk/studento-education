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
              <div
                className={[
                  "bg-white/70 backdrop-blur-sm border border-border-light/80 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-4 sm:gap-6 md:items-center border-l-4",
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
