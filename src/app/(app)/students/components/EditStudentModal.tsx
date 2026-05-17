"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { TYPE_COLOR, type StudentRow } from "../types";

interface Props {
  student: StudentRow;
  uniqueGroups: string[];
  onClose: () => void;
}

export default function EditStudentModal({ student, uniqueGroups, onClose }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: student.name,
    telegram: student.contact,
    group_name: student.group,
    type: student.type,
    status: student.statusRaw,
    started: student.started,
    finished: student.finished ?? "",
    github_username: student.githubUsername ?? "",
    notes: student.notes ?? "",
    homework_scores: student.homeworkScores ?? "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/students/${student.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        telegram: form.telegram.trim() || null,
        group_name: form.group_name,
        type: form.type,
        status: form.status,
        started: form.started,
        finished: form.finished || null,
        github_username: form.github_username.trim() || null,
        homework_scores: form.homework_scores.trim() || null,
        notes: form.notes.trim() || null,
      }),
    });
    if (!res.ok) {
      setSaving(false);
      return;
    }
    setSaving(false);
    onClose();
    router.refresh();
  }

  const field = (className = "") =>
    `mt-1 w-full px-3 py-2 border border-border-light rounded-lg text-[14px] outline-none focus:border-primary ${className}`;
  const label = "text-[12px] font-semibold text-text-secondary uppercase tracking-wider";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0">
          <h3 className="text-[20px] font-bold text-text-primary">Edit Student</h3>
          <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto px-8 pb-2">
          <div>
            <label className={label}>Full Name *</label>
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={field()} />
          </div>
          <div>
            <label className={label}>Telegram</label>
            <input value={form.telegram} onChange={(e) => setForm((f) => ({ ...f, telegram: e.target.value }))} placeholder="@username" className={field()} />
          </div>
          <div>
            <label className={label}>Group *</label>
            <select required value={form.group_name} onChange={(e) => setForm((f) => ({ ...f, group_name: e.target.value }))} className={field("bg-white")}>
              <option value="">Select a group</option>
              {uniqueGroups.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={label}>Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className={field("bg-white")}>
                {Object.keys(TYPE_COLOR).map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className={label}>Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={field("bg-white")}>
                <option value="Not Started">Not Started</option>
                <option value="In progress">In Progress</option>
                <option value="Interrupted">Interrupted</option>
                <option value="End course">End Course</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={label}>Start Date</label>
              <input type="date" value={form.started} onChange={(e) => setForm((f) => ({ ...f, started: e.target.value }))} className={field()} />
            </div>
            <div className="flex-1">
              <label className={label}>End Date</label>
              <input type="date" value={form.finished} onChange={(e) => setForm((f) => ({ ...f, finished: e.target.value }))} className={field()} />
            </div>
          </div>
          <div>
            <label className={label}>GitHub Username</label>
            <input value={form.github_username} onChange={(e) => setForm((f) => ({ ...f, github_username: e.target.value }))} placeholder="username" className={field()} />
          </div>
          <div>
            <label className={label}>Homework Scores</label>
            <input value={form.homework_scores} onChange={(e) => setForm((f) => ({ ...f, homework_scores: e.target.value }))} placeholder="1,0,1,1,0" className={field("font-mono")} />
            <p className="mt-1 text-[11px] text-text-muted">Comma-separated: 1 = done, 0 = not done</p>
          </div>
          <div>
            <label className={label}>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} className={field("resize-none")} />
          </div>
        </form>
        <div className="flex gap-3 px-8 py-6 shrink-0 border-t border-border-light">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-border-light rounded-lg text-[14px] hover:bg-surface-gray-light">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-[14px] font-semibold hover:bg-primary-hover disabled:opacity-60">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
