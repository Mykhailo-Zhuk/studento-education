export const TYPE_COLOR: Record<string, string> = {
  React: "bg-blue-50 text-info border border-blue-100",
  "Front-End": "bg-amber-50 text-warning border border-amber-100",
  "Web Workshop": "bg-success-light text-success border border-green-200",
};

export type StudentRow = {
  id: string;
  name: string;
  contact: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  group: string;
  groupColor: string;
  type: string;
  grade: string;
  gradeNum: number;
  gradeTrend: "up" | "down" | "flat";
  statusLabel: string;
  statusColor: string;
  statusDot: string;
  statusOnline: string;
  started: string;
  finished: string | null;
  githubUsername: string | null;
  notes: string | null;
  homeworkRecords: import("@/lib/types").StudentHomeworkRecord[];
  statusRaw: string;
};

export type StatItem = {
  label: string;
  value: string;
  badge: string | null;
  valueColor: string;
  badgeClasses: string;
  iconName?: "trending" | "zap";
};

export const COLUMN_DEFS = [
  { id: "group", label: "Group", defaultVisible: true },
  { id: "type", label: "Type", defaultVisible: true },
  { id: "grade", label: "HW Score", defaultVisible: true },
  { id: "hw_count", label: "# HW", defaultVisible: true },
  { id: "homework", label: "Homework", defaultVisible: true },
  { id: "status", label: "Status", defaultVisible: true },
  { id: "started", label: "Started", defaultVisible: true },
  { id: "finished", label: "Finished", defaultVisible: true },
  { id: "github", label: "GitHub", defaultVisible: true },
  { id: "notes", label: "Notes", defaultVisible: true },
] as const;

export type ColumnId = (typeof COLUMN_DEFS)[number]["id"];

export const DEFAULT_VISIBLE = new Set<ColumnId>(
  COLUMN_DEFS.filter((c) => c.defaultVisible).map((c) => c.id),
);

export const GRADE_RANGES: Record<string, (n: number) => boolean> = {
  "A (90-100)": (n) => n >= 90,
  "B (80-89)": (n) => n >= 80 && n < 90,
  "C (70-79)": (n) => n >= 70 && n < 80,
};

export const PAGE_SIZE = 10;

export const EMPTY_FORM = {
  name: "",
  telegram: "",
  group_name: "",
  type: "React",
  status: "In progress",
  started: "",
  finished: "",
  github_username: "",
  notes: "",
};

export type SortKey =
  | "name"
  | "group"
  | "type"
  | "gradeNum"
  | "statusLabel"
  | "started"
  | "finished";

export type SortDir = "asc" | "desc";
