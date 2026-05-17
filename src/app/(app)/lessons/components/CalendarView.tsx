import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Lesson } from "@/lib/types";
import { DAY_SHORT, MONTHS } from "../types";

interface Props {
  lessons: Lesson[];
  calendarDate: Date;
  onPrev: () => void;
  onNext: () => void;
}

export default function CalendarView({ lessons, calendarDate, onPrev, onNext }: Props) {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;

  const lessonsByDate: Record<string, Lesson[]> = {};
  lessons.forEach((l) => {
    if (!l.date) return;
    (lessonsByDate[l.date] ??= []).push(l);
  });

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-border-light/80 rounded-xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center justify-between sm:justify-start gap-2 order-2 sm:order-1">
          <button onClick={onPrev} className="p-2 rounded-lg hover:bg-surface-container transition-colors">
            <ChevronLeft size={18} className="text-primary" />
          </button>
          <button onClick={onNext} className="p-2 rounded-lg hover:bg-surface-container transition-colors sm:hidden">
            <ChevronRight size={18} className="text-primary" />
          </button>
        </div>
        <h3 className="text-[16px] sm:text-[18px] font-bold text-text-primary order-1 sm:order-2 text-center">
          {MONTHS[month]} {year}
        </h3>
        <button onClick={onNext} className="p-2 rounded-lg hover:bg-surface-container transition-colors hidden sm:inline-flex order-3">
          <ChevronRight size={18} className="text-primary" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_SHORT.map((d) => (
              <div key={d} className="text-center text-[11px] sm:text-[12px] font-semibold text-text-muted py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayLessons = lessonsByDate[dateStr] ?? [];
              return (
                <div
                  key={i}
                  className={[
                    "min-h-[82px] sm:min-h-[96px] rounded-lg p-1.5 border transition-all",
                    isToday(day)
                      ? "bg-surface-container border-primary"
                      : "border-transparent hover:border-border-light hover:bg-[#fafafa]",
                  ].join(" ")}
                >
                  <span className={`text-[12px] sm:text-[13px] font-semibold ${isToday(day) ? "text-primary" : "text-text-secondary"}`}>
                    {day}
                  </span>
                  <div className="mt-1 flex flex-col gap-0.5">
                    {dayLessons.slice(0, 2).map((l) => (
                      <div
                        key={l.id}
                        title={l.title}
                        className="text-[9px] sm:text-[10px] px-1 py-0.5 rounded bg-primary/10 text-primary truncate"
                      >
                        {l.title}
                      </div>
                    ))}
                    {dayLessons.length > 2 && (
                      <div className="text-[9px] sm:text-[10px] text-text-muted">
                        +{dayLessons.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
