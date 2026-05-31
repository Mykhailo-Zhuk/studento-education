"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Group } from "@/lib/types";
import { useNotifications } from "@/contexts/notifications";
import { GROUP_STATUSES, GROUP_TYPES, type GroupFormState } from "../types";
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

    notify(
      isEdit ? `Group "${form.name}" updated` : `Group "${form.name}" created`,
    );
    onSaved();
  }

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center pb-20 modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[calc(90vh-5rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0 modal-header sticky top-0 z-10 border-b border-border-light bg-white rounded-t-2xl">
          <h3 className="text-[20px] font-bold text-text-primary">
            {isEdit ? "Edit Group" : "Create New Group"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 overflow-y-auto px-8 pb-2"
        >
          {error && (
            <p className="text-error text-[13px] bg-error/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          <div className="flex flex-col gap-1 mt-4">
            <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
              Name *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Group name"
              className="mt-1 w-full px-3 py-2 border border-border-light rounded-lg text-[14px] outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
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
              <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
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
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
                Started *
              </label>
              <input
                required
                type="date"
                value={form.started}
                onChange={(e) => set("started", e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-border-light rounded-lg text-[14px] outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
                Finished
              </label>
              <input
                type="date"
                value={form.finished}
                onChange={(e) => set("finished", e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-border-light rounded-lg text-[14px] outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
              Schedule
            </label>
            <input
              value={form.schedule_time}
              onChange={(e) => set("schedule_time", e.target.value)}
              placeholder="e.g. Mon/Wed 18:00"
              className="mt-1 w-full px-3 py-2 border border-border-light rounded-lg text-[14px] outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
                Journal URL
              </label>
              <input
                value={form.journal_url}
                onChange={(e) => set("journal_url", e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full px-3 py-2 border border-border-light rounded-lg text-[14px] outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
                Telegram URL
              </label>
              <input
                value={form.telegram_url}
                onChange={(e) => set("telegram_url", e.target.value)}
                placeholder="https://t.me/..."
                className="mt-1 w-full px-3 py-2 border border-border-light rounded-lg text-[14px] outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              className="mt-1 w-full px-3 py-2 border border-border-light rounded-lg text-[14px] outline-none focus:border-primary resize-none"
            />
          </div>
        </form>
        <div className="flex gap-3 px-8 py-6 shrink-0 border-t border-border-light">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-border-light rounded-lg text-[14px] hover:bg-surface-gray-light"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-[14px] font-semibold hover:bg-primary-hover disabled:opacity-60"
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
}
