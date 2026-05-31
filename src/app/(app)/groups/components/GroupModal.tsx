"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Group } from "@/lib/types";
import { useNotifications } from "@/contexts/notifications";
import {
  GROUP_STATUSES,
  GROUP_TYPES,
  type GroupFormState,
} from "../types";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface Props {
  group: Group | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function GroupModal({ group, onClose, onSaved }: Props) {
  const isEdit = group !== null;
  const { add: notify } = useNotifications();
  const [form, setForm] = useState<GroupFormState>({
    name: group?.name ?? "",
    type: group?.type ?? "React",
    status: group?.status ?? "Not started",
    started: group?.started ?? new Date().toISOString().slice(0, 10),
    finished: group?.finished ?? "",
    schedule_time: group?.schedule_time ?? "",
    journal_url: group?.journal_url ?? "",
    telegram_url: group?.telegram_url ?? "",
    notes: group?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof GroupFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name,
      type: form.type,
      status: form.status,
      started: form.started,
      finished: form.finished || null,
      schedule_time: form.schedule_time || null,
      journal_url: form.journal_url || null,
      telegram_url: form.telegram_url || null,
      notes: form.notes || null,
    };

    const endpoint = isEdit ? `/api/groups/${group!.id}` : "/api/groups";
    const method = isEdit ? "PATCH" : "POST";
    const body = isEdit
      ? payload
      : {
        id: crypto.randomUUID(),
        ...payload,
        members: null,
      };

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Failed to save group");
      notify(data.error ?? "Failed to save group", "error");
      return;
    }

    notify(isEdit ? `Group "${form.name}" updated` : `Group "${form.name}" created`);
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-bg-dark rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-bg-dark z-10">
          <h3 className="text-[16px] font-bold text-white">
            {isEdit ? "Edit Group" : "Create New Group"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-4">
          {error && (
            <p className="text-error text-[13px] bg-error/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wide">
              Name *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Group name"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-text-muted"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wide">
                Type *
              </label>
              <div className="mt-1">
                <CustomSelect
                  value={form.type}
                  onChange={(v) => set("type", v)}
                  options={GROUP_TYPES.map((t) => ({ value: t, label: t }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wide">
                Status *
              </label>
              <div className="mt-1">
                <CustomSelect
                  value={form.status}
                  onChange={(v) => set("status", v)}
                  options={GROUP_STATUSES.map((s) => ({ value: s, label: s }))}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wide">
                Started *
              </label>
              <input
                required
                type="date"
                value={form.started}
                onChange={(e) => set("started", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wide">
                Finished
              </label>
              <input
                type="date"
                value={form.finished}
                onChange={(e) => set("finished", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wide">
              Schedule
            </label>
            <input
              value={form.schedule_time}
              onChange={(e) => set("schedule_time", e.target.value)}
              placeholder="e.g. Mon/Wed 18:00"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-text-muted"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wide">
                Journal URL
              </label>
              <input
                value={form.journal_url}
                onChange={(e) => set("journal_url", e.target.value)}
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-text-muted"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wide">
                Telegram URL
              </label>
              <input
                value={form.telegram_url}
                onChange={(e) => set("telegram_url", e.target.value)}
                placeholder="https://t.me/..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-text-muted"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wide">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/10 rounded-lg text-[14px] font-semibold text-text-muted hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary text-white rounded-lg text-[14px] font-semibold hover:bg-primary-container disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
