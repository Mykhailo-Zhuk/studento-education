"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, Loader2, AlertTriangle } from "lucide-react";
import type {
  Homework,
  Lesson,
  Group,
  Student,
  StudentHomeworkRecord,
} from "@/lib/types";

type GitHubFile = { name: string; content: string; sha: string };

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatDate(value: string): string {
  const d = new Date(value);
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

function fileTabLabel(name: string): string {
  const base = name.replace(/\.md$/, "").toLowerCase();
  if (base === "what-to-read") return "What to Read";
  if (base === "what-to-write") return "What to Write";
  return base.replace(/-/g, " ");
}

function extractTopic(title: string): string | null {
  const paren = title.match(/\(([^)]+)\)/);
  if (paren) return paren[1].trim();
  const dash = title.match(/[-–]\s*(.+)$/);
  if (dash) return dash[1].trim();
  return null;
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
          className="bg-white/10 text-white/90 px-1.5 py-0.5 rounded text-[12px] font-mono"
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
            className="bg-white/10 rounded-lg p-3 text-[12px] font-mono overflow-x-auto my-2 whitespace-pre-wrap text-white/90"
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
        <h3 key={i} className="text-[15px] font-semibold text-white mt-4 mb-1">
          {t.slice(4)}
        </h3>,
      );
    } else if (t.startsWith("## ")) {
      nodes.push(
        <h2 key={i} className="text-[16px] font-bold text-white mt-5 mb-1.5">
          {t.slice(3)}
        </h2>,
      );
    } else if (t.startsWith("# ")) {
      nodes.push(
        <h1 key={i} className="text-[18px] font-bold text-white mt-5 mb-2">
          {t.slice(2)}
        </h1>,
      );
    } else if (/^[-*] /.test(t)) {
      nodes.push(
        <div key={i} className="flex gap-2 pl-2 text-white/85">
          <span className="text-text-muted shrink-0 mt-0.5">•</span>
          <span>{parseInline(t.slice(2))}</span>
        </div>,
      );
    } else if (/^\d+\. /.test(t)) {
      const m = t.match(/^(\d+)\. (.*)/);
      if (m)
        nodes.push(
          <div key={i} className="flex gap-2 pl-2 text-white/85">
            <span className="text-text-muted shrink-0 min-w-6">{m[1]}.</span>
            <span>{parseInline(m[2])}</span>
          </div>,
        );
    } else {
      nodes.push(
        <p key={i} className="text-[14px] leading-relaxed text-white/85">
          {parseInline(t)}
        </p>,
      );
    }
  }

  return <div className="space-y-1">{nodes}</div>;
}

function HomeworkDetailView({
  homework,
  onBack,
}: {
  homework: Homework;
  onBack: () => void;
}) {
  const [fetchStatus, setFetchStatus] = useState<
    "loading" | "loaded" | "error"
  >("loading");
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [activeFile, setActiveFile] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      setFetchStatus("loading");
      setFiles([]);
      setActiveFile("");
      setErrorMsg("");

      const res = await fetch(
        `/api/homework/github-content?title=${slugify(homework.title)}&type=${slugify(homework.type)}`,
      );
      const data = (await res.json()) as
        | { files: GitHubFile[]; folderPath: string }
        | { error: string };
      if (!res.ok || "error" in data) {
        setErrorMsg("error" in data ? data.error : "Failed to load content");
        setFetchStatus("error");
        return;
      }
      const filtered = data.files.filter(
        (f) => !f.name.toLowerCase().replace(/\.md$/, "").includes("youtube"),
      );
      setFiles(filtered);
      setActiveFile(filtered[0]?.name ?? "");
      setFetchStatus("loaded");
    }
    load().catch(() => {
      setErrorMsg("Network error");
      setFetchStatus("error");
    });
  }, [homework.id, homework.group_name, homework.title, homework.type]);

  const activeContent = files.find((f) => f.name === activeFile)?.content ?? "";

  return (
    <>
      <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-white/10 shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-white text-[16px] font-bold truncate">
            {homework.title}
          </h3>
          <p className="text-text-muted text-[12px] mt-0.5">
            {new Date(homework.date).toLocaleDateString()} · {homework.type}
          </p>
        </div>
      </div>

      {fetchStatus === "loaded" && files.length > 0 && (
        <div className="flex border-b border-white/10 px-2 shrink-0">
          {files.map((f) => (
            <button
              key={f.name}
              onClick={() => setActiveFile(f.name)}
              className={`px-4 py-2.5 text-[14px] font-medium border-b-2 transition-colors ${
                activeFile === f.name
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-white"
              }`}
            >
              {fileTabLabel(f.name)}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
        {fetchStatus === "loading" && (
          <div className="flex items-center justify-center h-32 gap-2 text-text-muted">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-[14px]">Loading from GitHub…</span>
          </div>
        )}
        {fetchStatus === "error" && (
          <div className="flex flex-col items-center py-10 gap-3 text-center">
            <AlertTriangle size={24} className="text-warning" />
            <p className="text-[14px] font-semibold text-white">
              Content not found
            </p>
            <p className="text-[12px] text-text-muted max-w-xs">{errorMsg}</p>
          </div>
        )}
        {fetchStatus === "loaded" &&
          (activeContent ? (
            <MarkdownContent text={activeContent} />
          ) : (
            <p className="text-text-muted text-[14px] italic">
              This file is empty.
            </p>
          ))}
      </div>
    </>
  );
}

interface StudentDataPopupProps {
  onClose: () => void;
  type: "homework" | "lessons" | "group" | "students" | "report";
  data: {
    student: Student;
    group: Group | null;
    lessons: Lesson[];
    homework: Homework[];
    studentHomeworkRecords: StudentHomeworkRecord[];
  };
}

export default function StudentDataPopup({
  onClose,
  type,
  data,
}: StudentDataPopupProps) {
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(
    null,
  );

  const getHomeworkStatus = (homeworkId: string | null) => {
    if (!homeworkId) return false;
    return (
      data.studentHomeworkRecords.find((rec) => rec.homework_id === homeworkId)
        ?.completed ?? false
    );
  };

  const isDrillDown = selectedHomework !== null;
  const maxW = isDrillDown
    ? "max-w-2xl"
    : type === "homework" || type === "report" || type === "lessons"
      ? "max-w-lg"
      : "max-w-sm";

  let content: React.ReactNode = null;
  let title = "";

  if (type === "homework") {
    title = `Homework (${data.homework.length})`;
    content =
      data.homework.length > 0 ? (
        <div className="space-y-2">
          {[...data.homework]
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            )
            .map((hw) => {
              const isCompleted = getHomeworkStatus(hw.id);
              return (
                <button
                  key={hw.id}
                  onClick={() => setSelectedHomework(hw)}
                  className="w-full text-left bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white font-semibold text-[16px]">
                      {hw.title}
                    </h4>
                    <span
                      className={`text-[13px] px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                        isCompleted
                          ? "bg-success/20 text-success"
                          : "bg-error/20 text-error"
                      }`}
                    >
                      {isCompleted ? "Done" : "Failed"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-text-muted text-[14px]">
                      {new Date(hw.date).toLocaleDateString()} · {hw.type}
                    </p>
                    <span className="text-primary text-[14px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                      View →
                    </span>
                  </div>
                </button>
              );
            })}
        </div>
      ) : (
        <p className="text-text-muted text-[14px]">No homework assigned</p>
      );
  } else if (type === "lessons") {
    title = `Lessons (${data.lessons.length})`;
    content =
      data.lessons.length > 0 ? (
        <div className="space-y-2">
          {[...data.lessons]
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            )
            .map((lesson) => (
              <div key={lesson.id} className="bg-white/5 rounded-lg p-3">
                <h4 className="text-white font-semibold text-[16px] mb-1">
                  {lesson.title}
                </h4>
                <p className="text-text-muted text-[14px]">
                  {new Date(lesson.date).toLocaleDateString()} · {lesson.hours}h
                  · {lesson.type}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-text-muted text-[14px]">
                    Status: {lesson.status}
                  </p>
                  {lesson.youtube_url && (
                    <a
                      href={lesson.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.8 15.5V8.5l6.3 3.5-6.3 3.5z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-text-muted text-[14px]">No lessons yet</p>
      );
  } else if (type === "group") {
    title = "Group Information";
    content = data.group ? (
      <div className="space-y-3">
        <div>
          <p className="text-text-muted text-[12px]">Group Name</p>
          <p className="text-white font-semibold">{data.group.name}</p>
        </div>
        <div>
          <p className="text-text-muted text-[12px]">Type</p>
          <p className="text-white">{data.group.type}</p>
        </div>
        <div>
          <p className="text-text-muted text-[12px]">Status</p>
          <p className="text-white capitalize">{data.group.status}</p>
        </div>
        {data.group.schedule_time && (
          <div>
            <p className="text-text-muted text-[12px]">Schedule</p>
            <p className="text-white">{data.group.schedule_time}</p>
          </div>
        )}
      </div>
    ) : (
      <p className="text-text-muted text-[14px]">No group information</p>
    );
  } else if (type === "students") {
    title = "Student Information";
    content = (
      <div className="space-y-3">
        <div>
          <p className="text-text-muted text-[12px]">Name</p>
          <p className="text-white font-semibold">{data.student.name}</p>
        </div>
        <div>
          <p className="text-text-muted text-[12px]">Type</p>
          <p className="text-white">{data.student.type}</p>
        </div>
        <div>
          <p className="text-text-muted text-[12px]">Status</p>
          <p className="text-white capitalize">{data.student.status}</p>
        </div>
        <div>
          <p className="text-text-muted text-[12px]">Group</p>
          <p className="text-white">{data.student.group_name}</p>
        </div>
        <div>
          <p className="text-text-muted text-[12px]">Started</p>
          <p className="text-white">{formatDate(data.student.started)}</p>
        </div>
      </div>
    );
  } else if (type === "report") {
    title = "Learning Report";

    const failedRecords = data.studentHomeworkRecords.filter(
      (r) => !r.completed,
    );
    const completedRecords = data.studentHomeworkRecords.filter(
      (r) => r.completed,
    );
    const failedHomework = failedRecords
      .map((r) => data.homework.find((hw) => hw.id === r.homework_id))
      .filter((hw): hw is Homework => hw !== undefined);
    const topics = [
      ...new Set(
        failedHomework
          .map((hw) => extractTopic(hw.title))
          .filter((t): t is string => t !== null),
      ),
    ];

    content = (
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-[24px] font-bold text-success">
              {completedRecords.length}
            </p>
            <p className="text-text-muted text-[11px] mt-0.5">Done</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-[24px] font-bold text-error">
              {failedRecords.length}
            </p>
            <p className="text-text-muted text-[11px] mt-0.5">Failed</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-[24px] font-bold text-white">
              {data.lessons.length}
            </p>
            <p className="text-text-muted text-[11px] mt-0.5">Lessons</p>
          </div>
        </div>

        {failedHomework.length > 0 ? (
          <>
            <div>
              <p className="text-text-muted text-[11px] font-semibold uppercase tracking-widest mb-2">
                Homework to complete
              </p>
              <div className="space-y-2">
                {failedHomework.map((hw) => (
                  <button
                    key={hw.id}
                    onClick={() => setSelectedHomework(hw)}
                    className="w-full text-left bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-white text-[13px] font-semibold">
                        {hw.title}
                      </p>
                      <span className="text-primary text-[12px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                        View →
                      </span>
                    </div>
                    <p className="text-text-muted text-[12px] mt-0.5">
                      {new Date(hw.date).toLocaleDateString()} · {hw.type}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {topics.length > 0 && (
              <div>
                <p className="text-text-muted text-[11px] font-semibold uppercase tracking-widest mb-2">
                  Pay more attention to
                </p>
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1.5 bg-primary/20 text-primary rounded-full text-[12px] font-medium border border-primary/30"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-[40px] mb-3">🎉</p>
            <p className="text-white text-[18px] font-bold">All caught up!</p>
            <p className="text-text-muted text-[14px] mt-1">
              All homework is completed.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
      onClick={onClose}
    >
      <div
        className={`modal-panel bg-bg-dark rounded-2xl shadow-2xl w-full ${maxW} mx-4 flex flex-col max-h-[80vh] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {isDrillDown ? (
          <HomeworkDetailView
            homework={selectedHomework!}
            onBack={() => setSelectedHomework(null)}
          />
        ) : (
          <>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10 shrink-0">
              <h3 className="text-white text-[18px] font-bold">{title}</h3>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
        <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-4">
              {content}
            </div>
          </>
        )}

        <div className="flex gap-3 px-6 py-4 shrink-0 border-t border-white/10">
          <button
            onClick={isDrillDown ? () => setSelectedHomework(null) : onClose}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-container transition-colors text-[14px] font-semibold"
          >
            {isDrillDown ? "← Back" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
