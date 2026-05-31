import TopBar from "@/components/layout/TopBar";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Student, StudentHomeworkRecord, Homework } from "@/lib/types";
import StudentsClient, { type StudentRow } from "./StudentsClient";

export const dynamic = "force-dynamic";

const GRADIENTS = [
  { from: "#630ed4", to: "#7c3aed" },
  { from: "#006b5f", to: "#4fdbc8" },
  { from: "#3b82f6", to: "#60a5fa" },
  { from: "#be185d", to: "#ec4899" },
  { from: "#f59e0b", to: "#fbbf24" },
  { from: "#10b981", to: "#34d399" },
];

const TYPE_COLOR: Record<string, string> = {
  React:
    "bg-blue-50 text-info border border-blue-100 dark:bg-primary/15 dark:border-primary/20 dark:text-primary",
  "Front-End":
    "bg-amber-50 text-warning border border-amber-100 dark:bg-primary/15 dark:border-primary/20 dark:text-primary",
  "Web Workshop":
    "bg-success-light text-success border border-green-200 dark:bg-primary/15 dark:border-primary/20 dark:text-primary",
};

const ENROLLMENT_STATUS: Record<
  string,
  { label: string; color: string; dot: string; online: string }
> = {
  "Not Started": {
    label: "Not Started",
    color: "text-text-muted",
    dot: "bg-text-muted",
    online: "bg-text-muted",
  },
  "In progress": {
    label: "In progress",
    color: "text-success",
    dot: "bg-success",
    online: "bg-success",
  },
  Interrupted: {
    label: "Interrupted",
    color: "text-warning",
    dot: "bg-warning",
    online: "bg-warning",
  },
  "End course": {
    label: "End course",
    color: "text-info",
    dot: "bg-info",
    online: "bg-info",
  },
};

function calcGrade(records: StudentHomeworkRecord[]): number {
  if (records.length === 0) return 0;
  return Math.round(
    (records.filter((r) => r.completed).length / records.length) * 100,
  );
}

function gradeTrend(gradeNum: number): "up" | "down" | "flat" {
  if (gradeNum >= 70) return "up";
  if (gradeNum >= 50) return "flat";
  return "down";
}

async function fetchAllHomeworkRecords(
  db: ReturnType<typeof getSupabaseAdmin>,
): Promise<StudentHomeworkRecord[]> {
  const results: StudentHomeworkRecord[] = [];
  const batchSize = 1000;
  let from = 0;
  while (true) {
    const { data } = await (db
      .from("student_homework_records")
      .select("*")
      .range(from, from + batchSize - 1) as unknown as Promise<{
      data: StudentHomeworkRecord[] | null;
    }>);
    if (!data || data.length === 0) break;
    results.push(...data);
    if (data.length < batchSize) break;
    from += batchSize;
  }
  return results;
}

export default async function StudentsPage() {
  const db = getSupabaseAdmin();

  const [{ data: students }, allRecords, { data: homeworks }] =
    await Promise.all([
      db.from("students").select("*").order("name") as unknown as Promise<{
        data: Student[] | null;
        error: unknown;
      }>,
      fetchAllHomeworkRecords(db),
      db
        .from("homework")
        .select("*")
        .order("date", { ascending: false }) as unknown as Promise<{
        data: Homework[] | null;
        error: unknown;
      }>,
    ]);

  const recordsByStudent = allRecords.reduce<
    Record<string, StudentHomeworkRecord[]>
  >((acc, r) => {
    (acc[r.student_id] ??= []).push(r);
    return acc;
  }, {});

  const rows: StudentRow[] = (students ?? []).map((s: Student, i: number) => {
    const gradient = GRADIENTS[i % GRADIENTS.length];
    const records = recordsByStudent[s.id] ?? [];
    const gradeNum = calcGrade(records);
    const enrollmentInfo = ENROLLMENT_STATUS[s.status] ?? {
      label: s.status,
      color: "text-text-muted",
      dot: "bg-text-muted",
      online: "bg-text-muted",
    };
    const initials = s.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    const groupColor =
      TYPE_COLOR[s.type] ?? "bg-blue-50 text-info border border-blue-100";

    return {
      id: s.id,
      name: s.name,
      contact: s.telegram ?? "",
      initials,
      gradientFrom: gradient.from,
      gradientTo: gradient.to,
      group: s.group_name,
      groupColor,
      type: s.type,
      grade: `${gradeNum}%`,
      gradeNum,
      gradeTrend: gradeTrend(gradeNum),
      statusLabel: enrollmentInfo.label,
      statusColor: enrollmentInfo.color,
      statusDot: enrollmentInfo.dot,
      statusOnline: enrollmentInfo.online,
      started: s.started,
      finished: s.finished,
      githubUsername: s.github_username,
      examProjectUrl: s.exam_project_url,
      notes: s.notes,
      homeworkRecords: records,
      statusRaw: s.status,
    };
  });

  const uniqueGroups = [...new Set((students ?? []).map((s) => s.group_name))];

  return (
    <div className="min-h-screen bg-surface">
      <TopBar />
      <section className="p-3 sm:p-6 lg:p-10">
        <StudentsClient
          rows={rows}
          uniqueGroups={uniqueGroups}
          homeworks={homeworks ?? []}
        />
      </section>
    </div>
  );
}
