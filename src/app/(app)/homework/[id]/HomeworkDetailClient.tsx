"use client";

import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import {
  BookOpen,
  Terminal,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Bot,
  ChevronRight,
  Users,
  Calendar,
  Tag,
} from "lucide-react";
import type { Homework } from "@/lib/types";

function formatDisplayDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}-${date.getFullYear()}`;
}

export default function HomeworkDetailClient({
  homework,
}: {
  homework: Homework;
}) {
  const statusColor =
    homework.status.toLowerCase() === "completed"
      ? "bg-[#d1fae5] text-[#10b981]"
      : "bg-[#fef3c7] text-[#f59e0b]";

  return (
    <div className="min-h-screen bg-surface-gray-light">
      <TopBar onSearch={() => {}} />

      <main className="p-10">
        {/* Breadcrumb + header */}
        <div className="mb-8">
          <nav className="flex items-center gap-1.5 text-[14px] text-text-muted mb-2">
            <a href="#" className="hover:text-primary transition-colors">
              Dashboard
            </a>
            <ChevronRight size={14} />
            <Link
              href="/homework"
              className="hover:text-primary transition-colors"
            >
              Homework
            </Link>
            <ChevronRight size={14} />
            <span className="text-primary font-semibold">{homework.type}</span>
          </nav>
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-[32px] font-bold text-[#1e293b] tracking-tight">
                {homework.title}
              </h2>
              <p className="text-[14px] text-text-muted mt-1">
                {homework.type} · {homework.group_name}
              </p>
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold uppercase tracking-wide ${statusColor}`}
            >
              <CheckCircle2 size={14} />
              {homework.status}
            </div>
          </div>
        </div>

        {/* Detail cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-border-light rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#dbeafe] rounded-lg">
              <Users size={20} className="text-info" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-text-muted uppercase tracking-wide">
                Group
              </p>
              <p className="text-[16px] font-semibold text-[#1e293b]">
                {homework.group_name}
              </p>
            </div>
          </div>

          <div className="bg-white border border-border-light rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-surface-container rounded-lg">
              <Terminal size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-text-muted uppercase tracking-wide">
                Type
              </p>
              <p className="text-[16px] font-semibold text-[#1e293b]">
                {homework.type}
              </p>
            </div>
          </div>

          <div className="bg-white border border-border-light rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-success-light rounded-lg">
              <Calendar size={20} className="text-success" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-text-muted uppercase tracking-wide">
                Date
              </p>
              <p className="text-[16px] font-semibold text-[#1e293b]">
                {formatDisplayDate(homework.date)}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notes */}
          <section className="bg-white border border-border-light rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-border-light pb-4">
              <BookOpen size={20} className="text-primary" />
              <h3 className="text-[24px] font-semibold text-[#1e293b]">
                Notes
              </h3>
            </div>
            {homework.notes ? (
              <div className="bg-surface-gray-light p-4 rounded-lg border-l-4 border-primary text-text-secondary text-[14px] leading-relaxed whitespace-pre-wrap">
                {homework.notes}
              </div>
            ) : (
              <p className="text-text-muted text-[14px] italic">
                No notes for this assignment.
              </p>
            )}
          </section>

          {/* Status & Info */}
          <section className="bg-white border border-border-light rounded-xl p-8 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-border-light pb-4">
              <Tag size={20} className="text-secondary" />
              <h3 className="text-[24px] font-semibold text-[#1e293b]">
                Details
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-[#f1f5f9]">
                <span className="text-[14px] text-text-muted">Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-[12px] font-bold ${statusColor}`}
                >
                  {homework.status}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#f1f5f9]">
                <span className="text-[14px] text-text-muted">Group</span>
                <span className="text-[14px] font-semibold text-[#1e293b]">
                  {homework.group_name}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#f1f5f9]">
                <span className="text-[14px] text-text-muted">Type</span>
                <span className="text-[14px] font-semibold text-[#1e293b]">
                  {homework.type}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-[14px] text-text-muted">Date</span>
                <span className="text-[14px] font-semibold text-[#1e293b]">
                  {formatDisplayDate(homework.date)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-warning-light rounded-lg mt-auto">
              <AlertTriangle size={16} className="text-warning shrink-0" />
              <p className="text-[12px] text-[#92400e] leading-snug">
                Keep track of your submission status and reach out to your
                instructor if you need help.
              </p>
            </div>
          </section>
        </div>

        {/* Back link */}
        <div className="mt-8">
          <Link
            href="/homework"
            className="flex items-center gap-2 text-primary font-semibold text-[14px] hover:underline"
          >
            <ExternalLink size={14} />
            Back to Homework Overview
          </Link>
        </div>
      </main>

      {/* FAB */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50">
        <Bot size={24} />
      </button>
    </div>
  );
}
