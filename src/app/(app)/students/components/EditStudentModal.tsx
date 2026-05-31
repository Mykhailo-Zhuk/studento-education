"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { TYPE_COLOR, type StudentRow } from "../types";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useNotifications } from "@/contexts/notifications";

interface Props {
  student: StudentRow;
  uniqueGroups: string[];
  onClose: () => void;
}

export default function EditStudentModal({
  student,
  uniqueGroups,
  onClose,
}: Props) {
  const router = useRouter();
  const { add: notify } = useNotifications();
  const [form, setForm] = useState({
    name: student.name,
    telegram: student.contact,
    group_name: student.group,
    type: student.type,
    status: student.statusRaw,
    started: student.started,
    finished: student.finished ?? "",
    github_username: student.githubUsername ?? "",
    exam_project_url: student.examProjectUrl ?? "",
    notes: student.notes ?? "",
  });
  const [saving, setSaving] = useState(false);

  // Prevent body scroll while modal is open
  useEffect(() => {
    const prev = {
      overflow: document.body.style.overflow,
      overscroll: document.body.style.overscrollBehavior,
    };
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = prev.overflow;
      document.body.style.overscrollBehavior = prev.overscroll;
    };
  }, []);

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
        exam_project_url: form.exam_project_url.trim() || null,
        notes: form.notes.trim() || null,
      }),
    });
    if (!res.ok) {
      notify("Failed to update student", "error");
      setSaving(false);
      return;
    }
    notify(`Student "${form.name.trim()}" updated`);
    setSaving(false);
    onClose();
    router.refresh();
  }

  const field = (className = "") =>
    `mt-1 w-full px-3 py-2 border border-border-light rounded-lg text-[14px] outline-none focus:border-primary ${className}`;
  const label =
    "text-[12px] font-semibold text-text-secondary uppercase tracking-wider";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center pb-20 modal-overlay" onClick={onClose}>
      <div className="modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 flex flex-col max-h-[calc(90vh-5rem)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0">
          <h3 className="text-[20px] font-bold text-text-primary">Edit Student</h3>
          <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto px-8 pb-2">
          <div>
            <label className={label}>Full Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={field()}
            />
          </div>
          <div>
            <label className={label}>Telegram</label>
            <input
              value={form.telegram}
              onChange={(e) => setForm((f) => ({ ...f, telegram: e.target.value }))}
              placeholder="@username"
              className={field()}
            />
          </div>
          <div>
            <label className={label}>Group *</label>
            <div className="mt-1">
              <CustomSelect
                value={form.group_name}
                onChange={(v) => setForm((f) => ({ ...f, group_name: v }))}
                options={[{ value: "", label: "Select a group" }, ...uniqueGroups.map((g) => ({ value: g, label: g }))]}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={label}>Type</label>
              <div className="mt-1">
                <CustomSelect
                  value={form.type}
                  onChange={(v) => setForm((f) => ({ ...f, type: v }))}
                  options={Object.keys(TYPE_COLOR).map((t) => ({ value: t, label: t }))}
                />
              </div>
            </div>
            <div className="flex-1">
              <label className={label}>Status</label>
              <div className="mt-1">
                <CustomSelect
                  value={form.status}
                  onChange={(v) => setForm((f) => ({ ...f, status: v }))}
                  options={[
                    { value: "Not Started", label: "Not Started" },
                    { value: "In progress", label: "In Progress" },
                    { value: "Interrupted", label: "Interrupted" },
                    { value: "End course", label: "End Course" },
                  ]}
                />
              </div>
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
            <label className={label}>Exam Project URL</label>
            <input value={form.exam_project_url} onChange={(e) => setForm((f) => ({ ...f, exam_project_url: e.target.value }))} placeholder="https://github.com/..." className={field()} />
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
