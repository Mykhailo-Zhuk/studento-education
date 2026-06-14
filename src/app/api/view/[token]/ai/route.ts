import { getSupabaseAdmin, type AdminTable } from "@/lib/supabase-admin";
import type { StudentToken, Lesson, Homework, StudentHomeworkRecord, Group } from "@/lib/types";
import { loadStudentInstructions } from "@/lib/ai-instructions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-v4-flash";

// ── GitHub helpers ─────────────────────────────────────────────────────────────

const GH_OWNER = "Mykhailo-Zhuk";
const GH_REPO = "my-obsidian-vaults";

function resolveBasePath(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("react")) return "studento/react/homeworks";
  if (t.includes("web") && t.includes("workshop"))
    return "studento/web-workshop-html-css/homeworks";
  return "studento/front-end-course-content/homeworks";
}

function deriveFolder(titleSlug: string, typeSlug: string): string | null {
  const m = titleSlug.match(/lesson-?(\d+)/i);
  if (!m) return null;
  const n = parseInt(m[1]);
  const prefix = `L${String(n).padStart(2, "0")}`;
  const excluded = new Set(["lesson", String(n), ...typeSlug.split("-").filter((w) => w.length > 1)]);
  const topicWords = titleSlug.toLowerCase().split("-").filter((w) => w.length > 0 && !excluded.has(w) && !/^\d+$/.test(w));
  return topicWords.length > 0 ? `${prefix}-${topicWords.join("-")}` : prefix;
}

function findFolder(derived: string, names: string[]): string | null {
  const target = derived.toLowerCase();
  const exact = names.find((f) => f.toLowerCase() === target);
  if (exact) return exact;
  const n = parseInt(derived.replace(/^L0*/i, ""));
  const byNum = names.filter((f) => new RegExp(`^L0*${n}([^0-9]|$)`, "i").test(f));
  if (!byNum.length) return null;
  if (byNum.length === 1) return byNum[0];
  const tw = target.replace(/^l\d+-?/, "").split("-").filter((w) => w.length > 1);
  let best: string | null = null; let bs = 0; let be = Infinity;
  for (const f of byNum) {
    const fw = new Set(f.toLowerCase().replace(/^l\d+(-\d+)?-/, "").split("-").filter((w) => w.length > 1));
    const s = tw.filter((w) => fw.has(w)).length;
    const e = fw.size - s;
    if (s > bs || (s === bs && e < be)) { best = f; bs = s; be = e; }
  }
  return best ?? byNum[0];
}

async function fetchGHContent(title: string, type: string) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { error: "GITHUB_TOKEN not configured" };
  const headers = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json", "User-Agent": "studento-orchestrator" };
  const basePath = resolveBasePath(type);
  const listRes = await fetch(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${basePath.split("/").map(encodeURIComponent).join("/")}`, { headers });
  if (!listRes.ok) return { error: "GitHub base path not found" };
  const items = (await listRes.json()) as Array<{ name: string; type: string }>;
  const folderNames = items.filter((i) => i.type === "dir").map((i) => i.name);
  const titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const derived = deriveFolder(titleSlug, type.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
  if (!derived) return { error: "Could not parse lesson number" };
  const folder = findFolder(derived, folderNames);
  if (!folder) return { error: `Folder not found for "${title}"` };
  const seg = [...basePath.split("/"), folder];
  const KNOWN = ["what-to-read.md", "what-to-write.md", "youtube-description.md"];
  const files = await Promise.all(KNOWN.map(async (fn) => {
    const res = await fetch(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${[...seg, fn].map(encodeURIComponent).join("/")}`, { headers });
    if (!res.ok) return null;
    const d = (await res.json()) as { content: string };
    return { name: fn, content: Buffer.from(d.content.replace(/\n/g, ""), "base64").toString("utf-8") };
  }));
  return { folder, files: files.filter(Boolean) };
}

// ── DeepSeek ───────────────────────────────────────────────────────────────────

interface OAIToolCall { id: string; type: "function"; function: { name: string; arguments: string }; }
interface OAIMessage { role: "system" | "user" | "assistant" | "tool"; content: string | null; tool_calls?: OAIToolCall[]; tool_call_id?: string; }
interface OAIResponse { choices: Array<{ message: OAIMessage; finish_reason: string }>; error?: { message: string }; }
interface OAITool { type: "function"; function: { name: string; description: string; parameters: Record<string, unknown> }; }

const tools: OAITool[] = [
  {
    type: "function",
    function: {
      name: "get_lesson_content",
      description: "Fetch the lesson materials from GitHub: what-to-read.md and what-to-write.md. Use this to answer questions about specific homework or lesson content.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Exact lesson title (e.g. 'Lesson 19: Functions')" },
          type: { type: "string", description: "Course type: React, Front-End, Web Workshop" },
        },
        required: ["title", "type"],
      },
    },
  },
];

const TOOL_STATUS: Record<string, string> = {
  get_lesson_content: "Завантажую матеріали уроку...",
};

async function callDeepSeek(messages: OAIMessage[], withTools: boolean): Promise<OAIResponse> {
  const body: Record<string, unknown> = { model: MODEL, messages };
  if (withTools) { body.tools = tools; body.tool_choice = "auto"; }
  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as OAIResponse | null;
  if (!res.ok && !data) {
    return { choices: [], error: { message: `DeepSeek request failed with HTTP ${res.status}` } };
  }
  return data ?? { choices: [], error: { message: `DeepSeek request failed with HTTP ${res.status}` } };
}

// ── Route ──────────────────────────────────────────────────────────────────────

interface ReqBody {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  student_id?: string;
}

interface Params {
  params: Promise<{ token: string }>;
}

export async function POST(req: Request, { params }: Params) {
  const { token } = await params;
  let clientMessages: ReqBody["messages"];
  let student_id: string | undefined;
  try {
    const payload = (await req.json()) as ReqBody;
    clientMessages = payload.messages ?? [];
    student_id = payload.student_id;
  } catch (error) {
    return new Response(
      `data: ${JSON.stringify({
        type: "error",
        text: error instanceof Error ? error.message : "Invalid request payload",
      })}\n\n`,
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      },
    );
  }

  const supabase = getSupabaseAdmin();

  // Validate token
  const { data: tokenData } = await (supabase.from("student_tokens") as unknown as AdminTable<StudentToken>)
    .select("*").eq("id", token).single();

  if (!tokenData || new Date(tokenData.expires_at) < new Date()) {
    return Response.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  // Detect group token by looking up group with this UUID
  const { data: tokenGroup } = await (supabase.from("groups") as unknown as AdminTable<Group>)
    .select("*").eq("id", tokenData.student_id).single();

  if (!tokenGroup) {
    return Response.json({ error: "Student AI only available for group tokens" }, { status: 400 });
  }

  const groupName = tokenGroup.name;

  // Load context
  const [lessonsRes, homeworkRes] = await Promise.all([
    (supabase.from("lessons") as unknown as AdminTable<Lesson>)
      .select("*").eq("group_name", groupName).order("date"),
    (supabase.from("homework") as unknown as AdminTable<Homework>)
      .select("*").eq("group_name", groupName).order("date", { ascending: false }),
  ]);

  const lessons = (lessonsRes.data ?? []) as Lesson[];
  const homework = (homeworkRes.data ?? []) as Homework[];
  const group = tokenGroup;

  // Pending homework for identified student
  let pendingHw: Homework[] = [];
  if (student_id) {
    const { data: records } = await (supabase.from("student_homework_records") as unknown as AdminTable<StudentHomeworkRecord>)
      .select("*").eq("student_id", student_id);
    const completedIds = new Set((records ?? []).filter((r) => r.completed).map((r) => r.homework_id));
    const allRecordIds = new Set((records ?? []).map((r) => r.homework_id));
    pendingHw = homework.filter((h) => allRecordIds.has(h.id) && !completedIds.has(h.id));
  }

  const nextLesson = lessons.filter((l) => new Date(l.date) >= new Date()).at(-1);
  const lessonsList = lessons.map((l) => `- ${l.title} (${l.date})`).join("\n");
  const hwList = homework.map((h) => `- ${h.title} (${h.date})`).join("\n");
  const pendingList = pendingHw.map((h) => `- ${h.title}`).join("\n");

  const studentInstructions = await loadStudentInstructions();

  const systemPrompt = `You are an AI study assistant for the "${groupName}" group at Studento Education${group?.type ? ` (${group.type} course)` : ""}.

Group context:
Lessons:
${lessonsList || "No lessons yet"}

Homework assignments:
${hwList || "No homework yet"}
${pendingList ? `\nStudent's pending (unsubmitted) homework:\n${pendingList}` : ""}
${nextLesson ? `\nNext upcoming lesson: ${nextLesson.title} on ${nextLesson.date}` : ""}

Your role:
- Explain JavaScript/React/HTML/CSS concepts clearly with short examples
- Give HINTS for homework (never complete solutions — guide the student to think)
- Help students understand what they need to submit for their DZ (домашнє завдання)
- Answer questions about upcoming lessons based on the context above
- Use get_lesson_content() when asked about specific lesson materials or need more context for a hint

Language: Ukrainian by default. Match the student's language.
Tone: Friendly, encouraging, like a knowledgeable older classmate — not a strict teacher.

IMPORTANT: Only answer based on what you know from the context and lesson materials. If you don't know something, say so honestly.`;

  const finalSystemPrompt = [
    systemPrompt,
    studentInstructions ? `\n## Student Instructions\n${studentInstructions}` : "",
  ].join("\n");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      try {
        const currentMessages: OAIMessage[] = [
          { role: "system", content: finalSystemPrompt },
          ...clientMessages.map((m) => ({ role: m.role, content: m.content })),
        ];

        for (let turn = 0; turn < 4; turn++) {
          const resp = await callDeepSeek(currentMessages, true);
          if (resp.error) { send({ type: "error", text: resp.error.message }); break; }
          const choice = resp.choices?.[0];
          if (!choice) { send({ type: "error", text: "No response" }); break; }

          if (choice.finish_reason !== "tool_calls" || !choice.message.tool_calls?.length) {
            send({ type: "done", text: choice.message.content ?? "" });
            break;
          }

          const toolResults: OAIMessage[] = [];
          for (const tc of choice.message.tool_calls) {
            send({ type: "status", text: TOOL_STATUS[tc.function.name] ?? "Завантажую..." });
            let input: Record<string, unknown> = {};
            try { input = JSON.parse(tc.function.arguments) as Record<string, unknown>; } catch {}
            let result: unknown;
            if (tc.function.name === "get_lesson_content") {
              result = await fetchGHContent(String(input.title ?? ""), String(input.type ?? ""));
            } else {
              result = { error: "Unknown tool" };
            }
            toolResults.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(result) });
          }

          currentMessages.push(choice.message);
          currentMessages.push(...toolResults);
        }
      } catch (err) {
        send({ type: "error", text: err instanceof Error ? err.message : String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}
