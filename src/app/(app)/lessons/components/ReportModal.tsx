"use client";

import { useEffect, useState } from "react";
import { X, Copy, Check } from "lucide-react";
import type { Lesson } from "@/lib/types";

interface Props {
  lessons: Lesson[];
  onClose: () => void;
}

type Period = "first-half" | "full-month";

export default function ReportModal({ lessons, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const [period, setPeriod] = useState<Period>("first-half");
  const [copied, setCopied] = useState(false);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const toDay = period === "first-half" ? 15 : lastDay;
  const monthStr = String(month + 1).padStart(2, "0");
  const fromDate = `${year}-${monthStr}-01`;
  const toDate = `${year}-${monthStr}-${String(toDay).padStart(2, "0")}`;

  const periodLessons = lessons.filter(
    (l) => l.date >= fromDate && l.date <= toDate,
  );
  const count = periodLessons.length;
  const totalHours = periodLessons.reduce((sum, l) => sum + (l.hours ?? 2), 0);
  const payment = 450 * totalHours;

  const reportText = `Привіт, @ol_nyk\n${count} занять по 2 год, 450*${totalHours}=${payment}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-panel bg-bg-dark rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-bold text-white">Generate Report</h3>
          <button
            onClick={onClose}
            className="p-1 text-text-muted hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-2 mb-5">
          {(["first-half", "full-month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-lg border text-[13px] font-semibold transition-colors ${
                period === p
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-white/10 text-text-muted hover:bg-white/10 hover:text-white"
              }`}
            >
              {p === "first-half" ? `1 – 15` : `1 – ${lastDay}`}
            </button>
          ))}
        </div>

        <div className="bg-white/5 rounded-xl px-4 py-3 mb-4 text-[14px] text-white font-mono whitespace-pre-wrap border border-white/10">
          {reportText}
        </div>

        <button
          onClick={handleCopy}
          className={`w-full py-2.5 rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors ${
            copied
              ? "bg-success text-white"
              : "bg-primary text-white hover:bg-primary-container"
          }`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
