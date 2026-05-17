import { BookOpen, Sparkles, Terminal } from "lucide-react";
import type { Group } from "@/lib/types";

export type LucideIcon = typeof Terminal;

export const TYPE_ICON: Record<
  string,
  { icon: LucideIcon; bg: string; color: string }
> = {
  "Front-End": { icon: Terminal, bg: "bg-primary/10", color: "text-primary" },
  React: { icon: Sparkles, bg: "bg-[#dbeafe]", color: "text-info" },
  "Web Workshop": {
    icon: BookOpen,
    bg: "bg-success-light",
    color: "text-success",
  },
  Other: { icon: BookOpen, bg: "bg-blue-50", color: "text-info" },
};

export const TYPE_BADGE: Record<string, string> = {
  "Front-End": "bg-primary/10 text-primary border border-primary/20",
  React: "bg-blue-50 text-info border border-blue-100",
  "Web Workshop": "bg-emerald-50 text-success border border-emerald-100",
  Other: "bg-blue-50 text-info border border-blue-100",
};

export const GROUP_TYPES = ["Front-End", "React", "Web Workshop"] as const;
export const GROUP_STATUSES = ["Not started", "In progress", "Finished"] as const;

export function memberCount(members: string | null): number {
  if (!members) return 0;
  return members
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean).length;
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : `${String(date.getDate()).padStart(2, "0")}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}-${date.getFullYear()}`;
}

export type CellTooltip = {
  label: string;
  value: string;
  top: number;
  left: number;
};

export type MenuAnchor = {
  group: Group;
  top: number;
  right: number;
};

export type GroupRow = {
  group: Group;
  id: string;
  name: string;
  members: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  type: string;
  typeClasses: string;
  started: string;
  finished: string;
  schedule: string;
  journalUrl: string | null;
  telegramUrl: string | null;
  notes: string;
  status: string;
  isActive: boolean;
};

export interface GroupFormState {
  name: string;
  type: string;
  status: string;
  started: string;
  finished: string;
  schedule_time: string;
  journal_url: string;
  telegram_url: string;
  notes: string;
}

export type WriteResult = { error: { message: string } | null };

export type GroupsTable = {
  update: (payload: Record<string, unknown>) => {
    eq: (column: string, value: string) => Promise<WriteResult>;
  };
  insert: (payload: Record<string, unknown>) => Promise<WriteResult>;
};
