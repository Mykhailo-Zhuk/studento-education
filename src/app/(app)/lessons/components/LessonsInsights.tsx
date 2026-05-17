import { Loader2, Sparkles } from "lucide-react";
import { DAY_SHORT, DAY_FULL } from "../types";

interface Props {
  weeklyData: number[];
  bestDayIdx: number;
  lessonsCount: number;
  aiLoading: boolean;
  aiOptimized: boolean;
  onReoptimize: () => void;
}

export default function LessonsInsights({
  weeklyData,
  bestDayIdx,
  lessonsCount,
  aiLoading,
  aiOptimized,
  onReoptimize,
}: Props) {
  const maxWeekly = Math.max(...weeklyData, 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm border border-border-light/80 rounded-xl p-6 space-y-4">
        <div>
          <h3 className="text-[18px] font-semibold text-text-primary">Weekly Engagement Velocity</h3>
          <p className="text-[13px] text-text-muted mt-0.5">
            Number of lessons held per day of the week — highlights your busiest teaching days.
          </p>
        </div>
        <div className="h-48 w-full bg-surface-container rounded-lg flex items-end justify-between px-4 pb-4 pt-8 gap-2 relative overflow-visible">
          {weeklyData.map((count, i) => {
            const heightPct = (count / maxWeekly) * 100;
            const isBest = i === bestDayIdx && count > 0;
            return (
              <div key={i} className="flex flex-col items-center flex-1 h-full justify-end gap-1.5">
                <div
                  className="w-full rounded-t-sm relative"
                  style={{
                    height: `${Math.max(heightPct, 4)}%`,
                    backgroundColor: isBest ? "#630ed4" : "rgba(99,14,212,0.25)",
                  }}
                >
                  {isBest && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-bg-dark text-white text-[11px] px-2 py-0.5 rounded whitespace-nowrap">
                      {count} lessons
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-text-muted font-medium">{DAY_SHORT[i]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm border-2 border-dashed border-primary/30 rounded-xl p-6 flex flex-col justify-center items-center text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-primary-fixed-dim flex items-center justify-center">
          {aiLoading ? (
            <Loader2 size={28} className="text-primary animate-spin" />
          ) : (
            <Sparkles size={28} className="text-primary" />
          )}
        </div>
        <div>
          <h4 className="text-[18px] font-semibold text-primary">AI Scheduling Insight</h4>
          <p className="text-[13px] text-text-secondary mt-1">
            {aiLoading
              ? "Analyzing your lesson patterns…"
              : aiOptimized
                ? `Confirmed: ${DAY_FULL[bestDayIdx]} is your peak engagement day across ${lessonsCount} lessons.`
                : `Based on ${lessonsCount} lessons, ${DAY_FULL[bestDayIdx]} is your highest-volume teaching day.`}
          </p>
        </div>
        <button
          onClick={onReoptimize}
          disabled={aiLoading}
          className="text-primary font-bold text-[13px] hover:underline disabled:opacity-50"
        >
          {aiOptimized ? "Re-analyze" : "Re-optimize Schedule"}
        </button>
      </div>
    </div>
  );
}
