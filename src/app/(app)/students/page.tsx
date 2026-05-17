import TopBar from "@/components/layout/TopBar";
import { supabase } from "@/lib/supabase";
import type { Student } from "@/lib/types";
import StudentsClient, {
  type StudentRow,
  type StatItem,
} from "./StudentsClient";

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
  React: "bg-blue-50 text-info border border-blue-100",
  JavaScript: "bg-amber-50 text-warning border border-amber-100",
  TypeScript: "bg-[#dbeafe] text-info border border-blue-200",
  Python: "bg-success-light text-success border border-green-200",
  Node: "bg-design-accent-light text-design-accent border border-pink-200",
};

const ENROLLMENT_STATUS: Record<
  string,
  { label: string; color: string; dot: string; online: string }
> = {
  "Not Started": {
    label: "Не розпочато",
    color: "text-text-muted",
    dot: "bg-text-muted",
    online: "bg-text-muted",
  },
  "In progress": {
    label: "В процесі",
    color: "text-success",
    dot: "bg-success",
    online: "bg-success",
  },
  Interrupted: {
    label: "Перерване",
    color: "text-warning",
    dot: "bg-warning",
    online: "bg-warning",
  },
  "End course": {
    label: "Завершене",
    color: "text-info",
    dot: "bg-info",
    online: "bg-info",
  },
};

function calcGrade(scores: string | null): number {
  if (!scores) return 0;
  const parts = scores
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "");
  if (parts.length === 0) return 0;
  return Math.round(
    (parts.filter((s) => s === "1").length / parts.length) * 100,
  );
}

function gradeTrend(gradeNum: number): "up" | "down" | "flat" {
  if (gradeNum >= 70) return "up";
  if (gradeNum >= 50) return "flat";
  return "down";
}

export default async function StudentsPage() {
  const { data: students } = await supabase
    .from("students")
    .select("*")
    .order("name");

  const rows: StudentRow[] = (students ?? ([] as Student[])).map(
    (s: Student, i: number) => {
      const gradient = GRADIENTS[i % GRADIENTS.length];
      const gradeNum = calcGrade(s.homework_scores);
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
        TYPE_COLOR[s.type] ??
        "bg-blue-50 text-info border border-blue-100";

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
        notes: s.notes,
        homeworkScores: s.homework_scores,
        statusRaw: s.status,
      };
    },
  );

  const total = rows.length;
  const avgProgress =
    total > 0
      ? Math.round(rows.reduce((sum, r) => sum + r.gradeNum, 0) / total)
      : 0;
  const onTrackCount = rows.filter((r) => r.gradeNum >= 70).length;
  const atRiskCount = rows.filter((r) => r.gradeNum < 50).length;
  const onTrackPct = total > 0 ? Math.round((onTrackCount / total) * 100) : 0;
  const atRiskPct = total > 0 ? Math.round((atRiskCount / total) * 100) : 0;

  const stats: StatItem[] = [
    {
      label: "On Track",
      value: String(onTrackCount),
      badge: `${onTrackPct}%`,
      valueColor: "text-success",
      badgeClasses: "bg-success-light text-success",
    },
    {
      label: "At Risk",
      value: String(atRiskCount),
      badge: `${atRiskPct}%`,
      valueColor: "text-error",
      badgeClasses: "bg-error-light text-error",
    },
    {
      label: "Avg. Progress",
      value: `${avgProgress}%`,
      badge: null,
      valueColor: "text-primary",
      badgeClasses: "",
      iconName: "trending",
    },
    {
      label: "Engagement",
      value: avgProgress >= 80 ? "High" : avgProgress >= 60 ? "Good" : "Low",
      badge: null,
      valueColor: "text-secondary",
      badgeClasses: "",
      iconName: "zap",
    },
  ];

  const uniqueGroups = [
    ...new Set((students ?? []).map((s: Student) => s.group_name)),
  ];

  return (
    <div className="min-h-screen bg-surface">
      <TopBar breadcrumb={["Main Hub", "Students"]} />
      <section className="p-10">
        <StudentsClient rows={rows} uniqueGroups={uniqueGroups} stats={stats} />
      </section>
    </div>
  );
}
