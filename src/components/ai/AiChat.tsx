"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import type { Lesson } from "@/lib/types";
import { Zap } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface StreamEvent {
  type: "status" | "done" | "error";
  text: string;
}

const CHAT_STORAGE_KEY = "studento.ai.chat.threads";
const ACTIVE_CHAT_KEY = "studento.ai.chat.active";

function createThread(title = "New chat"): ChatThread {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

function safeParseThreads(value: string | null): ChatThread[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as ChatThread[];
    return Array.isArray(parsed)
      ? parsed.filter(
          (thread) =>
            typeof thread?.id === "string" &&
            typeof thread?.title === "string" &&
            Array.isArray(thread?.messages),
        )
      : [];
  } catch {
    return [];
  }
}

function getInitialChatState(): {
  threads: ChatThread[];
  activeThreadId: string | null;
} {
  if (typeof window === "undefined") {
    const fallback = createThread("New chat");
    return { threads: [fallback], activeThreadId: fallback.id };
  }

  const storedThreads = safeParseThreads(
    localStorage.getItem(CHAT_STORAGE_KEY),
  );
  const threads =
    storedThreads.length > 0 ? storedThreads : [createThread("New chat")];
  const storedActiveId = localStorage.getItem(ACTIVE_CHAT_KEY);
  const activeThreadId =
    storedActiveId && threads.some((thread) => thread.id === storedActiveId)
      ? storedActiveId
      : (threads[0]?.id ?? null);

  return { threads, activeThreadId };
}

const QUICK_PROMPTS = [
  {
    icon: "⚙️",
    label: "CRUD команди",
    text: "/crud",
  },
  {
    icon: "📚",
    label: "Показати всі уроки",
    text: "Покажи список всіх уроків",
  },
  {
    icon: "📝",
    label: "Домашні завдання",
    text: "Покажи список домашніх завдань",
  },
  {
    icon: "👥",
    label: "Список студентів",
    text: "Покажи список всіх студентів",
  },
  { icon: "🏫", label: "Групи", text: "Покажи всі групи" },
];

const mdComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-1 mt-2 text-sm font-bold text-white">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-1 mt-2 text-sm font-semibold text-white">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-0.5 mt-1.5 text-xs font-semibold text-white">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-1.5 text-xs leading-relaxed text-white">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-1.5 ml-3 list-disc space-y-0.5 text-white">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-1.5 ml-3 list-decimal space-y-0.5 text-white">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="text-xs text-white">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-white">{children}</em>,
  code: ({ className, children }) => {
    if (className) {
      return (
        <code className="bg-transparent font-mono text-[11px] text-white">{children}</code>
      );
    }
    return (
      <code className="rounded bg-black/20 px-1 py-0.5 font-mono text-[11px] text-[#a78bfa]">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-1.5 overflow-x-auto rounded-lg bg-black/20 p-2 font-mono text-[11px] text-white">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mb-1.5 overflow-x-auto">
      <table className="w-full border-collapse text-[11px]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border-dark px-2 py-1 text-left font-semibold text-white">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border-dark px-2 py-1 text-white">
      {children}
    </td>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#a78bfa] underline"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-1.5 border-l-2 border-primary pl-3 italic text-text-muted">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-2 border-border-dark" />,
};

export default function AiChat() {
  const initialChatState = getInitialChatState();
  const [open, setOpen] = useState(false);
  const [threads, setThreads] = useState<ChatThread[]>(
    initialChatState.threads,
  );
  const [activeThreadId, setActiveThreadId] = useState<string | null>(
    initialChatState.activeThreadId,
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? null,
    [activeThreadId, threads],
  );
  const messages = useMemo(() => activeThread?.messages ?? [], [activeThread]);

  useEffect(() => {
    if (typeof window === "undefined" || threads.length === 0) return;
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (activeThreadId) {
      localStorage.setItem(ACTIVE_CHAT_KEY, activeThreadId);
    }
  }, [activeThreadId]);

  useEffect(() => {
    if (!open || lessons.length > 0) return;
    fetch("/api/lessons")
      .then((r) => r.json())
      .then((d) => setLessons(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [open, lessons.length]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
    };
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, liveStatus]);

  useEffect(() => {
    if (!input && inputRef.current) {
      inputRef.current.style.height = "48px";
      inputRef.current.style.overflowY = "hidden";
    }
  }, [input]);

  const mentionMatch = input.match(/@([^\s]*)$/);
  const mentionQuery = mentionMatch?.[1] ?? "";
  const showMentions = Boolean(mentionMatch);

  const filteredLessons = mentionQuery
    ? lessons.filter((l) =>
        l.title.toLowerCase().includes(mentionQuery.toLowerCase()),
      )
    : lessons.slice(0, 8);

  const insertMention = useCallback(
    (lesson: Lesson) => {
      const match = input.match(/@([^\s]*)$/);
      if (match) {
        setInput(input.slice(0, -match[0].length) + lesson.title);
      } else {
        setInput((prev) => prev + lesson.title);
      }
      inputRef.current?.focus();
    },
    [input],
  );

  const updateActiveThread = useCallback(
    (updater: (thread: ChatThread) => ChatThread) => {
      if (!activeThreadId) return;
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === activeThreadId ? updater(thread) : thread,
        ),
      );
    },
    [activeThreadId],
  );

  const selectThread = useCallback((threadId: string) => {
    setActiveThreadId(threadId);
    setShowHistory(false);
  }, []);

  const createNewChat = useCallback(() => {
    const thread = createThread("New chat");
    setThreads((prev) => [thread, ...prev]);
    setActiveThreadId(thread.id);
    setShowHistory(false);
  }, []);

  const renameThread = useCallback((thread: ChatThread) => {
    const nextTitle = window.prompt("New chat title", thread.title)?.trim();
    if (!nextTitle) return;
    setThreads((prev) =>
      prev.map((item) =>
        item.id === thread.id
          ? { ...item, title: nextTitle, updatedAt: new Date().toISOString() }
          : item,
      ),
    );
  }, []);

  const deleteThread = useCallback(
    (threadId: string) => {
      const thread = threads.find((item) => item.id === threadId);
      if (!thread) return;
      if (!window.confirm(`Delete "${thread.title}"?`)) return;
      setThreads((prev) => {
        const next = prev.filter((item) => item.id !== threadId);
        if (next.length === 0) {
          const fallback = createThread("Getting started");
          setActiveThreadId(fallback.id);
          return [fallback];
        }
        if (activeThreadId === threadId) {
          setActiveThreadId(next[0].id);
        }
        return next;
      });
      setShowHistory(false);
    },
    [activeThreadId, threads],
  );

  const stopGenerating = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setLiveStatus(null);
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    updateActiveThread((thread) => ({
      ...thread,
      messages: nextMessages,
      updatedAt: new Date().toISOString(),
      title:
        thread.messages.length === 0 &&
        /^(New chat|Getting started)$/i.test(thread.title)
          ? text.slice(0, 40)
          : thread.title,
    }));
    setInput("");
    setLoading(true);
    setLiveStatus("Думаю...");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const fallbackText = await res.text().catch(() => "");
        throw new Error(
          fallbackText || `Request failed with HTTP ${res.status}`,
        );
      }

      if (!res.body) throw new Error("No response stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";
        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          const event = JSON.parse(part.slice(6)) as StreamEvent;
          if (event.type === "status") {
            setLiveStatus(event.text);
          } else if (event.type === "done") {
            updateActiveThread((thread) => ({
              ...thread,
              messages: [
                ...thread.messages,
                { role: "assistant", content: event.text },
              ],
              updatedAt: new Date().toISOString(),
            }));
            setLiveStatus(null);
          } else if (event.type === "error") {
            updateActiveThread((thread) => ({
              ...thread,
              messages: [
                ...thread.messages,
                { role: "assistant", content: `⚠️ Помилка: ${event.text}` },
              ],
              updatedAt: new Date().toISOString(),
            }));
            setLiveStatus(null);
          }
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setLiveStatus(null);
        return;
      }
      const message =
        error instanceof Error
          ? error.message
          : "Не вдалося отримати відповідь";
      updateActiveThread((thread) => ({
        ...thread,
        messages: [
          ...thread.messages,
          {
            role: "assistant",
            content: `⚠️ Не вдалося отримати відповідь. ${message}`,
          },
        ],
        updatedAt: new Date().toISOString(),
      }));
      setLiveStatus(null);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="AI Асистент"
        className={`fixed bottom-6 right-6 z-65 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-primary via-primary to-secondary text-white shadow-[0_18px_60px_rgba(99,14,212,0.45)] ring-1 ring-white/10 transition-all hover:scale-105 hover:shadow-[0_22px_70px_rgba(99,14,212,0.58)] cursor-pointer ${open ? "hidden sm:flex" : ""}`}
      >
        {open ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <Zap size={24} fill="white" />
        )}
      </button>

      {/* Backdrop to close on outside click */}
      {open && (
        <div
          className="fixed inset-0 z-63 bg-slate-950/55 backdrop-blur-md"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed inset-0 z-64 flex items-start justify-center p-2 pt-2 sm:items-center sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative mt-2 flex h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col overflow-hidden border border-white/10 bg-[#0b1020] shadow-[0_28px_90px_rgba(0,0,0,0.6)] sm:mt-0 sm:h-[min(860px,calc(100dvh-2rem))] sm:w-full sm:max-w-270 sm:rounded-[28px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.20),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_36%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[28px_28px]" />

            <div className="relative z-10 flex items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-3.5 backdrop-blur-xl">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-secondary shadow-[0_16px_40px_rgba(99,14,212,0.35)]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line
                    x1="9"
                    y1="9"
                    x2="9.01"
                    y2="9"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1="15"
                    y1="9"
                    x2="15.01"
                    y2="9"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-semibold tracking-tight text-white">
                    Studento AI
                  </p>
                  <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                    {loading ? "Thinking" : "Ready"}
                  </span>
                </div>
                <p className="truncate text-[12px] text-text-muted">
                  {activeThread?.title ?? "New chat"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => setShowHistory((v) => !v)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-text-muted transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white sm:hidden cursor-pointer"
                  title="Історія чатів"
                >
                  History
                </button>
                <button
                  onClick={createNewChat}
                  className="hidden sm:block rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-text-muted transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white cursor-pointer"
                  title="Новий чат"
                >
                  New chat
                </button>
                {messages.length > 0 && (
                  <button
                    onClick={() =>
                      updateActiveThread((thread) => ({
                        ...thread,
                        messages: [],
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                    className="hidden sm:block rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-text-muted transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white cursor-pointer"
                    title="Очистити чат"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-text-muted transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="relative z-10 flex min-h-0 flex-1">
              <aside
                className={[
                  "w-[320px] shrink-0 border-r border-white/10 bg-black/10 p-3 backdrop-blur-xl",
                  showHistory ? "flex flex-col" : "hidden md:flex md:flex-col",
                ].join(" ")}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-text-muted">
                      Chat History
                    </p>
                    <p className="text-[12px] text-white/70">
                      {threads.length} conversations
                    </p>
                  </div>
                  <button
                    onClick={createNewChat}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-text-muted transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white cursor-pointer"
                  >
                    + New
                  </button>
                </div>

                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                  {threads.map((thread) => (
                    <div
                      key={thread.id}
                      className={[
                        "group rounded-2xl border p-3 transition-all",
                        thread.id === activeThreadId
                          ? "border-primary/40 bg-primary/10"
                          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
                      ].join(" ")}
                    >
                      <button
                        onClick={() => selectThread(thread.id)}
                        className="w-full text-left"
                      >
                        <div className="truncate text-[13px] font-medium text-white">
                          {thread.title}
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-text-muted">
                          <span>{thread.messages.length} messages</span>
                          <span>
                            {new Date(thread.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </button>

                      <div className="mt-3 flex items-center gap-2 opacity-80 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => renameThread(thread)}
                          className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1 text-[10px] text-text-muted transition-colors hover:border-white/20 hover:text-white cursor-pointer"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => deleteThread(thread.id)}
                          className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1 text-[10px] text-text-muted transition-colors hover:border-error/40 hover:text-error cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>

              <main className="relative flex min-w-0 flex-1 flex-col">
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-6">
                    {messages.length === 0 && (
                      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_16px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/15 px-3 py-1 text-[11px] text-text-muted">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            AI assistant
                          </div>
                          <h2 className="mt-4 text-[28px] font-semibold tracking-tight text-white sm:text-[34px]">
                            Ask like you would in ChatGPT or Gemini
                          </h2>
                          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-text-muted">
                            Start with a question, jump to a lesson with{" "}
                            <span className="text-white">@</span>, or use one of
                            the quick prompts.
                          </p>
                          <div className="mt-6 flex flex-wrap gap-2">
                            {QUICK_PROMPTS.slice(0, 3).map((p) => (
                              <button
                                key={p.text}
                                onClick={() => setInput(p.text)}
                                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[12px] text-white transition-colors hover:border-primary/40 hover:bg-primary/10 cursor-pointer"
                              >
                                {p.icon} {p.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-[28px] border border-white/10 bg-black/15 p-5 backdrop-blur-xl">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-text-muted">
                            Tips
                          </p>
                          <div className="mt-4 space-y-3">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <p className="text-[13px] font-medium text-white">
                                Use short prompts
                              </p>
                              <p className="mt-1 text-[12px] leading-relaxed text-text-muted">
                                Try asking for lists, summaries, or one specific
                                task.
                              </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <p className="text-[13px] font-medium text-white">
                                Use @ for lessons
                              </p>
                              <p className="mt-1 text-[12px] leading-relaxed text-text-muted">
                                Mention a lesson title to help the assistant
                                find the right context.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {messages.map((msg, i) => {
                      const isUser = msg.role === "user";
                      return (
                        <div
                          key={i}
                          className={`mb-4 flex items-end gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                        >
                          {!isUser && (
                            <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-secondary text-[12px] font-semibold text-white shadow-[0_14px_30px_rgba(99,14,212,0.25)] sm:flex">
                              AI
                            </div>
                          )}
                          <div
                            className={[
                              "max-w-[min(740px,88%)] rounded-3xl px-4 py-3 text-[14px] leading-relaxed shadow-sm",
                              isUser
                                ? "rounded-br-md bg-linear-to-br from-primary to-secondary text-white shadow-[0_14px_30px_rgba(99,14,212,0.25)]"
                                : "rounded-bl-md border border-white/10 bg-white/7 text-white backdrop-blur-xl",
                            ].join(" ")}
                          >
                            {isUser ? (
                              <p className="whitespace-pre-wrap">
                                {msg.content}
                              </p>
                            ) : (
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={mdComponents}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {liveStatus && (
                      <div className="mb-4 flex justify-start gap-3">
                        <div className="hidden h-9 w-9 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-secondary text-[12px] font-semibold text-white sm:flex">
                          AI
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-white/7 px-4 py-3 text-[13px] text-text-muted backdrop-blur-xl">
                          <span className="inline-flex items-center gap-2">
                            <span className="inline-flex gap-1">
                              {[0, 1, 2].map((i) => (
                                <span
                                  key={i}
                                  className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
                                  style={{ animationDelay: `${i * 150}ms` }}
                                />
                              ))}
                            </span>
                            {liveStatus}
                          </span>
                        </div>
                      </div>
                    )}

                    <div ref={scrollRef} />
                  </div>

                  {showMentions && filteredLessons.length > 0 && (
                    <div className="relative z-10 mx-3 mb-3 max-h-48 overflow-y-auto rounded-2xl border border-white/10 bg-bg-dark/95 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:mx-5">
                      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-text-muted">
                          Lessons
                        </p>
                        <span className="text-[10px] text-text-muted">
                          {filteredLessons.length}
                        </span>
                      </div>
                      {filteredLessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => insertMention(lesson)}
                          className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-white/5"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 text-sm">
                            📚
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[13px] text-white">
                            {lesson.title}
                          </span>
                          <span className="shrink-0 text-[11px] text-text-muted">
                            {lesson.group_name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="relative z-10 border-t border-white/10 bg-black/15 px-3 py-3 backdrop-blur-xl sm:px-5">
                    <div className="rounded-[26px] border border-white/10 bg-white/6 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
                      <div className="flex items-end gap-2">
                        <textarea
                          ref={inputRef}
                          value={input}
                          onChange={(e) => {
                            setInput(e.target.value);
                            const el = e.target;
                            el.style.height = "auto";
                            el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
                            el.style.overflowY =
                              el.scrollHeight > 132 ? "auto" : "hidden";
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              setInput((prev) =>
                                prev.replace(/@([^\s]*)$/, ""),
                              );
                              return;
                            }
                            if (
                              e.key === "Enter" &&
                              !e.shiftKey &&
                              !showMentions
                            ) {
                              e.preventDefault();
                              send();
                            }
                          }}
                          placeholder="Ask anything... (@ to search lessons)"
                          rows={1}
                          disabled={loading}
                          className="flex-1 resize-none bg-transparent px-2 py-2 text-[14px] text-white outline-none placeholder:text-text-muted disabled:opacity-50"
                          style={{
                            height: "48px",
                            maxHeight: "132px",
                            overflowY: "hidden",
                          }}
                        />
                        <button
                          onClick={loading ? stopGenerating : send}
                          disabled={!loading && !input.trim()}
                          className={[
                            "flex h-11 shrink-0 items-center justify-center rounded-2 la text-white shadow-[0_16px_30px_rgba(99,14,212,0.3)] transition-all hover:scale-[1.03] hover:shadow-[0_18px_34px_rgba(99,14,212,0.38)] disabled:scale-100 disabled:opacity-40 cursor-pointer",
                            loading
                              ? "w-auto gap-2 bg-linear-to-br from-rose-500 to-orange-500 px-4"
                              : "w-11 bg-linear-to-br from-primary to-secondary",
                          ].join(" ")}
                          aria-label={
                            loading ? "Зупинити генерацію" : "Надіслати"
                          }
                        >
                          {loading ? (
                            <>
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden
                              >
                                <rect
                                  x="6"
                                  y="6"
                                  width="12"
                                  height="12"
                                  rx="2"
                                />
                              </svg>
                              <span className="text-[12px] font-medium">
                                Stop
                              </span>
                            </>
                          ) : (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <line x1="22" y1="2" x2="11" y2="13" />
                              <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between px-2 text-[10px] text-text-muted">
                        <span>Shift + Enter for a new line</span>
                        <span>@ lessons search</span>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
