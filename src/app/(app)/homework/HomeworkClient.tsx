"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  MoreVertical,
  Plus,
  Terminal,
  TrendingUp,
  Trash2,
  Pencil,
  Check,
  FileText,
} from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import HomeworkFilters from "./components/HomeworkFilters";
import type { Homework } from "@/lib/types";

type HomeworkStatus = "planning" | "completed";

type LucideIcon = typeof Terminal;

type HomeworkRow = Homework & {
  displayStatus: HomeworkStatus;
  statusLabel: "Planning" | "Completed";
  statusIcon: LucideIcon;
  statusColor: string;
  statusBadgeBg: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  displayDate: string;
};

type HomeworkFormState = {
  title: string;
  date: string;
  group_name: string;
  type: string;
  status: HomeworkStatus;
  notes: string;
};

type HomeworkModalProps = {
  homework?: Homework;
  groups: string[];
  types: string[];
  onClose: () => void;
  onSaved: (homework: Homework) => void;
};

type MenuAnchor = {
  homework: HomeworkRow;
  top: number;
  right: number;
};

const EMPTY_FORM: HomeworkFormState = {
  title: "",
  date: new Date().toISOString().slice(0, 10),
  group_name: "",
  type: "",
  status: "planning",
  notes: "",
};

function formatDisplayDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}-${date.getFullYear()}`;
}

function getIconInfo(type: string): {
  icon: LucideIcon;
  bg: string;
  color: string;
} {
  const t = type.toLowerCase();
  if (t.includes("react"))
    return { icon: Terminal, bg: "bg-[#dbeafe]", color: "text-info" };
  if (t.includes("javascript") || t.includes("js"))
    return { icon: Terminal, bg: "bg-warning-light", color: "text-warning" };
  return { icon: BookOpen, bg: "bg-surface-container", color: "text-primary" };
}

function getStatusInfo(status: string): {
  displayStatus: HomeworkStatus;
  label: "Planning" | "Completed";
  icon: LucideIcon;
  color: string;
  badgeBg: string;
} {
  const lower = status.toLowerCase();
  if (lower === "completed")
    return {
      displayStatus: "completed",
      label: "Completed",
      icon: CheckCircle2,
      color: "text-success",
      badgeBg: "bg-success-light",
    };
  return {
    displayStatus: "planning",
    label: "Planning",
    icon: AlertTriangle,
    color: "text-warning",
    badgeBg: "bg-warning-light",
  };
}

function sortByDateDesc(rows: Homework[]) {
  return [...rows].sort((a, b) => {
    const aTime = new Date(a.date).getTime();
    const bTime = new Date(b.date).getTime();
    return bTime - aTime;
  });
}

function HomeworkModal({
  homework,
  groups,
  types,
  onClose,
  onSaved,
}: HomeworkModalProps) {
  const isEdit = !!homework;
  const [form, setForm] = useState<HomeworkFormState>(
    homework
      ? {
          title: homework.title,
          date: homework.date,
          group_name: homework.group_name,
          type: homework.type,
          status: homework.status.toLowerCase() === "completed" ? "completed" : "planning",
          notes: homework.notes ?? "",
        }
      : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function setField<K extends keyof HomeworkFormState>(
    key: K,
    value: HomeworkFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title: form.title.trim(),
      date: form.date,
      group_name: form.group_name.trim(),
      type: form.type.trim(),
      status: form.status,
      notes: form.notes.trim() || null,
    };

    const endpoint = isEdit ? `/api/homework/${homework!.id}` : "/api/homework";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as Homework | { error?: string };

      if (!res.ok) {
        setError("error" in data && data.error ? data.error : "Failed to save homework");
        setSaving(false);
        return;
      }

      onSaved(data as Homework);
      onClose();
    } catch {
      setError("Failed to save homework");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full border border-border-light rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light sticky top-0 bg-white z-10">
          <h3 className="text-[16px] font-bold text-text-primary">
            {isEdit ? "Edit Homework" : "Add Homework"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-container text-text-muted hover:text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-4">
          {error && (
            <p className="text-red-500 text-[13px] bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div>
            <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
              Title *
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Homework title"
              className={`mt-1 ${inputCls}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                Date *
              </label>
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
                className={`mt-1 ${inputCls}`}
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                Status *
              </label>
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value as HomeworkStatus)}
                className={`mt-1 ${inputCls}`}
              >
                <option value="planning">Planning</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                Group *
              </label>
              <input
                required
                list="homework-groups"
                value={form.group_name}
                onChange={(e) => setField("group_name", e.target.value)}
                placeholder="Select or type group"
                className={`mt-1 ${inputCls}`}
              />
              <datalist id="homework-groups">
                {groups.map((group) => (
                  <option key={group} value={group} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                Type *
              </label>
              <input
                required
                list="homework-types"
                value={form.type}
                onChange={(e) => setField("type", e.target.value)}
                placeholder="Select or type type"
                className={`mt-1 ${inputCls}`}
              />
              <datalist id="homework-types">
                {types.map((type) => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              rows={3}
              placeholder="Optional notes"
              className={`mt-1 ${inputCls} resize-none`}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border-light">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border-light rounded-lg text-[14px] font-semibold text-text-secondary hover:bg-surface-gray-light transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary text-white rounded-lg text-[14px] font-semibold hover:bg-primary-hover disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Homework"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HomeworkActionMenu({
  anchor,
  onEdit,
  onDelete,
  onStatusChange,
  onClose,
}: {
  anchor: MenuAnchor | null;
  onEdit: (homework: HomeworkRow) => void;
  onDelete: (homework: HomeworkRow) => void;
  onStatusChange: (homework: HomeworkRow, status: HomeworkStatus) => void;
  onClose: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!anchor) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        style={{
          position: "fixed",
          top: anchor.top,
          right: anchor.right,
          zIndex: 50,
        }}
        className="bg-white border border-border-light rounded-xl shadow-lg py-1 w-44"
      >
        <button
          onClick={() => onEdit(anchor.homework)}
          className="w-full flex items-center gap-2 px-4 py-2 text-[13px] text-text-primary hover:bg-surface-container transition-colors"
        >
          <Pencil size={14} />
          Edit
        </button>

        <div className="px-4 pt-2 pb-1.5">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">
            Quick status
          </p>
          <div className="flex flex-col gap-0.5">
            {[
              { value: "planning" as const, label: "Planning" },
              { value: "completed" as const, label: "Completed" },
            ].map(({ value, label }) => {
              const active = anchor.homework.displayStatus === value;
              return (
                <button
                  key={value}
                  onClick={() => onStatusChange(anchor.homework, value)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[13px] font-medium transition-colors hover:bg-surface-container ${
                    active ? "bg-surface-container" : ""
                  } ${value === "completed" ? "text-success" : "text-warning"}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      value === "completed" ? "bg-success" : "bg-warning"
                    }`}
                  />
                  {label}
                  {active && <Check size={12} className="ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="my-1 border-t border-[#f1f5f9]" />

        {confirmDelete ? (
          <div className="px-4 py-2 space-y-2">
            <p className="text-[13px] text-error font-semibold">
              Delete this homework?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onDelete(anchor.homework)}
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
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-error hover:bg-error-light transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        )}
      </div>
    </>,
    document.body,
  );
}

type GitHubFile = { name: string; content: string };

function fileTabLabel(name: string): string {
  const base = name.replace(/\.md$/, "");
  if (base === "What-to-read") return "What to Read";
  if (base === "What-to-write") return "What to Write";
  if (base === "Youtube-description") return "YouTube";
  return base.replace(/-/g, " ");
}

function parseInline(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) =>
    part.startsWith("`") && part.endsWith("`") ? (
      <code
        key={i}
        className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[12px] font-mono"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function MarkdownContent({ text }: { text: string }) {
  let inCodeBlock = false;
  const codeLines: string[] = [];
  const nodes: React.ReactNode[] = [];

  for (const [i, line] of text.split("\n").entries()) {
    const t = line.trim();

    if (t.startsWith("```")) {
      if (inCodeBlock) {
        nodes.push(
          <pre
            key={`code-${i}`}
            className="bg-slate-100 rounded-lg p-3 text-[12px] font-mono overflow-x-auto my-2 whitespace-pre-wrap"
          >
            {codeLines.join("\n")}
          </pre>,
        );
        codeLines.length = 0;
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (!t) {
      nodes.push(<div key={i} className="h-1" />);
    } else if (t.startsWith("### ")) {
      nodes.push(
        <h3 key={i} className="text-[15px] font-semibold text-text-primary mt-4 mb-1">
          {t.slice(4)}
        </h3>,
      );
    } else if (t.startsWith("## ")) {
      nodes.push(
        <h2 key={i} className="text-[16px] font-bold text-text-primary mt-5 mb-1.5">
          {t.slice(3)}
        </h2>,
      );
    } else if (t.startsWith("# ")) {
      nodes.push(
        <h1 key={i} className="text-[18px] font-bold text-text-primary mt-5 mb-2">
          {t.slice(2)}
        </h1>,
      );
    } else if (/^[-*] /.test(t)) {
      nodes.push(
        <div key={i} className="flex gap-2 pl-2">
          <span className="text-text-muted shrink-0 mt-0.5">•</span>
          <span>{parseInline(t.slice(2))}</span>
        </div>,
      );
    } else if (/^\d+\. /.test(t)) {
      const m = t.match(/^(\d+)\. (.*)/);
      if (m) {
        nodes.push(
          <div key={i} className="flex gap-2 pl-2">
            <span className="text-text-muted shrink-0 min-w-[1.5rem]">{m[1]}.</span>
            <span>{parseInline(m[2])}</span>
          </div>,
        );
      }
    } else {
      nodes.push(
        <p key={i} className="text-[14px] leading-relaxed">
          {parseInline(t)}
        </p>,
      );
    }
  }

  return <div className="space-y-1 text-text-primary">{nodes}</div>;
}

function HomeworkDrawer({
  row,
  onClose,
}: {
  row: HomeworkRow;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [activeFile, setActiveFile] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setStatus("loading");
    setFiles([]);
    setActiveFile("");
    setErrorMsg("");

    fetch(
      `/api/homework/github-content?group_name=${encodeURIComponent(row.group_name)}&title=${encodeURIComponent(row.title)}`,
    )
      .then(async (res) => {
        const data = (await res.json()) as
          | { files: GitHubFile[] }
          | { error: string };
        if (!res.ok || "error" in data) {
          setErrorMsg("error" in data ? data.error : "Failed to load content");
          setStatus("error");
          return;
        }
        setFiles(data.files);
        setActiveFile(data.files[0]?.name ?? "");
        setStatus("loaded");
      })
      .catch(() => {
        setErrorMsg("Network error");
        setStatus("error");
      });
  }, [row.id, row.group_name, row.title]);

  const activeContent = files.find((f) => f.name === activeFile)?.content ?? "";

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[560px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-border-light shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <FileText size={14} className="text-text-muted shrink-0" />
              <span className="text-[11px] text-text-muted font-medium">
                {row.group_name}
              </span>
            </div>
            <h3 className="text-[15px] font-bold text-text-primary leading-tight truncate">
              {row.title}
            </h3>
            <p className="text-[12px] text-text-muted mt-0.5">
              {row.displayDate} · {row.type}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-container text-text-muted hover:text-primary transition-colors shrink-0 mt-0.5"
          >
            <X size={16} />
          </button>
        </div>

        {/* File tabs */}
        {status === "loaded" && files.length > 1 && (
          <div className="flex border-b border-border-light px-4 shrink-0 overflow-x-auto">
            {files.map((f) => (
              <button
                key={f.name}
                onClick={() => setActiveFile(f.name)}
                className={`px-4 py-3 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeFile === f.name
                    ? "border-primary text-primary"
                    : "border-transparent text-text-muted hover:text-text-primary"
                }`}
              >
                {fileTabLabel(f.name)}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {status === "loading" && (
            <div className="flex items-center justify-center h-32 gap-2 text-text-muted">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-[14px]">Loading from GitHub…</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-center">
              <AlertTriangle size={24} className="text-warning" />
              <p className="text-[14px] font-semibold text-text-primary">
                Content not found
              </p>
              <p className="text-[12px] text-text-muted max-w-64">
                {errorMsg === "Folder not found"
                  ? `No folder matching "${row.title}" in the GitHub repo for this group.`
                  : errorMsg}
              </p>
            </div>
          )}

          {status === "loaded" && activeContent && (
            <MarkdownContent text={activeContent} />
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}

export default function HomeworkClient({
  initialHomework,
}: {
  initialHomework: Homework[];
}) {
  const [homework, setHomework] = useState(() => sortByDateDesc(initialHomework));
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalHomework, setModalHomework] = useState<Homework | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<MenuAnchor | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [drawerRow, setDrawerRow] = useState<HomeworkRow | null>(null);

  const groups = useMemo(
    () =>
      [...new Set(homework.map((row) => row.group_name).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b)),
    [homework],
  );
  const types = useMemo(
    () =>
      [...new Set(homework.map((row) => row.type).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b)),
    [homework],
  );

  const rows = useMemo<HomeworkRow[]>(
    () =>
      homework.map((row) => {
        const iconInfo = getIconInfo(row.type);
        const statusInfo = getStatusInfo(row.status);

        return {
          ...row,
          displayStatus: statusInfo.displayStatus,
          statusLabel: statusInfo.label,
          statusIcon: statusInfo.icon,
          statusColor: statusInfo.color,
          statusBadgeBg: statusInfo.badgeBg,
          icon: iconInfo.icon,
          iconBg: iconInfo.bg,
          iconColor: iconInfo.color,
          displayDate: formatDisplayDate(row.date),
        };
      }),
    [homework],
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch =
        query.length === 0 ||
        row.title.toLowerCase().includes(query) ||
        row.date.toLowerCase().includes(query) ||
        row.displayDate.toLowerCase().includes(query);
      const matchesGroup =
        groupFilter === "all" || row.group_name === groupFilter;
      const matchesType = typeFilter === "all" || row.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || row.displayStatus === statusFilter;

      return matchesSearch && matchesGroup && matchesType && matchesStatus;
    });
  }, [groupFilter, rows, search, statusFilter, typeFilter]);

  const completedCount = rows.filter((row) => row.displayStatus === "completed").length;
  const overallPct =
    rows.length > 0 ? Math.round((completedCount / rows.length) * 100) : 0;

  async function persistHomework(
    method: "POST" | "PATCH",
    endpoint: string,
    payload: Record<string, unknown>,
  ) {
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as Homework | { error?: string };

    if (!res.ok) {
      throw new Error("error" in data && data.error ? data.error : "Failed to save homework");
    }

    return data as Homework;
  }

  function upsertHomework(saved: Homework) {
    setHomework((current) =>
      sortByDateDesc(
        current.some((row) => row.id === saved.id)
          ? current.map((row) => (row.id === saved.id ? saved : row))
          : [saved, ...current],
      ),
    );
  }

  async function handleStatusChange(
    row: HomeworkRow,
    status: HomeworkStatus,
  ) {
    setActionBusyId(row.id);
    let saved = false;
    try {
      const updated = await persistHomework("PATCH", `/api/homework/${row.id}`, {
        status,
      });
      upsertHomework(updated);
      saved = true;
    } catch {
      // Keep the menu open and let the user retry.
    } finally {
      setActionBusyId(null);
      if (saved) {
        setMenuAnchor(null);
      }
    }
  }

  async function handleDelete(row: HomeworkRow) {
    setActionBusyId(row.id);
    try {
      const res = await fetch(`/api/homework/${row.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to delete homework");
      }
      setHomework((current) => current.filter((item) => item.id !== row.id));
      setMenuAnchor(null);
    } catch {
      // No toast system here yet, so keep the row available for another attempt.
    } finally {
      setActionBusyId(null);
    }
  }

  function openMenu(
    homeworkRow: HomeworkRow,
    target: HTMLButtonElement,
  ) {
    const rect = target.getBoundingClientRect();
    setMenuAnchor({
      homework: homeworkRow,
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  }

  function resetFilters() {
    setGroupFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
  }

  const hasRows = filteredRows.length > 0;

  return (
    <div className="min-h-screen bg-surface-gray-light">
      <TopBar breadcrumb={["Main Hub", "Homework"]} />

      <main className="p-4 sm:p-6 lg:p-10">
        <div className="flex justify-between items-end mb-4 sm:mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-text-primary tracking-tight">
              Homework Overview
            </h1>
            <p className="text-[14px] text-text-secondary mt-1">
              Manage and track assignments across all learning groups.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="md:col-span-3">
            <HomeworkFilters
              search={search}
              onSearchChange={setSearch}
              groupFilter={groupFilter}
              onGroupChange={setGroupFilter}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              groups={groups}
              types={types}
              onReset={resetFilters}
            />
          </div>

          <div className="bg-primary text-white rounded-xl p-4 shadow-lg flex flex-col justify-center relative overflow-hidden md:col-span-1">
            <div className="relative z-10">
              <span className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
                Completion Rate
              </span>
              <div className="text-[28px] font-black leading-none mt-0.5">
                {overallPct}%
              </div>
              <p className="text-[11px] opacity-90 mt-0.5">
                {completedCount} of {rows.length}
              </p>
            </div>
            <TrendingUp
              size={60}
              className="absolute -right-3 -bottom-3 opacity-15"
            />
          </div>
        </div>

        <div className="bg-white border border-border-light rounded-xl shadow-sm overflow-hidden mb-4 sm:mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-[1120px] w-full table-fixed text-left border-collapse">
              <thead>
                <tr className="bg-surface-gray-light border-b border-border-light">
                  <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-wide text-text-muted w-[38%]">
                    Assignment
                  </th>
                  <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-wide text-text-muted w-[16%] whitespace-nowrap">
                    Group
                  </th>
                  <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-wide text-text-muted w-[16%] whitespace-nowrap">
                    Date
                  </th>
                  <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-wide text-text-muted w-[16%] whitespace-nowrap">
                    Type
                  </th>
                  <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-wide text-text-muted w-[10%] whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-wide text-text-muted w-[4%]">
                    {" "}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {hasRows ? (
                  filteredRows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setDrawerRow(row)}
                      className="hover:bg-surface-gray-light transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-lg ${row.iconBg} ${row.iconColor} flex items-center justify-center shrink-0`}
                          >
                            <row.icon size={20} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[14px] font-semibold text-text-primary truncate">
                              {row.title}
                            </div>
                            {row.notes && (
                              <div className="text-[12px] text-text-muted truncate max-w-72">
                                {row.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container text-primary text-[12px] font-bold max-w-full truncate">
                          {row.group_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-text-secondary whitespace-nowrap">
                        {row.displayDate}
                      </td>
                      <td className="px-6 py-4 text-[12px] text-text-secondary whitespace-nowrap truncate">
                        {row.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${row.statusBadgeBg} ${row.statusColor}`}
                        >
                          <row.statusIcon size={14} />
                          <span className="text-[12px] font-semibold uppercase tracking-wide">
                            {row.statusLabel}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          disabled={actionBusyId === row.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openMenu(row, e.currentTarget);
                          }}
                          className="p-2 text-text-muted hover:text-primary transition-colors disabled:opacity-50"
                        >
                          {actionBusyId === row.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <MoreVertical size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-text-muted">
                      No homework matches the current search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 border-t border-border-light flex items-center justify-between">
            <span className="text-[12px] text-text-muted">
              Showing 1–{filteredRows.length} of {filteredRows.length} assignments
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled
                className="p-1.5 rounded-lg border border-border-light text-text-muted disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 rounded-lg border border-primary bg-primary text-white text-[13px] font-semibold">
                1
              </button>
              <button className="p-1.5 rounded-lg border border-border-light text-text-secondary hover:bg-surface-gray-light">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white border border-border-light rounded-xl p-6 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-warning-light flex items-center justify-center text-warning shrink-0">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h4 className="text-[18px] font-semibold text-text-primary">
                Planning Assignments
              </h4>
              <p className="text-[14px] text-text-secondary mt-0.5">
                {rows.filter((row) => row.displayStatus === "planning").length}{" "}
                assignments are still in planning.
              </p>
              <button className="mt-2 text-primary font-bold text-[14px] hover:underline flex items-center gap-1">
                Review planning <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="bg-white border border-border-light rounded-xl p-6 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center text-success shrink-0">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h4 className="text-[18px] font-semibold text-text-primary">
                Completed Ready
              </h4>
              <p className="text-[14px] text-text-secondary mt-0.5">
                {completedCount} completed assignments are ready for review.
              </p>
              <button className="mt-2 text-primary font-bold text-[14px] hover:underline flex items-center gap-1">
                Review completed <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <button
        onClick={() => setModalHomework({} as Homework)}
        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50"
      >
        <Plus size={24} />
      </button>

      {modalHomework !== null && (
        <HomeworkModal
          key={modalHomework.id ?? "new-homework"}
          homework={modalHomework.id ? modalHomework : undefined}
          groups={groups}
          types={types}
          onClose={() => setModalHomework(null)}
          onSaved={(saved) => {
            upsertHomework(saved);
            setModalHomework(null);
          }}
        />
      )}

      <HomeworkActionMenu
        anchor={menuAnchor}
        onEdit={(row) => {
          setMenuAnchor(null);
          setModalHomework(row);
        }}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onClose={() => setMenuAnchor(null)}
      />

      {drawerRow && (
        <HomeworkDrawer row={drawerRow} onClose={() => setDrawerRow(null)} />
      )}
    </div>
  );
}
