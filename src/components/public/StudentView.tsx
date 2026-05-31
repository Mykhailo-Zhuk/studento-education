"use client";

import { useState } from "react";
import type { StudentBundle } from "@/lib/types";
import StudentDataPopup from "@/components/dashboard/StudentDataPopup";

type PopupType = "homework" | "lessons" | "group" | "students" | "report";

export default function StudentView(data: StudentBundle) {
  const { student, group, lessons, homework } = data;
  const [popupType, setPopupType] = useState<PopupType | null>(null);

  const orbitNodes: { label: string; icon: string; count: number; color: string; pos: string; rotate: string; type: PopupType }[] = [
    { label: "Homework", icon: "📋", count: homework.length, color: "#be185d", pos: "top-0 left-1/2 -translate-x-1/2 -translate-y-12", rotate: "-90deg", type: "homework" },
    { label: "Group",    icon: "👥", count: group ? 1 : 0,   color: "#3b82f6", pos: "right-[20px] top-[44%] translate-y-0 translate-x-0 md:right-0 md:top-1/2 md:-translate-y-1/2 md:translate-x-12",  rotate: "0deg",   type: "group"    },
    { label: "Lessons",  icon: "📅", count: lessons.length,   color: "#f59e0b", pos: "bottom-0 left-1/2 -translate-x-1/2 translate-y-12", rotate: "90deg",  type: "lessons"  },
    { label: "Student",  icon: "🎓", count: 1,                color: "#10b981", pos: "left-[20px] top-[44%] translate-y-0 translate-x-0 md:left-0 md:top-1/2 md:-translate-y-1/2 md:-translate-x-12",  rotate: "180deg", type: "students" },
  ];

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden p-10">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-130 h-130 flex items-center justify-center">
        <div className="absolute w-120 h-120 rounded-full border-2 border-dashed border-primary/20" />

        <button
          onClick={() => setPopupType("report")}
          className="relative z-20 flex flex-col items-center justify-center cursor-pointer group hover:scale-110 transition-transform"
        >
          <div className="w-32 h-32 rounded-full bg-linear-to-tr from-primary to-primary-container shadow-[0_0_40px_rgba(99,14,212,0.6)] flex items-center justify-center border-4 border-white/20 group-hover:shadow-[0_0_60px_rgba(99,14,212,0.8)] transition-all">
            <span className="text-4xl">🎯</span>
          </div>
          <div className="mt-3 text-center">
            <h2 className="text-white text-[24px] font-bold tracking-tight">{student.name}</h2>
            <span className="inline-flex items-center gap-1.5 bg-success/20 text-success text-[12px] px-3 py-0.5 rounded-full border border-success/30 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              {student.status}
            </span>
          </div>
        </button>

        {orbitNodes.map((node) => (
          <div key={node.label} className={`absolute ${node.pos}`}>
            <div className="orbit-connector w-45" style={{ transform: `rotate(${node.rotate})` }} />
            <button
              onClick={() => setPopupType(node.type)}
              className="relative z-10 w-24 h-24 bg-surface-gray-dark border border-white/10 rounded-2xl flex flex-col items-center justify-center shadow-2xl hover:scale-105 transition-transform cursor-pointer"
            >
              <div
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-lg"
                style={{ backgroundColor: node.color }}
              >
                {node.count}
              </div>
              <span className="text-2xl mb-1">{node.icon}</span>
              <span className="text-white text-[12px] font-semibold tracking-wide">{node.label}</span>
            </button>
          </div>
        ))}
      </div>

      {popupType && (
        <StudentDataPopup
          type={popupType}
          data={data}
          onClose={() => setPopupType(null)}
        />
      )}
    </div>
  );
}
