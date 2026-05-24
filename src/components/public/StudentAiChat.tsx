"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  token: string;
  studentId: string | null;
}

const QUICK_PROMPTS = [
  "Коли наступний урок?",
  "Мої незданні ДЗ",
  "Підказка до ДЗ",
  "Поясни filter()",
];

export default function StudentAiChat({ token, studentId }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, loading]);

  async function send(text?: string) {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;
    setInput("");
    const next: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(next);
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`/api/view/${token}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, student_id: studentId }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(body || `Request failed with HTTP ${res.status}`);
      }

      if (!res.body) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Сталася помилка. Спробуй ще раз." },
        ]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let finalText = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const ev = JSON.parse(line.slice(6)) as { type: string; text: string };
            if (ev.type === "status") setStatus(ev.text);
            else if (ev.type === "done") { finalText = ev.text; setStatus(null); }
            else if (ev.type === "error") { finalText = `Помилка: ${ev.text}`; setStatus(null); }
          } catch {}
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: finalText }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не вдалося отримати відповідь";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Мережева помилка: ${message}` },
      ]);
    } finally {
      setLoading(false);
      setStatus(null);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-500 text-white shadow-2xl flex items-center justify-center transition-all active:scale-95"
        aria-label="AI Assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[70vh] bg-bg-dark border border-border-dark rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border-dark bg-surface-gray-dark/60 shrink-0">
            <span className="text-xl">🤖</span>
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-white">Studento AI</div>
              <div className="text-[11px] text-text-muted">Твій помічник</div>
            </div>
            <button
              onClick={() => setMessages([])}
              title="Очистити"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-white hover:bg-surface-gray-dark transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.length === 0 && (
              <div className="text-center py-4">
                <div className="text-4xl mb-2">👋</div>
                <div className="text-[14px] text-text-muted">Привіт! Чим можу допомогти?</div>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="text-[12px] bg-surface-gray-dark hover:bg-surface-gray-dark/80 border border-border-dark rounded-full px-3 py-1.5 text-text-muted hover:text-white transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={[
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed",
                    m.role === "user"
                      ? "bg-teal-700 text-white rounded-br-sm"
                      : "bg-surface-gray-dark text-text-primary rounded-bl-sm",
                  ].join(" ")}
                >
                  {m.role === "assistant" ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                        code: ({ children }) => (
                          <code className="bg-black/30 px-1 rounded text-[12px] font-mono">{children}</code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-black/30 p-2 rounded mt-1 overflow-x-auto text-[12px] font-mono">{children}</pre>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside space-y-0.5 my-1">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside space-y-0.5 my-1">{children}</ol>
                        ),
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface-gray-dark rounded-2xl rounded-bl-sm px-4 py-3">
                  {status ? (
                    <span className="text-[13px] text-text-muted">{status}</span>
                  ) : (
                    <span className="flex gap-1 items-center">
                      {[0, 150, 300].map((d) => (
                        <span
                          key={d}
                          className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce"
                          style={{ animationDelay: `${d}ms` }}
                        />
                      ))}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="border-t border-border-dark p-3 shrink-0 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Запитай щось..."
              disabled={loading}
              className="flex-1 bg-surface-gray-dark rounded-xl px-4 py-2.5 text-[13px] text-text-primary placeholder-text-muted focus:outline-none"
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white transition-colors shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
