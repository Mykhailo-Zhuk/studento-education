import { NextResponse } from "next/server";

const OWNER = "Mykhailo-Zhuk";
const REPO = "my-obsidian-vaults";
const KNOWN_FILES = ["What-to-read.md", "What-to-write.md", "Youtube-description.md"];

function resolveBasePath(groupName: string): string {
  const lower = groupName.toLowerCase();
  if (lower.includes("react")) return "Studento/React/Homeworks";
  if (lower.includes("web") && lower.includes("workshop"))
    return "Studento/Web-Workshop-HTML-CSS/Homeworks";
  return "Studento/Front-End-Course-Content/Homeworks";
}

function tokenizeFolder(folder: string): Set<string> {
  // Strip "L19-" or "L07-1-" prefix, then split remaining words by "-"
  return new Set(
    folder
      .toLowerCase()
      .replace(/^l\d+(-\d+)?-/, "")
      .split("-")
      .filter((w) => w.length > 1),
  );
}

function matchFolder(title: string, folderNames: string[]): string | null {
  // Lesson number is required — "Lesson 19" → 19
  const numMatch = title.match(/\b(\d+)\b/);
  if (!numMatch) return null;
  const lessonNum = parseInt(numMatch[1], 10);

  // Step 1: keep only folders whose prefix matches the lesson number
  // Accepts L19-… and L19-1-… (sub-numbers in folder are optional)
  const candidates = folderNames.filter((f) =>
    new RegExp(`^L0*${lessonNum}([^0-9]|$)`, "i").test(f),
  );
  if (candidates.length === 0) return null;

  // Step 2: extract words from parentheses — "(Scope, Loops)" → ["scope", "loops"]
  const bracketWords = Array.from(title.matchAll(/\(([^)]+)\)/g))
    .flatMap((m) => m[1].split(/[\s,]+/))
    .map((w) => w.toLowerCase())
    .filter((w) => w.length > 1);

  // No brackets → number match alone is sufficient; return the sole/first candidate
  if (bracketWords.length === 0) return candidates[0];

  // Step 3: rank candidates by bracket-word overlap (order-independent)
  // Both parameters must match: number already filtered above,
  // bracket words must have at least one hit in the folder tokens
  let best: string | null = null;
  let bestScore = 0;

  for (const folder of candidates) {
    const words = tokenizeFolder(folder);
    const score = bracketWords.filter((w) => words.has(w)).length;
    if (score > bestScore) {
      bestScore = score;
      best = folder;
    }
  }

  // bestScore === 0 means no bracket word matched → return null (not found)
  return best;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const groupName = searchParams.get("group_name");
  const title = searchParams.get("title");

  if (!groupName || !title) {
    return NextResponse.json({ error: "Missing group_name or title" }, { status: 400 });
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

  const basePath = resolveBasePath(groupName);
  const baseSegments = basePath.split("/");
  const encodedBasePath = baseSegments.map(encodeURIComponent).join("/");
  const listUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodedBasePath}`;

  const listRes = await fetch(listUrl, { headers, cache: "no-store" });
  if (!listRes.ok) {
    return NextResponse.json({ error: "Base path not found" }, { status: 404 });
  }

  const items = (await listRes.json()) as Array<{ name: string; type: string }>;
  const folderNames = items.filter((i) => i.type === "dir").map((i) => i.name);

  const folder = matchFolder(title, folderNames);
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
      const data = (await res.json()) as { content: string };
      const content = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
      return { name: fileName, content };
    }),
  );

  return NextResponse.json({ files: files.filter(Boolean), folder });
}
