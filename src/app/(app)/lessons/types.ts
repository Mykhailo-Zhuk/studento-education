export type LessonStatus = "live" | "pending" | "completed";

export const BORDER_COLOR: Record<LessonStatus, string> = {
  live: "border-l-primary",
  pending: "border-l-warning-light",
  completed: "border-l-success",
};

export const QUICK_STATUSES = [
  { value: "planning", label: "Planning", dot: "bg-warning", text: "text-warning" },
  { value: "completed", label: "Completed", dot: "bg-success", text: "text-success" },
];

export const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DAY_FULL = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];
export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const PAGE_SIZE = 10;

export function mapStatus(s: string): LessonStatus {
  const l = s.toLowerCase();
  if (l === "completed") return "completed";
  if (l === "live" || l === "in progress") return "live";
  return "pending";
}

export function formatDisplayDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}-${date.getFullYear()}`;
}

export const EMPTY_FORM = {
  title: "",
  date: new Date().toISOString().slice(0, 10),
  hours: 2,
  group_name: "",
  type: "",
  status: "planning",
  has_homework: false,
  has_feedback: false,
  youtube_url: "",
  comment: "",
};

export type LessonForm = typeof EMPTY_FORM;
