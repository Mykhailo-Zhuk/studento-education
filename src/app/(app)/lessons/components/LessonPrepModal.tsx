"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, ExternalLink, X } from "lucide-react";
import type { Lesson } from "@/lib/types";
import { DAY_FULL, formatDisplayDate } from "../types";

interface Props {
  lesson: Lesson;
  onClose: () => void;
  onEdit: () => void;
}

export default function LessonPrepModal({ lesson, onClose, onEdit }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const [copied, setCopied] = useState(false);
  const dayName = useMemo(() => {
    const date = new Date(lesson.date);
    return Number.isNaN(date.getTime()) ? lesson.date : DAY_FULL[(date.getDay() + 6) % 7];
  }, [lesson.date]);

  const brief = useMemo(
    () => [
      `Lesson prep: ${lesson.title}`,
      `Date: ${formatDisplayDate(lesson.date)}`,
      `Group: ${lesson.group_name}`,
      `Type: ${lesson.type}`,
      `Duration: ${lesson.hours}h`,
      `Status: ${lesson.status}`,
      "",
      "Checklist:",
      "- Confirm topic and examples",
      "- Prepare slides / demo / exercises",
      "- Review homework or previous notes",
      "- Plan a short recap and wrap-up",
      "",
      `Best preparation day suggestion: ${dayName}`,
    ].join("\n"),
    [dayName, lesson.date, lesson.group_name, lesson.hours, lesson.status, lesson.title, lesson.type],
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4">
      <div className="modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-[18px] font-bold text-text-primary">
              Prepare Content
            </h3>
            <p className="text-[12px] text-text-secondary">
              {lesson.title} • {lesson.group_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-container text-text-muted hover:text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4 text-[13px]">
            <div className="rounded-xl border border-border-light p-4 bg-surface-gray-light">
              <p className="text-text-muted uppercase tracking-wider text-[11px] font-semibold">
                Session
              </p>
              <p className="mt-1 font-semibold text-text-primary">
                {formatDisplayDate(lesson.date)}
              </p>
              <p className="text-text-secondary">{dayName}</p>
            </div>
            <div className="rounded-xl border border-border-light p-4 bg-surface-gray-light">
              <p className="text-text-muted uppercase tracking-wider text-[11px] font-semibold">
                Status
              </p>
              <p className="mt-1 font-semibold text-text-primary">{lesson.status}</p>
              <p className="text-text-secondary">{lesson.hours}h planned</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] font-semibold text-text-primary">
                Copyable prep brief
              </p>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-light text-[12px] font-semibold text-text-primary hover:bg-surface-gray-light transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy brief"}
              </button>
            </div>
            <pre className="whitespace-pre-wrap break-words rounded-xl border border-border-light bg-surface-gray-light p-4 text-[13px] leading-6 text-text-primary overflow-auto">
              {brief}
            </pre>
          </div>

          <div className="flex flex-wrap gap-3 justify-end border-t border-border-light pt-4">
            <a
              href={lesson.youtube_url ?? "#"}
              target={lesson.youtube_url ? "_blank" : undefined}
              rel={lesson.youtube_url ? "noopener noreferrer" : undefined}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-[14px] font-semibold transition-colors ${
                lesson.youtube_url
                  ? "border-border-light text-text-primary hover:bg-surface-gray-light"
                  : "border-border-light text-text-muted pointer-events-none opacity-50"
              }`}
            >
              <ExternalLink size={14} />
              {lesson.youtube_url ? "Open recording" : "No recording yet"}
            </a>
            <button
              type="button"
              onClick={onEdit}
              className="px-4 py-2 rounded-lg bg-primary text-white text-[14px] font-semibold hover:bg-primary-hover transition-colors"
            >
              Edit lesson
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
