"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { GroupBundle, StudentHomeworkDetail, StudentPrivateProfile } from "@/lib/types";
import StudentAiChat from "./StudentAiChat";

const GROUP_EMOJIS = ["🚀", "⚡", "🌊", "🔥", "🎯", "💎", "🌟", "🦁", "🎪", "🏄"];

function groupEmoji(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return GROUP_EMOJIS[h % GROUP_EMOJIS.length];
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface Props {
  token: string;
  data: GroupBundle;
}

type Phase = "loading" | "pick" | "main";

export default function GroupView({ token, data }: Props) {
  const { group, students, lessons, homework } = data;
  const emoji = groupEmoji(group.name);
  const storageKey = `studento:identity:${token}`;
  const initialStudentId =
    typeof window === "undefined" ? null : localStorage.getItem(storageKey);

  const [phase, setPhase] = useState<Phase>(initialStudentId ? "loading" : "pick");
  const [studentId, setStudentId] = useState<string | null>(initialStudentId);
  const [privateStudent, setPrivateStudent] = useState<StudentPrivateProfile | null>(null);
  const [studentHomeworkDetails, setStudentHomeworkDetails] = useState<StudentHomeworkDetail[]>([]);
  const [search, setSearch] = useState("");

  const fetchPrivate = useCallback(async (sid: string) => {
    try {
      const res = await fetch(`/api/view/${token}?student_id=${encodeURIComponent(sid)}`);
      if (res.ok) {
        const json = await res.json();
        setPrivateStudent(json.privateStudent ?? null);
        setStudentHomeworkDetails(json.studentHomeworkDetails ?? []);
      }
    } catch {}
    setPhase("main");
  }, [token]);

  useEffect(() => {
    if (studentId) {
      const timer = window.setTimeout(() => {
        void fetchPrivate(studentId);
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [fetchPrivate, studentId]);

  function selectStudent(sid: string) {
    localStorage.setItem(storageKey, sid);
    setStudentId(sid);
    setPhase("loading");
    fetchPrivate(sid);
  }

  function clearIdentity() {
    localStorage.removeItem(storageKey);
    setStudentId(null);
    setPrivateStudent(null);
    setStudentHomeworkDetails([]);
    setSearch("");
    setPhase("pick");
  }

  const myHwMap = useMemo(
    () => new Map(studentHomeworkDetails.map((r) => [r.homeworkId, r.completed])),
    [studentHomeworkDetails],
  );

  const myHw = useMemo(
    () =>
      homework.map((h) => ({
        ...h,
        assigned: myHwMap.has(h.id),
        completed: myHwMap.get(h.id) ?? null,
      })),
    [homework, myHwMap],
  );

  const assignedCount = myHw.filter((h) => h.assigned).length;
  const completedCount = myHw.filter((h) => h.completed === true).length;

  const filteredStudents = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter((s) => s.name.toLowerCase().includes(q));
  }, [students, search]);

  const sortedLessons = useMemo(
    () => [...lessons].sort((a, b) => a.date.localeCompare(b.date)),
    [lessons],
  );
  const now = new Date().toISOString().slice(0, 10);
  const upcoming = sortedLessons.filter((l) => l.date >= now);
  const past = sortedLessons.filter((l) => l.date < now).reverse();

  // ── Loading ────────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">{emoji}</div>
          <div className="text-text-muted text-[14px]">Завантажую...</div>
        </div>
      </div>
    );
  }

  // ── Identity picker ────────────────────────────────────────────────────────
  if (phase === "pick") {
    return (
      <div className="flex-1 flex flex-col items-center py-10 px-4 overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="text-7xl mb-3">{emoji}</div>
            <h1 className="text-white text-[28px] font-bold">{group.name}</h1>
            <p className="text-text-muted text-[14px] mt-1">{group.type} course</p>
          </div>

          <h2 className="text-text-primary text-[18px] font-semibold mb-4 text-center">
            Хто ти? 👋
          </h2>

          <input
            type="text"
            placeholder="Пошук по імені..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-gray-dark border border-border-dark rounded-xl px-4 py-3 text-[14px] text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 mb-3"
          />

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filteredStudents.map((s) => (
              <button
                key={s.id}
                onClick={() => selectStudent(s.id)}
                className="w-full flex items-center gap-4 bg-surface-gray-dark/60 hover:bg-surface-gray-dark border border-border-dark hover:border-primary/40 rounded-xl px-4 py-3 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary-fixed-dim text-[16px] font-bold shrink-0">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-text-primary group-hover:text-white transition-colors truncate">
                    {s.name}
                  </div>
                  <div className="text-[12px] text-text-muted">{s.status}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[13px] font-bold text-primary-fixed-dim">{s.completionPct}%</div>
                  <div className="text-[11px] text-text-muted">
                    {s.completedCount}/{s.totalCount} ДЗ
                  </div>
                </div>
              </button>
            ))}
            {filteredStudents.length === 0 && (
              <div className="text-center py-10 text-text-muted text-[14px]">
                Нікого не знайдено
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Main view ──────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col">
      {/* Sticky header */}
      <div className="sticky top-16 z-30 bg-bg-dark/95 backdrop-blur border-b border-border-dark px-4 sm:px-6 py-3 flex items-center gap-3">
        <div className="text-3xl">{emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[16px] font-bold text-white truncate">{group.name}</div>
          {privateStudent && (
            <div className="text-[12px] text-teal-400 truncate">
              Привіт, {privateStudent.name}! 👋
            </div>
          )}
        </div>
        {assignedCount > 0 && (
          <div className="hidden sm:flex flex-col items-end shrink-0">
            <div className="text-[13px] font-bold text-white">
              {completedCount}/{assignedCount}
            </div>
            <div className="text-[11px] text-text-muted">здано ДЗ</div>
          </div>
        )}
        <button
          onClick={clearIdentity}
          className="shrink-0 text-[12px] text-text-muted hover:text-white px-3 py-1.5 rounded-lg hover:bg-surface-gray-dark/60 transition-colors"
        >
          Не я
        </button>
      </div>

      <div className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-5 pb-24">
        {/* Private profile */}
        {privateStudent && (
          <div className="bg-surface-gray-dark/40 border border-border-dark rounded-xl p-5">
            <h3 className="text-[12px] font-semibold uppercase tracking-widest text-text-muted mb-4">
              Only yours
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-[11px] text-text-muted mb-1">GitHub username</div>
                <div className="text-[14px] font-medium text-text-primary">
                  {privateStudent.github_username ? `@${privateStudent.github_username}` : "—"}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-text-muted mb-1">When started</div>
                <div className="text-[14px] font-medium text-text-primary">
                  {fmtDate(privateStudent.started)}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border-dark">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-text-muted">Assignment completion</span>
                <span className="text-[13px] font-bold text-white">
                  {completedCount}/{assignedCount}
                </span>
              </div>
              <div className="h-2 bg-surface-gray-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-700"
                  style={{
                    width: `${assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
            {studentHomeworkDetails.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border-dark">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-text-muted">Assignment details</span>
                  <span className="text-[13px] font-bold text-white">
                    {studentHomeworkDetails.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {studentHomeworkDetails.map((item) => (
                    <div
                      key={item.homeworkId}
                      className="flex items-center justify-between gap-3 rounded-lg bg-black/10 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="text-[13px] text-text-primary truncate">{item.title}</div>
                        <div className="text-[11px] text-text-muted">{fmtDate(item.date)}</div>
                      </div>
                      <span
                        className={[
                          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          item.completed
                            ? "bg-teal-500/15 text-teal-400"
                            : "bg-amber-500/15 text-amber-400",
                        ].join(" ")}
                      >
                        {item.completed ? "Completed" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Homework */}
        {myHw.some((h) => h.assigned) && (
          <div className="bg-surface-gray-dark/40 border border-border-dark rounded-xl p-5">
            <h3 className="text-[12px] font-semibold uppercase tracking-widest text-text-muted mb-4">
              Домашні завдання
            </h3>
            <div className="space-y-1">
              {myHw
                .filter((h) => h.assigned)
                .map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center gap-3 py-2.5 border-b border-border-dark/40 last:border-0"
                  >
                    <div
                      className={[
                        "w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0",
                        h.completed === true
                          ? "bg-teal-500/20 text-teal-400"
                          : "bg-amber-500/20 text-amber-400",
                      ].join(" ")}
                    >
                      {h.completed === true ? "✓" : "○"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-text-primary truncate">{h.title}</div>
                      <div className="text-[11px] text-text-muted">{fmtDate(h.date)}</div>
                    </div>
                    {h.completed === false && (
                      <span className="text-[11px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full shrink-0">
                        Здати
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Upcoming lessons */}
        {upcoming.length > 0 && (
          <div className="bg-surface-gray-dark/40 border border-border-dark rounded-xl p-5">
            <h3 className="text-[12px] font-semibold uppercase tracking-widest text-text-muted mb-4">
              Наступні уроки
            </h3>
            <div className="space-y-1">
              {upcoming.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-3 py-2.5 border-b border-border-dark/40 last:border-0"
                >
                  <span className="text-xl shrink-0">📅</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-text-primary truncate">{l.title}</div>
                    <div className="text-[11px] text-text-muted">{fmtDate(l.date)}</div>
                  </div>
                  {l.youtube_url && (
                    <a
                      href={l.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-teal-400 hover:underline shrink-0"
                    >
                      YouTube
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past lessons */}
        {past.length > 0 && (
          <div className="bg-surface-gray-dark/40 border border-border-dark rounded-xl p-5">
            <h3 className="text-[12px] font-semibold uppercase tracking-widest text-text-muted mb-4">
              Пройдені уроки ({past.length})
            </h3>
            <div className="space-y-1">
              {past.slice(0, 12).map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-3 py-2.5 border-b border-border-dark/40 last:border-0"
                >
                  <span className="text-xl shrink-0 opacity-50">✅</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-text-muted truncate">{l.title}</div>
                    <div className="text-[11px] text-text-muted">{fmtDate(l.date)}</div>
                  </div>
                  {l.youtube_url && (
                    <a
                      href={l.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-teal-400 hover:underline shrink-0"
                    >
                      YouTube
                    </a>
                  )}
                </div>
              ))}
              {past.length > 12 && (
                <div className="text-center pt-2 text-[12px] text-text-muted">
                  і ще {past.length - 12} уроків...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Group roster */}
        <div className="bg-surface-gray-dark/40 border border-border-dark rounded-xl p-5">
          <h3 className="text-[12px] font-semibold uppercase tracking-widest text-text-muted mb-4">
            Учасники групи ({students.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[380px]">
              <thead>
                <tr className="border-b border-border-dark text-left">
                  <th className="pb-2 pr-4 text-[11px] font-semibold text-text-muted">Ім&apos;я</th>
                  <th className="pb-2 pr-4 text-[11px] font-semibold text-text-muted">Статус</th>
                  <th className="pb-2 pr-4 text-[11px] font-semibold text-text-muted">ДЗ</th>
                  <th className="pb-2 text-[11px] font-semibold text-text-muted text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr
                    key={s.id}
                    className={[
                      "border-b border-border-dark/40 last:border-0",
                      s.id === studentId ? "bg-teal-500/5" : "",
                    ].join(" ")}
                  >
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-1.5">
                        {s.id === studentId && (
                          <span className="text-[10px] text-teal-400">👤</span>
                        )}
                        <span className="text-[13px] text-text-primary">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-[12px] text-text-muted">{s.status}</td>
                    <td className="py-2.5 pr-4 text-[12px] text-text-muted">
                      {s.completedCount}/{s.totalCount}
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={[
                          "text-[12px] font-bold",
                          s.completionPct >= 80
                            ? "text-teal-400"
                            : s.completionPct >= 50
                              ? "text-amber-400"
                              : "text-text-muted",
                        ].join(" ")}
                      >
                        {s.completionPct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <StudentAiChat token={token} studentId={studentId} />
    </div>
  );
}
