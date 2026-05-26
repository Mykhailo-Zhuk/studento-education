import { getSupabaseAdmin, type AdminTable } from "@/lib/supabase-admin";
import type { Lesson, Homework, Student, Group } from "@/lib/types";
import { loadAdminInstructions } from "@/lib/ai-instructions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-v4-flash";

// ── GitHub helpers (mirrors github-content/route.ts) ──────────────────────────

const GH_OWNER = "Mykhailo-Zhuk";
const GH_REPO = "my-obsidian-vaults";
const KNOWN_FILES = ["what-to-read.md", "what-to-write.md", "youtube-description.md"];
const YOUTUBE_FILE_NAME = "youtube-description.md";

function resolveBasePath(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("react")) return "Studento/React/Homeworks";
  if (t.includes("web") && t.includes("workshop"))
    return "Studento/Web-Workshop-HTML-CSS/Homeworks";
  return "Studento/Front-End-Course-Content/Homeworks";
}

function deriveFolder(titleSlug: string, typeSlug: string): string | null {
  const m = titleSlug.match(/lesson-?(\d+)/i);
  if (!m) return null;
  const n = parseInt(m[1]);
  const prefix = `L${String(n).padStart(2, "0")}`;
  const courseWords = new Set(typeSlug.split("-").filter((w) => w.length > 1));
  const excluded = new Set(["lesson", String(n), ...courseWords]);
  const topicWords = titleSlug
    .toLowerCase()
    .split("-")
    .filter((w) => w.length > 0 && !excluded.has(w) && !/^\d+$/.test(w));
  return topicWords.length > 0 ? `${prefix}-${topicWords.join("-")}` : prefix;
}

function findFolder(derived: string, folderNames: string[]): string | null {
  const target = derived.toLowerCase();
  const exact = folderNames.find((f) => f.toLowerCase() === target);
  if (exact) return exact;
  const lessonNum = parseInt(derived.replace(/^L0*/i, ""));
  const byNum = folderNames.filter((f) =>
    new RegExp(`^L0*${lessonNum}([^0-9]|$)`, "i").test(f),
  );
  if (byNum.length === 0) return null;
  if (byNum.length === 1) return byNum[0];
  const topicWords = target.replace(/^l\d+-?/, "").split("-").filter((w) => w.length > 1);
  if (topicWords.length === 0) return byNum[0];
  let best: string | null = null;
  let bestScore = 0;
  let bestExtra = Infinity;
  for (const folder of byNum) {
    const fw = new Set(
      folder.toLowerCase().replace(/^l\d+(-\d+)?-/, "").split("-").filter((w) => w.length > 1),
    );
    const score = topicWords.filter((w) => fw.has(w)).length;
    const extra = fw.size - score;
    if (score > bestScore || (score === bestScore && extra < bestExtra)) {
      best = folder; bestScore = score; bestExtra = extra;
    }
  }
  return best ?? byNum[0];
}

async function fetchGitHubContent(title: string, type: string) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { error: "GITHUB_TOKEN not configured" };
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "studento-orchestrator",
  };
  const basePath = resolveBasePath(type);
  const encodedBase = basePath.split("/").map(encodeURIComponent).join("/");
  const listRes = await fetch(
    `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${encodedBase}`,
    { headers },
  );
  if (!listRes.ok) return { error: "GitHub base path not found" };
  const items = (await listRes.json()) as Array<{ name: string; type: string }>;
  const folderNames = items.filter((i) => i.type === "dir").map((i) => i.name);
  const titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const typeSlug = type.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const derived = deriveFolder(titleSlug, typeSlug);
  if (!derived) return { error: "Could not parse lesson number from title" };
  const folder = findFolder(derived, folderNames);
  if (!folder) return { error: `No GitHub folder found for "${title}"` };
  const folderSegments = [...basePath.split("/"), folder];
  const files = await Promise.all(
    KNOWN_FILES.map(async (fileName) => {
      const encodedPath = [...folderSegments, fileName].map(encodeURIComponent).join("/");
      const res = await fetch(
        `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${encodedPath}`,
        { headers },
      );
      if (!res.ok) return null;
      const data = (await res.json()) as { content: string };
      const content = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
      return { name: fileName, content };
    }),
  );
  return { folder, files: files.filter(Boolean) };
}

async function resolveHomeworkFolder(title: string, type: string): Promise<{
  basePath: string;
  folder: string;
  folderSegments: string[];
} | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "studento-orchestrator",
  };

  const basePath = resolveBasePath(type);
  const encodedBase = basePath.split("/").map(encodeURIComponent).join("/");
  const listRes = await fetch(
    `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${encodedBase}`,
    { headers },
  );
  if (!listRes.ok) return null;

  const items = (await listRes.json()) as Array<{ name: string; type: string }>;
  const folderNames = items.filter((i) => i.type === "dir").map((i) => i.name);
  const titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const typeSlug = type.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const derived = deriveFolder(titleSlug, typeSlug);
  if (!derived) return null;
  const folder = findFolder(derived, folderNames);
  if (!folder) return null;

  return { basePath, folder, folderSegments: [...basePath.split("/"), folder] };
}

async function updateGitHubFile(pathSegments: string[], content: string) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { error: "GITHUB_TOKEN not configured" };

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
    "User-Agent": "studento-orchestrator",
  };

  const encodedPath = pathSegments.map(encodeURIComponent).join("/");
  const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${encodedPath}`;

  const existingRes = await fetch(url, { headers });
  let sha: string | undefined;
  if (existingRes.ok) {
    const existing = (await existingRes.json()) as { sha?: string };
    sha = existing.sha;
  } else if (existingRes.status !== 404) {
    const err = (await existingRes.json().catch(() => null)) as { message?: string } | null;
    return { error: err?.message ?? "Failed to read existing GitHub file" };
  }

  const payload: Record<string, string> = {
    message: `${sha ? "Update" : "Create"} ${pathSegments.at(-1) ?? "file"}`,
    content: Buffer.from(content).toString("base64"),
  };
  if (sha) payload.sha = sha;

  const writeRes = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  if (!writeRes.ok) {
    const err = (await writeRes.json().catch(() => null)) as { message?: string } | null;
    return { error: err?.message ?? "GitHub write failed" };
  }

  const data = (await writeRes.json()) as { content?: { sha?: string } };
  return { sha: data.content?.sha ?? sha ?? null };
}

function extractTopicKeywords(title: string, type: string): string[] {
  const parenMatch = title.match(/\(([^)]+)\)/);
  if (parenMatch) {
    return parenMatch[1]
      .toLowerCase()
      .split(/[\s,]+/)
      .filter((w) => w.length > 1);
  }
  const afterColon = title.split(":").slice(1).join(":").trim();
  if (afterColon) {
    const typeWords = new Set(type.toLowerCase().split(/[\s-]+/).filter((w) => w.length > 1));
    return afterColon
      .toLowerCase()
      .split(/[\s,\-()+]+/)
      .filter((w) => w.length > 1 && !typeWords.has(w) && !/^\d+$/.test(w));
  }
  return [];
}

async function findSimilarHomework(title: string, type: string) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { found: false, message: "GITHUB_TOKEN not configured" };

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "studento-orchestrator",
  };

  const topicKeywords = extractTopicKeywords(title, type);
  if (topicKeywords.length === 0) {
    return { found: false, message: "Could not parse topic keywords from title" };
  }

  const basePath = resolveBasePath(type);
  const encodedBase = basePath.split("/").map(encodeURIComponent).join("/");
  const listRes = await fetch(
    `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${encodedBase}`,
    { headers },
  );
  if (!listRes.ok) return { found: false, message: "GitHub base path not found" };

  const items = (await listRes.json()) as Array<{ name: string; type: string }>;
  const folderNames = items.filter((i) => i.type === "dir").map((i) => i.name);

  let bestFolder: string | null = null;
  let bestScore = 0;
  for (const folder of folderNames) {
    const folderWords = new Set(
      folder.toLowerCase().replace(/^l\d+(-\d+)?-/, "").split("-").filter((w) => w.length > 1),
    );
    const score = topicKeywords.filter((w) => folderWords.has(w)).length;
    if (score > bestScore) { bestScore = score; bestFolder = folder; }
  }

  const titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const typeSlug = type.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const suggestedFolder = deriveFolder(titleSlug, typeSlug);

  if (bestScore === 0 || !bestFolder) {
    return {
      found: false,
      message: `No similar homework found for topic: ${topicKeywords.join(", ")}`,
      suggestedFolder,
    };
  }

  const folderSegments = [...basePath.split("/"), bestFolder];
  const files = await Promise.all(
    KNOWN_FILES.map(async (fileName) => {
      const encodedPath = [...folderSegments, fileName].map(encodeURIComponent).join("/");
      const res = await fetch(
        `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${encodedPath}`,
        { headers },
      );
      if (!res.ok) return null;
      const data = (await res.json()) as { content: string };
      const content = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
      return { name: fileName, content };
    }),
  );

  return {
    found: true,
    sourceFolder: bestFolder,
    sourcePath: basePath,
    matchedKeywords: topicKeywords.filter((w) =>
      new Set(
        bestFolder!.toLowerCase().replace(/^l\d+(-\d+)?-/, "").split("-").filter((w) => w.length > 1),
      ).has(w),
    ),
    suggestedFolder,
    files: files.filter((f): f is { name: string; content: string } => f !== null),
  };
}

async function createHomeworkFiles(
  title: string,
  type: string,
  files: Array<{ name: string; content: string }>,
) {
  const basePath = resolveBasePath(type);
  const titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const typeSlug = type.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const folderName = deriveFolder(titleSlug, typeSlug);
  if (!folderName) return { error: "Could not derive folder name from title" };

  const folderSegments = [...basePath.split("/"), folderName];
  const writtenFiles: string[] = [];

  for (const file of files) {
    const result = await updateGitHubFile([...folderSegments, file.name], file.content);
    if (result.error) return { error: `Failed to write ${file.name}: ${result.error}` };
    writtenFiles.push(file.name);
  }

  return { success: true, createdFolder: `${basePath}/${folderName}`, writtenFiles };
}

// ── OpenAI-compatible types ────────────────────────────────────────────────────

interface OAIToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

interface OAIMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: OAIToolCall[];
  tool_call_id?: string;
}

interface OAIResponse {
  choices: Array<{
    message: OAIMessage;
    finish_reason: "stop" | "tool_calls" | "length" | "content_filter";
  }>;
  error?: { message: string };
}

interface OAITool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties?: Record<string, unknown>;
      required?: string[];
    };
  };
}

// ── Tool definitions ───────────────────────────────────────────────────────────

const tools: OAITool[] = [
  {
    type: "function",
    function: {
      name: "list_lessons",
      description:
        "List lessons from the database. Can filter by group_name, type, or search substring in title. Returns id, title, group_name, type, date, status, hours, youtube_url, has_homework.",
      parameters: {
        type: "object",
        properties: {
          group_name: { type: "string", description: "Filter by exact group name" },
          type: { type: "string", description: "Course type: React, Front-End, Web Workshop" },
          search: { type: "string", description: "Case-insensitive substring in lesson title" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_homework",
      description:
        "List homework assignments from the database. Returns id, date, group_name, type, status, title, notes.",
      parameters: {
        type: "object",
        properties: {
          group_name: { type: "string", description: "Filter by group name" },
          type: { type: "string", description: "Filter by course type" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_homework_content",
      description:
        "Fetch GitHub-hosted content for a lesson/homework: what-to-read.md, what-to-write.md, youtube-description.md. Pass the exact lesson title and course type.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: 'Full lesson title containing "Lesson N", e.g. "Lesson 19: Functions"',
          },
          type: {
            type: "string",
            description: 'Course type: "React", "Front-End", or "Web Workshop"',
          },
        },
        required: ["title", "type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_youtube_file",
      description:
        "Update the youtube-description.md file for a specific lesson. Resolve the lesson folder from title + type, then replace the file contents.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Full lesson title containing Lesson N" },
          type: { type: "string", description: 'Course type: "React", "Front-End", or "Web Workshop"' },
          url: { type: "string", description: "Optional YouTube URL to include in the description" },
          content: { type: "string", description: "Full file content for youtube-description.md" },
        },
        required: ["title", "type", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_students",
      description: "List students from the database.",
      parameters: {
        type: "object",
        properties: {
          group_name: { type: "string", description: "Filter by group name" },
          status: {
            type: "string",
            description: "Enrollment status: Not Started | In progress | Interrupted | End course",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_groups",
      description: "List all learning groups/cohorts from the database.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "create_lesson",
      description: "Create a new lesson record in the database.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          group_name: { type: "string" },
          type: { type: "string" },
          date: { type: "string", description: "ISO date YYYY-MM-DD" },
          status: { type: "string", description: "Scheduled | Completed | Cancelled" },
          hours: { type: "number" },
          youtube_url: { type: "string" },
          has_homework: { type: "boolean" },
          has_feedback: { type: "boolean" },
          comment: { type: "string" },
        },
        required: ["title", "group_name", "type", "date", "status", "hours"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_homework",
      description: "Create a new homework assignment in the database.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          group_name: { type: "string" },
          type: { type: "string" },
          date: { type: "string", description: "ISO date YYYY-MM-DD" },
          status: { type: "string" },
          notes: { type: "string" },
        },
        required: ["title", "group_name", "type", "date", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_lesson",
      description: "Update an existing lesson by UUID.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          group_name: { type: "string" },
          type: { type: "string" },
          date: { type: "string" },
          status: { type: "string" },
          hours: { type: "number" },
          youtube_url: { type: "string" },
          has_homework: { type: "boolean" },
          has_feedback: { type: "boolean" },
          comment: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_homework",
      description: "Update an existing homework assignment by UUID.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          group_name: { type: "string" },
          type: { type: "string" },
          date: { type: "string" },
          status: { type: "string" },
          notes: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "find_similar_homework",
      description:
        "Search the course-type Homeworks directory on GitHub for a folder whose topic matches the lesson title. Parses topic keywords from parentheses or after the colon, scores existing folders by keyword overlap, and returns the best match with all available file contents (what-to-read.md, what-to-write.md, youtube-description.md) — or a not-found message with the suggested new folder name.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description:
              'Lesson title with topic keywords, e.g. "Lesson 9: React (useContext, useReducer, Custom Hook)"',
          },
          type: {
            type: "string",
            description: 'Course type: "React", "Front-End", or "Web Workshop"',
          },
        },
        required: ["title", "type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_homework_files",
      description:
        "Create homework files in a new GitHub folder derived from the lesson title and type. The folder name is derived automatically. Use after find_similar_homework to copy content, or after generating content from scratch (without what-to-read.md).",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Full lesson title used to derive the GitHub folder name",
          },
          type: {
            type: "string",
            description: 'Course type: "React", "Front-End", or "Web Workshop"',
          },
          files: {
            type: "array",
            description:
              'Files to write. Each item has "name" (what-to-read.md | what-to-write.md | youtube-description.md) and "content".',
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                content: { type: "string" },
              },
              required: ["name", "content"],
            },
          },
        },
        required: ["title", "type", "files"],
      },
    },
  },
];

const TOOL_STATUS: Record<string, string> = {
  list_lessons: "Завантажую уроки...",
  list_homework: "Завантажую домашні завдання...",
  get_homework_content: "Отримую контент з GitHub...",
  update_youtube_file: "Оновлюю YouTube description...",
  list_students: "Завантажую список студентів...",
  list_groups: "Завантажую групи...",
  create_lesson: "Створюю урок...",
  create_homework: "Створюю домашнє завдання...",
  update_lesson: "Оновлюю урок...",
  update_homework: "Оновлюю домашнє завдання...",
  find_similar_homework: "Шукаю схожі домашні завдання на GitHub...",
  create_homework_files: "Створюю файли домашнього завдання на GitHub...",
};

// ── Tool execution ─────────────────────────────────────────────────────────────

async function executeTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  const db = getSupabaseAdmin();

  switch (name) {
    case "list_lessons": {
      const table = db.from("lessons") as unknown as AdminTable<Lesson>;
      let q = table.select("*").order("date");
      if (input.group_name) q = q.eq("group_name", String(input.group_name));
      if (input.type) q = q.eq("type", String(input.type));
      const { data, error } = await q;
      if (error) return { error: error.message };
      let results = (data ?? []) as Lesson[];
      if (input.search) {
        const s = String(input.search).toLowerCase();
        results = results.filter((l) => l.title.toLowerCase().includes(s));
      }
      return results;
    }
    case "list_homework": {
      const table = db.from("homework") as unknown as AdminTable<Homework>;
      let q = table.select("*").order("date", { ascending: false });
      if (input.group_name) q = q.eq("group_name", String(input.group_name));
      if (input.type) q = q.eq("type", String(input.type));
      const { data, error } = await q;
      if (error) return { error: error.message };
      return data ?? [];
    }
    case "get_homework_content":
      return fetchGitHubContent(String(input.title ?? ""), String(input.type ?? ""));
    case "update_youtube_file": {
      const title = String(input.title ?? "").trim();
      const type = String(input.type ?? "").trim();
      const content = String(input.content ?? "");
      const url = String(input.url ?? "").trim();

      if (!title || !type || !content) {
        return { error: "title, type, and content are required" };
      }

      const resolved = await resolveHomeworkFolder(title, type);
      if (!resolved) {
        return { error: `Could not resolve homework folder for "${title}"` };
      }

      const filePath = [...resolved.folderSegments, YOUTUBE_FILE_NAME];
      const finalContent =
        url && !content.includes(url)
          ? `${content.trim()}\n\nYouTube URL: ${url}`
          : content;

      return updateGitHubFile(filePath, finalContent);
    }
    case "list_students": {
      const table = db.from("students") as unknown as AdminTable<Student>;
      let q = table.select("*").order("name");
      if (input.group_name) q = q.eq("group_name", String(input.group_name));
      if (input.status) q = q.eq("status", String(input.status));
      const { data, error } = await q;
      if (error) return { error: error.message };
      return data ?? [];
    }
    case "list_groups": {
      const table = db.from("groups") as unknown as AdminTable<Group>;
      const { data, error } = await table.select("*").order("name");
      if (error) return { error: error.message };
      return data ?? [];
    }
    case "create_lesson": {
      const table = db.from("lessons") as unknown as AdminTable<Lesson>;
      const { data, error } = await table.insert(input).select().single();
      if (error) return { error: error.message };
      return { success: true, lesson: data };
    }
    case "create_homework": {
      const table = db.from("homework") as unknown as AdminTable<Homework>;
      const { data, error } = await table.insert(input).select().single();
      if (error) return { error: error.message };
      return { success: true, homework: data };
    }
    case "update_lesson": {
      const { id, ...fields } = input;
      const table = db.from("lessons") as unknown as AdminTable<Lesson>;
      const { data, error } = await table.update(fields).eq("id", String(id)).select().single();
      if (error) return { error: error.message };
      return { success: true, lesson: data };
    }
    case "update_homework": {
      const { id, ...fields } = input;
      const table = db.from("homework") as unknown as AdminTable<Homework>;
      const { data, error } = await table.update(fields).eq("id", String(id)).select().single();
      if (error) return { error: error.message };
      return { success: true, homework: data };
    }
    case "find_similar_homework":
      return findSimilarHomework(String(input.title ?? ""), String(input.type ?? ""));
    case "create_homework_files": {
      const files = (input.files as Array<{ name: string; content: string }> | undefined) ?? [];
      return createHomeworkFiles(String(input.title ?? ""), String(input.type ?? ""), files);
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// ── DeepSeek call ──────────────────────────────────────────────────────────────

async function callDeepSeek(messages: OAIMessage[]): Promise<OAIResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tools,
      tool_choice: "auto",
    }),
  });
  const data = (await res.json().catch(() => null)) as OAIResponse | null;
  if (!res.ok && !data) {
    return { choices: [], error: { message: `DeepSeek request failed with HTTP ${res.status}` } };
  }
  return data ?? { choices: [], error: { message: `DeepSeek request failed with HTTP ${res.status}` } };
}

// ── System prompt ──────────────────────────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `You are an AI assistant for the Studento education management platform, used by a teacher/instructor.

The platform manages:
- Students: enrolled students with contact info, progress, GitHub projects
- Groups: learning cohorts (e.g. "React-2024-Q1") with schedule info
- Lessons: recorded teaching sessions with dates, YouTube links, and status
- Homework: assignments with GitHub-hosted content files:
  - what-to-read.md — reading materials
  - what-to-write.md — coding assignment description
  - youtube-description.md — description for the YouTube recording

LANGUAGE: Match the language the teacher uses. Respond in Ukrainian by default.

BEHAVIOR:
- For homework content of a specific lesson (e.g. "урок 19"), first call list_lessons searching for "19", then call get_homework_content with that lesson's exact title and type.
- Format lesson/homework lists as markdown tables.
- Show each GitHub file content under a ## header (e.g. ## what-to-read.md).
- For create/update operations, confirm briefly what was done.
- If clarification is needed (e.g. multiple groups), ask concisely.
- When the user asks to update a lesson's YouTube description file, call update_youtube_file with the exact lesson title, type, and the new content.
- Admin-only CLI shortcut: if the user message starts with /crud, treat it as a request to work in command mode using the CRUD instructions file.
- In CRUD command mode, translate the request into the exact admin CLI command(s) from the instructions and do not invent new commands.

HOMEWORK COPY/CREATE WORKFLOW:
When the user asks to find, copy, or create homework files for a lesson (e.g. "знайди домашнє завдання про урок 9: react (useContext, useReducer, Custom Hook)" or "create homework for lesson 9"):
1. Call find_similar_homework with the lesson title and course type. The tool searches the course-type Homeworks folder on GitHub for an existing folder whose topic keywords best match the title.
2. If found (found: true): Inform the user which source folder was matched, show the file contents, then call create_homework_files with the copied file contents (all three files: what-to-read.md, what-to-write.md, youtube-description.md) to create the new lesson's homework folder.
3. If NOT found (found: false):
   a. Inform the user that no similar homework was found.
   b. Offer to create the homework from scratch — OMIT what-to-read.md entirely.
   c. Generate what-to-write.md content using the Homework Generator instructions (or React Homework Generator for type=React).
   d. Generate youtube-description.md content using the YouTube Video Description instructions.
   e. Call create_homework_files with only the two generated files (what-to-write.md and youtube-description.md).

CURRENT DATE: ${new Date().toISOString().split("T")[0]}`;

async function buildSystemPrompt(): Promise<string> {
  const instructions = await loadAdminInstructions();
  return [
    BASE_SYSTEM_PROMPT,
    instructions.crudOperations ? `\n## CRUD Operations\n${instructions.crudOperations}` : "",
    instructions.homeworkGenerator ? `\n## Homework Generator\n${instructions.homeworkGenerator}` : "",
    instructions.reactHomeworkGenerator
      ? `\n## React Homework Generator\n${instructions.reactHomeworkGenerator}`
      : "",
    instructions.youtubeVideoDescription
      ? `\n## YouTube Video Description\n${instructions.youtubeVideoDescription}`
      : "",
  ].join("\n");
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  let clientMessages: Array<{ role: "user" | "assistant"; content: string }>;
  try {
    const payload = (await req.json()) as {
      messages?: Array<{ role: "user" | "assistant"; content: string }>;
    };
    clientMessages = payload.messages ?? [];
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

  const latestUserMessage = [...clientMessages].reverse().find((m) => m.role === "user")?.content.trim() ?? "";

  if (latestUserMessage.startsWith("/crud")) {
    const instructions = await loadAdminInstructions();
    const text =
      instructions.crudOperations ||
      "CRUD instructions are not available right now.";

    return new Response(`data: ${JSON.stringify({ type: "done", text })}\n\n`, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return new Response(
      `data: ${JSON.stringify({ type: "error", text: "DEEPSEEK_API_KEY not configured" })}\n\n`,
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      },
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      try {
        const currentMessages: OAIMessage[] = [
          { role: "system", content: await buildSystemPrompt() },
          ...clientMessages.map((m) => ({ role: m.role, content: m.content })),
        ];

        for (let turn = 0; turn < 6; turn++) {
          const response = await callDeepSeek(currentMessages);

          if (response.error) {
            send({ type: "error", text: response.error.message });
            break;
          }

          const choice = response.choices?.[0];
          if (!choice) {
            send({ type: "error", text: "No response from model" });
            break;
          }

          const { message, finish_reason } = choice;

          if (finish_reason !== "tool_calls" || !message.tool_calls?.length) {
            send({ type: "done", text: message.content ?? "" });
            break;
          }

          // Execute tool calls
          const toolResults: OAIMessage[] = [];
          for (const tc of message.tool_calls) {
            send({ type: "status", text: TOOL_STATUS[tc.function.name] ?? `${tc.function.name}...` });
            let input: Record<string, unknown> = {};
            try {
              input = JSON.parse(tc.function.arguments) as Record<string, unknown>;
            } catch {
              // malformed arguments — skip
            }
            const result = await executeTool(tc.function.name, input);
            toolResults.push({
              role: "tool",
              tool_call_id: tc.id,
              content: JSON.stringify(result),
            });
          }

          currentMessages.push(message);
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
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
