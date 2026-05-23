import { NextResponse } from "next/server";

const OWNER = "Mykhailo-Zhuk";
const REPO = "my-obsidian-vaults";
const KNOWN_FILES = ["what-to-read.md", "what-to-write.md", "youtube-description.md"];
const ALLOWED_PATH_PREFIX = "Studento/";

function resolveBasePath(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("react")) return "Studento/React/Homeworks";
  if (t.includes("web") && t.includes("workshop"))
    return "Studento/Web-Workshop-HTML-CSS/Homeworks";
  return "Studento/Front-End-Course-Content/Homeworks";
}

// Derives the expected folder name from a slugified title + type.
// "lesson-6-react-props-events-list" + "react" → "L06-props-events-list"
function deriveFolder(titleSlug: string, typeSlug: string): string | null {
  const lessonMatch = titleSlug.match(/lesson-(\d+)/i);
  if (!lessonMatch) return null;

  const n = parseInt(lessonMatch[1]);
  const prefix = `L${String(n).padStart(2, "0")}`;

  const courseWords = new Set(
    typeSlug.split("-").filter((w) => w.length > 1),
  );
  const excluded = new Set(["lesson", String(n), ...courseWords]);

  const topicWords = titleSlug
    .toLowerCase()
    .split("-")
    .filter((w) => w.length > 0 && !excluded.has(w) && !/^\d+$/.test(w));

  return topicWords.length > 0 ? `${prefix}-${topicWords.join("-")}` : prefix;
}

// Finds the real folder name in the listing (case-insensitive, then by lesson number + overlap).
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
  let bestHasSubNum = true;
  for (const folder of byNum) {
    const folderWords = new Set(
      folder.toLowerCase().replace(/^l\d+(-\d+)?-/, "").split("-").filter((w) => w.length > 1),
    );
    const score = topicWords.filter((w) => folderWords.has(w)).length;
    // Extra folder words not covered by the title (fewer = tighter match)
    const extra = folderWords.size - score;
    const hasSubNum = /^l\d+-\d+-/i.test(folder);
    const better =
      score > bestScore ||
      (score === bestScore && extra < bestExtra) ||
      (score === bestScore && extra === bestExtra && !hasSubNum && bestHasSubNum);
    if (better) { best = folder; bestScore = score; bestExtra = extra; bestHasSubNum = hasSubNum; }
  }

  return best ?? byNum[0];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw_title = searchParams.get("title");
  const raw_type = searchParams.get("type") ?? "";

  if (!raw_title) {
    return NextResponse.json({ error: "Missing title" }, { status: 400 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 500 });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "studento-orchestrator",
  };

  const basePath = resolveBasePath(raw_type);
  const baseSegments = basePath.split("/");
  const encodedBasePath = baseSegments.map(encodeURIComponent).join("/");
  const listUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodedBasePath}`;

  const listRes = await fetch(listUrl, { headers, cache: "no-store" });
  if (!listRes.ok) {
    return NextResponse.json({ error: "Base path not found" }, { status: 404 });
  }

  const items = (await listRes.json()) as Array<{ name: string; type: string }>;
  const folderNames = items.filter((i) => i.type === "dir").map((i) => i.name);

  const derived = deriveFolder(raw_title, raw_type);
  if (!derived) {
    return NextResponse.json({ error: "Could not parse lesson number from title" }, { status: 400 });
  }

  const folder = findFolder(derived, folderNames);
  if (!folder) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }

  const folderSegments = [...baseSegments, folder];

  const files = await Promise.all(
    KNOWN_FILES.map(async (fileName) => {
      const encodedPath = [...folderSegments, fileName].map(encodeURIComponent).join("/");
      const fileUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodedPath}`;
      const res = await fetch(fileUrl, { headers, cache: "no-store" });
      if (!res.ok) return null;
      const data = (await res.json()) as { content: string; sha: string };
      const content = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
      return { name: fileName, content, sha: data.sha };
    }),
  );

  return NextResponse.json({
    files: files.filter(Boolean),
    folder,
    folderPath: folderSegments.join("/"),
  });
}

export async function PUT(req: Request) {
  const token = process.env.GITHUB_TOKEN;
  if (!token)
    return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 500 });

  const body = (await req.json()) as { path: string; content: string; sha?: string };
  if (!body.path || body.content === undefined)
    return NextResponse.json({ error: "Missing path or content" }, { status: 400 });
  if (!body.path.startsWith(ALLOWED_PATH_PREFIX))
    return NextResponse.json({ error: "Forbidden path" }, { status: 403 });

  const encodedPath = body.path.split("/").map(encodeURIComponent).join("/");
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodedPath}`;

  const payload: Record<string, string> = {
    message: `${body.sha ? "Update" : "Create"} ${body.path.split("/").pop() ?? "file"}`,
    content: Buffer.from(body.content).toString("base64"),
  };
  if (body.sha) payload.sha = body.sha;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "studento-orchestrator",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = (await res.json()) as { message?: string };
    return NextResponse.json({ error: err.message ?? "GitHub write failed" }, { status: res.status });
  }

  const data = (await res.json()) as { content: { sha: string } };
  return NextResponse.json({ sha: data.content.sha });
}

export async function DELETE(req: Request) {
  const token = process.env.GITHUB_TOKEN;
  if (!token)
    return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 500 });

  const body = (await req.json()) as { path: string; sha: string };
  if (!body.path || !body.sha)
    return NextResponse.json({ error: "Missing path or sha" }, { status: 400 });
  if (!body.path.startsWith(ALLOWED_PATH_PREFIX))
    return NextResponse.json({ error: "Forbidden path" }, { status: 403 });

  const encodedPath = body.path.split("/").map(encodeURIComponent).join("/");
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodedPath}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "studento-orchestrator",
    },
    body: JSON.stringify({
      message: `Delete ${body.path.split("/").pop() ?? "file"}`,
      sha: body.sha,
    }),
  });

  if (!res.ok) {
    const err = (await res.json()) as { message?: string };
    return NextResponse.json({ error: err.message ?? "GitHub delete failed" }, { status: res.status });
  }

  return NextResponse.json({ ok: true });
}
