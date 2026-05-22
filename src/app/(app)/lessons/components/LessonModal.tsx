"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import type { Lesson, Group } from "@/lib/types";
import { EMPTY_FORM, type LessonForm } from "../types";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface Props {
  lesson?: Lesson;
  groups: Group[];
  onClose: () => void;
  onSaved: (l: Lesson) => void;
}

export default function LessonModal({ lesson, groups, onClose, onSaved }: Props) {
  const isEdit = !!lesson;
  const groupNames = groups.map((g) => g.name);
  const uniqueTypes = [...new Set(groups.map((g) => g.type).filter(Boolean))].sort();

  const [form, setForm] = useState<LessonForm>(
    lesson
      ? {
          title: lesson.title,
          date: lesson.date,
          hours: lesson.hours,
          group_name: lesson.group_name,
          type: lesson.type,
          status: lesson.status,
          has_homework: lesson.has_homework,
          has_feedback: lesson.has_feedback,
          comment: lesson.comment ?? "",
        }
      : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof LessonForm>(key: K, value: LessonForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleGroupChange(name: string) {
    const group = groups.find((g) => g.name === name);
    setForm((f) => ({ ...f, group_name: name, type: group?.type ?? f.type }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      date: form.date,
      hours: form.hours,
      group_name: form.group_name.trim(),
      type: form.type.trim() || "General",
      status: form.status,
      has_homework: form.has_homework,
      has_feedback: form.has_feedback,
      comment: form.comment.trim() || null,
    };

    const endpoint = isEdit ? `/api/lessons/${lesson!.id}` : "/api/lessons";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as Lesson | { error?: string };

      if (!res.ok) {
        setError("error" in data && data.error ? data.error : "Failed to save lesson");
        setSaving(false);
        return;
      }

      setSaving(false);
      onSaved(data as Lesson);
      onClose();
      return;
    } catch {
      setSaving(false);
      setError("Failed to save lesson");
      return;
    }
  }

  const inputCls = "w-full border border-border-light rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[22px] font-bold text-text-primary">{isEdit ? "Edit Lesson" : "New Lesson"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container transition-colors">
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-text-secondary mb-1">Title *</label>
            <input required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Lesson title" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-text-secondary mb-1">Date *</label>
              <input required type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-text-secondary mb-1">Hours *</label>
              <input required type="number" min={0.5} max={8} step={0.5} value={form.hours} onChange={(e) => set("hours", Number(e.target.value))} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-text-secondary mb-1">Group *</label>
              <CustomSelect
                value={form.group_name}
                onChange={handleGroupChange}
                options={[
                  { value: "", label: "Select group…" },
                  ...(form.group_name && !groupNames.includes(form.group_name)
                    ? [{ value: form.group_name, label: form.group_name }]
                    : []),
                  ...groupNames.map((name) => ({ value: name, label: name })),
                ]}
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-text-secondary mb-1">Type</label>
              <CustomSelect
                value={form.type}
                onChange={(v) => set("type", v)}
                options={[
                  { value: "", label: "Select type…" },
                  ...(form.type && !uniqueTypes.includes(form.type)
                    ? [{ value: form.type, label: form.type }]
                    : []),
                  ...uniqueTypes.map((t) => ({ value: t, label: t })),
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-text-secondary mb-1">Status</label>
            <CustomSelect
              value={form.status}
              onChange={(v) => set("status", v)}
              options={[
                { value: "not started", label: "Not Started" },
                { value: "planning", label: "Planning" },
                { value: "completed", label: "Completed" },
              ]}
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-[14px] text-text-secondary cursor-pointer">
              <input type="checkbox" checked={form.has_homework} onChange={(e) => set("has_homework", e.target.checked)} className="accent-primary" />
              Has Homework
            </label>
            <label className="flex items-center gap-2 text-[14px] text-text-secondary cursor-pointer">
              <input type="checkbox" checked={form.has_feedback} onChange={(e) => set("has_feedback", e.target.checked)} className="accent-primary" />
              Feedback Given
            </label>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-text-secondary mb-1">Comment</label>
            <textarea value={form.comment} onChange={(e) => set("comment", e.target.value)} rows={2} placeholder="Optional notes" className={`${inputCls} resize-none`} />
          </div>

          {error && <p className="text-[13px] text-error">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border-light rounded-xl text-text-secondary font-semibold text-[14px] hover:bg-surface-gray-light transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-white rounded-xl font-semibold text-[14px] hover:bg-primary-hover transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Lesson"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
