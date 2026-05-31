"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  BookOpen,
  Check,
  CheckCheck,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCcw,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import HomeworkFilters from "./components/HomeworkFilters";
import { useNotifications } from "@/contexts/notifications";
import type { Homework } from "@/lib/types";
import { downloadJSON, downloadCSV, downloadExcel } from "@/lib/import-export";
import ImportExportButtons from "@/components/ui/ImportExportButtons";
import { CustomSelect } from "@/components/ui/CustomSelect";

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
  return [...rows].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

function HomeworkModal({
  homework,
  groups,
  types,
  onClose,
  onSaved,
}: HomeworkModalProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const isEdit = !!homework;
  const [form, setForm] = useState<HomeworkFormState>(
    homework
      ? {
          title: homework.title,
          date: homework.date,
          group_name: homework.group_name,
          type: homework.type,
          status:
            homework.status.toLowerCase() === "completed"
              ? "completed"
              : "planning",
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
        setError(
          "error" in data && data.error
            ? data.error
            : "Failed to save homework",
        );
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
      className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4"
      onClick={onClose}
    >
      <div
        className="modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light sticky top-0 bg-white z-10 modal-header">
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
              <div className="mt-1">
                <CustomSelect
                  value={form.status}
                  onChange={(v) => setField("status", v as HomeworkStatus)}
                  options={[
                    { value: "planning", label: "Planning" },
                    { value: "completed", label: "Completed" },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                Group *
              </label>
              <div className="mt-1">
                <CustomSelect
                  value={form.group_name}
                  onChange={(v) => setField("group_name", v)}
                  options={[
                    { value: "", label: "Select group" },
                    ...groups.map((g) => ({ value: g, label: g })),
                  ]}
                />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-text-secondary uppercase tracking-wide">
                Type *
              </label>
              <div className="mt-1">
                <CustomSelect
                  value={form.type}
                  onChange={(v) => setField("type", v)}
                  options={[
                    { value: "", label: "Select type" },
                    ...types.map((t) => ({ value: t, label: t })),
                  ]}
                />
              </div>
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
        className="bg-white border border-border-light rounded-xl shadow-lg py-1 w-44 modal-panel"
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
            {(
              [
                { value: "planning" as const, label: "Planning" },
                { value: "completed" as const, label: "Completed" },
              ] as const
            ).map(({ value, label }) => {
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
                    className={`w-2 h-2 rounded-full shrink-0 ${
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

type GitHubFile = { name: string; content: string; sha: string };

const CONTENT_FILES = [
  "what-to-read.md",
  "what-to-write.md",
  "youtube-description.md",
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toFolderName(title: string, type: string): string {
  const lessonMatch = title.match(/Lesson\s+(\d+)/i);
  if (!lessonMatch) return slugify(title);

  const n = parseInt(lessonMatch[1]);
  const prefix = `L${String(n).padStart(2, "0")}`;

  // Prefer topics from parentheses: "Lesson 6: React (Props, Events, List)" → "Props, Events, List"
  const parenMatch = title.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const topics = parenMatch[1]
      .split(/[,\s]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0)
      .join("-");
    return topics ? `${prefix}-${topics}` : prefix;
  }

  // Fallback: strip lesson prefix and type name, kebab the rest
  let remainder = title.replace(/Lesson\s+\d+[:\s.]*/i, "").trim();
  const typeWords = type.split(/[\s\-,]+/).filter((w) => w.length > 1);
  for (const word of typeWords) {
    remainder = remainder.replace(new RegExp(`\\b${word}\\b`, "gi"), "");
  }
  const topics = remainder
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .join("-");
  return topics ? `${prefix}-${topics}` : prefix;
}

function getBasePath(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("react")) return "Studento/React/Homeworks";
  if (t.includes("web") && t.includes("workshop"))
    return "Studento/Web-Workshop-HTML-CSS/Homeworks";
  return "Studento/Front-End-Course-Content/Homeworks";
}

function fileTabLabel(name: string): string {
  const base = name.replace(/\.md$/, "").toLowerCase();
  if (base === "what-to-read") return "What to Read";
  if (base === "what-to-write") return "What to Write";
  if (base === "youtube-description") return "YouTube";
  return base.replace(/-/g, " ");
}

function parseInline(text: string): React.ReactNode {
  const parts = text.split(
    /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g,
  );
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code
          key={i}
          className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[12px] font-mono"
        >
          {part.slice(1, -1)}
        </code>
      );
    if (part.startsWith("**") && part.endsWith("**"))
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link)
      return (
        <a
          key={i}
          href={link[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:opacity-75 transition-opacity"
        >
          {link[1]}
        </a>
      );
    return <span key={i}>{part}</span>;
  });
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
        <h3
          key={i}
          className="text-[15px] font-semibold text-text-primary mt-4 mb-1"
        >
          {t.slice(4)}
        </h3>,
      );
    } else if (t.startsWith("## ")) {
      nodes.push(
        <h2
          key={i}
          className="text-[16px] font-bold text-text-primary mt-5 mb-1.5"
        >
          {t.slice(3)}
        </h2>,
      );
    } else if (t.startsWith("# ")) {
      nodes.push(
        <h1
          key={i}
          className="text-[18px] font-bold text-text-primary mt-5 mb-2"
        >
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
            <span className="text-text-muted shrink-0 min-w-6">{m[1]}.</span>
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

function MarkdownHelpTooltip() {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface-container transition-colors">
        <HelpCircle size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-border-light rounded-xl shadow-xl p-4 z-50">
          <p className="text-[13px] font-bold text-text-primary mb-3">
            Markdown Cheatsheet
          </p>
          <div className="space-y-2 text-[12px] font-mono">
            {[
              ["# H1", "## H2", "### H3"],
              ["**bold**", "*italic*"],
              ["`inline code`"],
              ["``` code block ```"],
              ["- list item", "1. ordered item"],
              ["[link text](https://url)"],
              ["> blockquote"],
            ].map((group, i) => (
              <div key={i} className="flex flex-wrap gap-1.5">
                {group.map((item, j) => (
                  <code
                    key={j}
                    className="bg-surface-container text-primary px-1.5 py-0.5 rounded text-[11px]"
                  >
                    {item}
                  </code>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ContentPanel({ row }: { row: HomeworkRow }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [folderPath, setFolderPath] = useState("");
  const [activeFile, setActiveFile] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [addingFile, setAddingFile] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editPreview, setEditPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [copyDone, setCopyDone] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    async function load() {
      setStatus("loading");
      setFiles([]);
      setFolderPath("");
      setActiveFile("");
      setErrorMsg("");
      setEditingFile(null);
      setAddingFile(null);
      setCreating(false);
      setCreateError("");

      const res = await fetch(
        `/api/homework/github-content?title=${slugify(row.title)}&type=${slugify(row.type)}`,
      );
      const data = (await res.json()) as
        | { files: GitHubFile[]; folderPath: string }
        | { error: string };
      if (!res.ok || "error" in data) {
        setErrorMsg("error" in data ? data.error : "Failed to load content");
        setStatus("error");
        return;
      }
      setFiles(data.files);
      setFolderPath(data.folderPath);
      setActiveFile(data.files[0]?.name ?? "");
      setStatus("loaded");
    }
    load().catch(() => {
      setErrorMsg("Network error");
      setStatus("error");
    });
  }, [row.id, row.group_name, row.title, row.type]);

  const activeFileData = files.find((f) => f.name === activeFile);
  const activeContent = activeFileData?.content ?? "";
  const missingFiles = CONTENT_FILES.filter(
    (f) => !files.find((e) => e.name === f),
  );
  const isEditing = editingFile !== null || addingFile !== null;

  async function handleSave() {
    const fileName = editingFile ?? addingFile;
    if (!fileName) return;
    setSaving(true);
    setSaveError("");
    const fileData = files.find((f) => f.name === fileName);
    try {
      const res = await fetch("/api/homework/github-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: `${folderPath}/${fileName}`,
          content: editContent,
          ...(fileData ? { sha: fileData.sha } : {}),
        }),
      });
      const data = (await res.json()) as { sha: string } | { error: string };
      if (!res.ok || "error" in data) {
        setSaveError("error" in data ? data.error : "Save failed");
        return;
      }
      const newSha = (data as { sha: string }).sha;
      if (!fileData) {
        setFiles((cur) => [
          ...cur,
          { name: fileName, content: editContent, sha: newSha },
        ]);
        setActiveFile(fileName);
      } else {
        setFiles((cur) =>
          cur.map((f) =>
            f.name === fileName
              ? { ...f, content: editContent, sha: newSha }
              : f,
          ),
        );
      }
      setEditingFile(null);
      setAddingFile(null);
    } catch {
      setSaveError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(fileName: string) {
    const fileData = files.find((f) => f.name === fileName);
    if (!fileData) return;
    try {
      const res = await fetch("/api/homework/github-content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: `${folderPath}/${fileName}`,
          sha: fileData.sha,
        }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Delete failed");
      }
      const remaining = files.filter((f) => f.name !== fileName);
      setFiles(remaining);
      setConfirmDelete(null);
      if (activeFile === fileName) setActiveFile(remaining[0]?.name ?? "");
    } catch {
      // leave confirm open for retry
    }
  }

  function handleCopy() {
    navigator.clipboard
      .writeText(isEditing ? editContent : activeContent)
      .then(() => {
        setCopyDone(true);
        setTimeout(() => setCopyDone(false), 2000);
      });
  }

  function startEdit(fileName: string) {
    const fileData = files.find((f) => f.name === fileName);
    setEditContent(fileData?.content ?? "");
    setEditPreview(false);
    setSaveError("");
    setEditingFile(fileName);
    setAddingFile(null);
  }

  function startAdd(fileName: string) {
    setEditContent("");
    setEditPreview(false);
    setSaveError("");
    setAddingFile(fileName);
    setEditingFile(null);
    setAddMenuOpen(false);
  }

  function cancelEdit() {
    setEditingFile(null);
    setAddingFile(null);
    setSaveError("");
    setEditPreview(false);
  }

  async function handleCreateFolder() {
    setCreating(true);
    setCreateError("");
    const basePath = getBasePath(row.type);
    const folderName = toFolderName(row.title, row.type);
    const newFolderPath = `${basePath}/${folderName}`;
    try {
      const created: GitHubFile[] = [];
      for (const fileName of CONTENT_FILES) {
        const res = await fetch("/api/homework/github-content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: `${newFolderPath}/${fileName}`,
            content: "",
          }),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error ?? "Failed to create file");
        }
        const data = (await res.json()) as { sha: string };
        created.push({ name: fileName, content: "", sha: data.sha });
      }
      setFiles(created);
      setFolderPath(newFolderPath);
      setActiveFile(created[0].name);
      setStatus("loaded");
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create folder",
      );
    } finally {
      setCreating(false);
    }
  }

  const editLabel = editingFile
    ? `Editing: ${fileTabLabel(editingFile)}`
    : `Creating: ${fileTabLabel(addingFile ?? "")}`;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start gap-3 px-5 py-4 border-b border-border-light shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <FileText size={15} className="text-text-muted shrink-0" />
            <span className="text-[14px] text-text-muted font-medium">
              {row.group_name}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-semibold ${row.statusBadgeBg} ${row.statusColor}`}
            >
              <row.statusIcon size={12} />
              {row.statusLabel}
            </span>
          </div>
          <h3 className="text-[18px] font-bold text-text-primary leading-tight">
            {row.title}
          </h3>
          <p className="text-[14px] text-text-muted mt-0.5">
            {row.displayDate} · {row.type}
          </p>
        </div>
      </div>

      {/* Tab bar + actions */}
      <div className="flex items-center border-b border-border-light px-4 shrink-0">
        <div className="flex flex-1 overflow-x-auto">
          {isEditing ? (
            <span className="px-4 py-3 text-[15px] font-medium text-primary border-b-2 border-primary whitespace-nowrap">
              {editLabel}
            </span>
          ) : (
            files.map((f) => (
              <button
                key={f.name}
                onClick={() => setActiveFile(f.name)}
                className={`px-4 py-3 text-[15px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeFile === f.name
                    ? "border-primary text-primary"
                    : "border-transparent text-text-muted hover:text-text-primary"
                }`}
              >
                {fileTabLabel(f.name)}
              </button>
            ))
          )}
        </div>

        {status === "loaded" && (
          <div className="flex items-center gap-0.5 shrink-0 pl-3 border-l border-border-light ml-2 my-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setEditPreview((v) => !v)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] text-text-secondary border border-border-light rounded-lg hover:bg-surface-gray-light transition-colors"
                >
                  {editPreview ? <EyeOff size={13} /> : <Eye size={13} />}
                  {editPreview ? "Edit" : "Preview"}
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-2.5 py-1.5 text-[13px] text-text-secondary hover:bg-surface-gray-light rounded-lg transition-colors ml-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors ml-1"
                >
                  {saving && <Loader2 size={12} className="animate-spin" />}
                  Save
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCopy}
                  title={copyDone ? "Copied!" : "Copy markdown"}
                  className={`p-2 rounded-lg transition-colors ${
                    copyDone
                      ? "text-success"
                      : "text-text-muted hover:text-primary hover:bg-surface-container"
                  }`}
                >
                  {copyDone ? <CheckCheck size={15} /> : <Copy size={15} />}
                </button>
                {activeFileData && (
                  <button
                    onClick={() => startEdit(activeFile)}
                    title="Edit"
                    className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-surface-container transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                )}
                {activeFileData && (
                  <button
                    onClick={() => setConfirmDelete(activeFile)}
                    title="Delete"
                    className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error-light transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
                {missingFiles.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setAddMenuOpen((v) => !v)}
                      title="Add file"
                      className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-surface-container transition-colors"
                    >
                      <Plus size={15} />
                    </button>
                    {addMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setAddMenuOpen(false)}
                        />
                        <div className="absolute right-0 top-full mt-1 bg-white border border-border-light rounded-xl shadow-lg py-1 w-44 z-20">
                          {missingFiles.map((f) => (
                            <button
                              key={f}
                              onClick={() => startAdd(f)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-text-primary hover:bg-surface-container transition-colors"
                            >
                              <Plus size={13} className="text-text-muted" />
                              {fileTabLabel(f)}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
                <MarkdownHelpTooltip />
              </>
            )}
          </div>
        )}
      </div>

      {/* Save error */}
      {saveError && (
        <div className="mx-5 mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-[13px] text-error flex items-center justify-between shrink-0">
          {saveError}
          <button
            onClick={() => setSaveError("")}
            className="ml-2 text-text-muted hover:text-error"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {isEditing ? (
          editPreview ? (
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {editContent ? (
                <MarkdownContent text={editContent} />
              ) : (
                <p className="text-text-muted text-[14px] italic">
                  Nothing to preview yet.
                </p>
              )}
            </div>
          ) : (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 resize-none p-5 font-mono text-[13px] leading-relaxed outline-none bg-white placeholder:text-text-muted"
              placeholder="Write markdown here…"
              spellCheck={false}
            />
          )
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {confirmDelete && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
                <span className="text-[13px] text-error font-semibold">
                  Delete &ldquo;{fileTabLabel(confirmDelete)}&rdquo;?
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(confirmDelete)}
                    className="px-3 py-1 bg-error text-white rounded-lg text-[12px] font-bold hover:bg-[#b91c1c] transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-3 py-1 border border-border-light rounded-lg text-[12px] text-text-secondary hover:bg-surface-gray-light transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {status === "loading" && (
              <div className="flex items-center justify-center h-32 gap-2 text-text-muted">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-[14px]">Loading from GitHub…</span>
              </div>
            )}
            {status === "error" && (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <AlertTriangle size={24} className="text-warning" />
                <p className="text-[14px] font-semibold text-text-primary">
                  Content not found
                </p>
                <p className="text-[12px] text-text-muted max-w-64">
                  {errorMsg === "Folder not found"
                    ? `No folder matching "${row.title}" in the GitHub repo for this group.`
                    : errorMsg}
                </p>
                {errorMsg === "Folder not found" && (
                  <>
                    <button
                      onClick={handleCreateFolder}
                      disabled={creating}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-semibold hover:bg-primary-hover disabled:opacity-50 transition-colors"
                    >
                      {creating ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Plus size={14} />
                      )}
                      {creating ? "Creating…" : "Create content files"}
                    </button>
                    {createError && (
                      <p className="text-[12px] text-error">{createError}</p>
                    )}
                  </>
                )}
              </div>
            )}
            {status === "loaded" &&
              (activeContent ? (
                <MarkdownContent text={activeContent} />
              ) : (
                <p className="text-text-muted text-[14px] italic">
                  This file is empty.
                </p>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomeworkClient({
  initialHomework,
}: {
  initialHomework: Homework[];
}) {
  const [homework, setHomework] = useState(() =>
    sortByDateDesc(initialHomework),
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalHomework, setModalHomework] = useState<Homework | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<MenuAnchor | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);

  const groups = useMemo(
    () =>
      [...new Set(homework.map((row) => row.group_name).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b),
      ),
    [homework],
  );

  const activeGroups = useMemo(
    () =>
      [
        ...new Set(
          homework
            .filter((row) => row.status.toLowerCase() === "planning")
            .map((row) => row.group_name)
            .filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [homework],
  );
  const types = useMemo(
    () =>
      [...new Set(homework.map((row) => row.type).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b),
      ),
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

  const effectiveSelectedId = useMemo(() => {
    if (filteredRows.length === 0) return null;
    if (selectedId && filteredRows.find((r) => r.id === selectedId))
      return selectedId;
    return filteredRows[0].id;
  }, [filteredRows, selectedId]);

  const selectedRow = useMemo(
    () => filteredRows.find((r) => r.id === effectiveSelectedId) ?? null,
    [filteredRows, effectiveSelectedId],
  );

  const { add: notify } = useNotifications();

  const refreshHomework = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/homework");
      if (!res.ok) {
        throw new Error("Failed to refresh homework");
      }
      const data = (await res.json()) as Homework[];
      setHomework(sortByDateDesc(data));
    } catch {
      notify("Failed to refresh homework", "error");
    } finally {
      setIsRefreshing(false);
    }
  }, [notify]);

  useEffect(() => {
    const init = async () => {
      await refreshHomework();
    };
    init();

    const handleFocus = () => {
      refreshHomework();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshHomework]);

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
      throw new Error(
        "error" in data && data.error ? data.error : "Failed to save homework",
      );
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

  async function handleStatusChange(row: HomeworkRow, status: HomeworkStatus) {
    setActionBusyId(row.id);
    let saved = false;
    try {
      const updated = await persistHomework(
        "PATCH",
        `/api/homework/${row.id}`,
        { status },
      );
      upsertHomework(updated);
      notify(`"${row.title}" marked ${status}`);
      saved = true;
    } catch {
      notify("Failed to update homework status", "error");
    } finally {
      setActionBusyId(null);
      if (saved) setMenuAnchor(null);
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
      notify(`Homework "${row.title}" deleted`);
      setMenuAnchor(null);
    } catch {
      notify("Failed to delete homework", "error");
    } finally {
      setActionBusyId(null);
    }
  }

  function openMenu(homeworkRow: HomeworkRow, target: HTMLButtonElement) {
    const rect = target.getBoundingClientRect();
    setMenuAnchor({
      homework: homeworkRow,
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  }

  function copyTitleToClipboard(title: string, id: string) {
    try {
      navigator.clipboard.writeText(title);
      setSelectedId(id);
      setCopiedTitle(id);
      window.setTimeout(() => setCopiedTitle(null), 1400);
    } catch {
      // ignore clipboard errors silently
    }
  }

  function resetFilters() {
    setGroupFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
  }

  const HW_HEADERS = ["Title", "Date", "Group", "Type", "Status", "Notes"];

  function getHwRows() {
    return homework.map((h) => [
      h.title,
      h.date,
      h.group_name,
      h.type,
      h.status,
      h.notes ?? "",
    ]);
  }

  function handleExport(format: "json" | "csv" | "excel") {
    if (format === "json") {
      downloadJSON(homework, "homework");
    } else if (format === "csv") {
      downloadCSV(HW_HEADERS, getHwRows(), "homework");
    } else {
      downloadExcel(HW_HEADERS, getHwRows(), "homework", "Homework");
    }
  }

  async function handleImport(importedRows: Record<string, string>[]) {
    for (const row of importedRows) {
      await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: row["Title"] ?? row["title"] ?? "",
          date:
            row["Date"] ?? row["date"] ?? new Date().toISOString().slice(0, 10),
          group_name: row["Group"] ?? row["group_name"] ?? "",
          type: row["Type"] ?? row["type"] ?? "",
          status: row["Status"] ?? row["status"] ?? "planning",
          notes: row["Notes"] ?? row["notes"] ?? null,
        }),
      });
    }
    window.location.reload();
  }

  return (
    <div className="min-h-screen md:h-screen flex flex-col bg-surface-gray-light md:overflow-hidden">
      <TopBar onSearch={() => {}} />

      {/* Header + filters */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-5 shrink-0">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-bold text-text-primary tracking-tight">
              Homework Overview
            </h1>
            <p className="text-[13px] text-text-secondary mt-0.5">
              Manage and track assignments across all learning groups.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={refreshHomework}
              type="button"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border-light text-[13px] text-text-secondary hover:bg-surface-gray-light transition-colors"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCcw size={14} />
              )}
              Refresh
            </button>
            <ImportExportButtons
              onExport={handleExport}
              onImport={handleImport}
            />
          </div>
        </div>
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
          activeGroups={activeGroups}
          types={types}
          onReset={resetFilters}
        />
      </div>

      {/* Two-pane area */}
      <div className="flex-1 md:overflow-hidden mx-3 sm:mx-6 my-3 sm:my-4 flex flex-col md:flex-row bg-white border border-border-light rounded-xl shadow-sm">
        {/* Left: compact list */}
        <div className="h-64 md:h-auto w-full md:w-[35vw] md:min-w-55 md:max-w-105 border-b border-border-light md:border-b-0 md:border-r overflow-y-auto md:shrink-0 flex flex-col">
          {filteredRows.length === 0 ? (
            <p className="p-4 text-[12px] text-text-muted text-center mt-8">
              No homework matches the current filters.
            </p>
          ) : (
            filteredRows.map((row) => (
              <div
                key={row.id}
                onClick={() => setSelectedId(row.id)}
                className={`px-3 py-2.5 cursor-pointer border-b border-border-light transition-all ${
                  effectiveSelectedId === row.id
                    ? "opacity-100 bg-surface-container"
                    : "opacity-[0.65] hover:opacity-100 hover:bg-surface-gray-light"
                }`}
              >
                <div className="flex items-start gap-1.5 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          row.displayStatus === "completed"
                            ? "bg-success"
                            : "bg-warning"
                        }`}
                      />
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          copyTitleToClipboard(row.title, row.id);
                        }}
                        className="text-[16px] font-semibold text-text-primary truncate leading-tight cursor-pointer"
                      >
                        {row.title}
                        {copiedTitle === row.id && (
                          <span className="ml-2 inline-flex items-center text-success">
                            <CheckCheck size={14} />
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 pl-3 flex-wrap">
                      <span className="text-[14px] text-text-muted shrink-0">
                        {row.displayDate}
                      </span>
                      <span className="text-[14px] px-1.5 py-0.5 rounded-full bg-surface-container text-primary font-bold truncate max-w-22.5">
                        {row.group_name}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openMenu(row, e.currentTarget as HTMLButtonElement);
                    }}
                    disabled={actionBusyId === row.id}
                    className="p-1 text-text-muted hover:text-primary transition-colors shrink-0 disabled:opacity-50 mt-0.5"
                  >
                    {actionBusyId === row.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <MoreVertical size={12} />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: content panel */}
        <div className="flex-1 overflow-y-auto md:overflow-hidden">
          {selectedRow ? (
            <ContentPanel row={selectedRow} />
          ) : (
            <div className="flex items-center justify-center h-full text-text-muted">
              <p className="text-[14px]">
                Select a homework to view its content.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FAB: add homework */}
      <button
        onClick={() => setModalHomework({} as Homework)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50"
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
            const isNew = !homework.some((h) => h.id === saved.id);
            notify(
              isNew
                ? `Homework "${saved.title}" added`
                : `Homework "${saved.title}" updated`,
            );
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
    </div>
  );
}
