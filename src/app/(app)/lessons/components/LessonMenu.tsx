"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, ClipboardList, MessageSquare } from "lucide-react";
import type { Lesson } from "@/lib/types";
import { QUICK_STATUSES } from "../types";

interface Props {
  lesson: Lesson;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
  onToggleHomework: () => void;
  onToggleFeedback: () => void;
}

export default function LessonMenu({ lesson, onEdit, onDelete, onStatusChange, onToggleHomework, onToggleFeedback }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <button
        onClick={onEdit}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-text-primary hover:bg-surface-gray-light transition-colors"
      >
        <Pencil size={14} className="text-text-secondary" />
        Edit lesson
      </button>

      <div className="px-4 pt-2 pb-1.5">
        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">
          Quick status
        </p>
        <div className="flex flex-col gap-0.5">
          {QUICK_STATUSES.map(({ value, label, dot, text }) => {
            const active = lesson.status.toLowerCase() === value;
            return (
              <button
                key={value}
                onClick={() => onStatusChange(value)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[13px] font-medium transition-colors hover:bg-surface-container ${text} ${active ? "bg-surface-container" : ""}`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                {label}
                {active && <Check size={12} className="ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="my-1 border-t border-[#f1f5f9]" />

      <button
        onClick={onToggleHomework}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-surface-gray-light transition-colors"
      >
        <ClipboardList size={14} className={lesson.has_homework ? "text-warning" : "text-text-muted"} />
        <span className={lesson.has_homework ? "text-warning font-semibold" : "text-text-primary"}>
          Has Homework
        </span>
        {lesson.has_homework && <Check size={12} className="ml-auto text-warning" />}
      </button>

      <button
        onClick={onToggleFeedback}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-surface-gray-light transition-colors"
      >
        <MessageSquare size={14} className={lesson.has_feedback ? "text-success" : "text-text-muted"} />
        <span className={lesson.has_feedback ? "text-success font-semibold" : "text-text-primary"}>
          Feedback Given
        </span>
        {lesson.has_feedback && <Check size={12} className="ml-auto text-success" />}
      </button>

      <div className="my-1 border-t border-[#f1f5f9]" />

      {confirmDelete ? (
        <div className="px-4 py-2 space-y-2">
          <p className="text-[13px] text-error font-semibold">Delete this lesson?</p>
          <div className="flex gap-2">
            <button
              onClick={onDelete}
              className="flex-1 py-1.5 bg-error text-white rounded-lg text-[12px] font-bold hover:bg-[#b91c1c] transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 py-1.5 border border-border-light rounded-lg text-[12px] text-text-secondary hover:bg-surface-gray-light transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-error hover:bg-error-light transition-colors"
        >
          <Trash2 size={14} />
          Delete
        </button>
      )}
    </>
  );
}
