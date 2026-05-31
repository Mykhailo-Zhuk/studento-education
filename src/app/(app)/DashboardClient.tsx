"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import StudentSelectorModal from "@/components/dashboard/StudentSelectorModal";
import GenerateLinkModal from "@/components/dashboard/GenerateLinkModal";
import StudentDataPopup from "@/components/dashboard/StudentDataPopup";
import type {
  Student,
  StudentBundle,
  Group,
  Lesson,
  Homework,
  StudentHomeworkRecord,
} from "@/lib/types";

interface DashboardClientProps {
  students: Student[];
}

export default function DashboardClient({ students }: DashboardClientProps) {
  const [showSelectorModal, setShowSelectorModal] = useState(false);
  const [showGenerateLinkModal, setShowGenerateLinkModal] = useState(false);
  const [showDataPopup, setShowDataPopup] = useState(false);
  const [dataPopupType, setDataPopupType] = useState<
    "homework" | "lessons" | "group" | "students" | "report"
  >("homework");
  // New state to toggle between preview (data view) and list of students view
  const [showStudentList, setShowStudentList] = useState<boolean>(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudentData, setSelectedStudentData] =
    useState<StudentBundle | null>(null);

  useEffect(() => {
    if (!selectedStudent) return;
    const student = selectedStudent;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    async function fetchStudentData() {
      try {
        const [groups, lessons, homework, records] = await Promise.all([
          fetch(`${baseUrl}/api/groups`).then((r) => r.json()) as Promise<
            Group[]
          >,
          fetch(`${baseUrl}/api/lessons`).then((r) => r.json()) as Promise<
            Lesson[]
          >,
          fetch(`${baseUrl}/api/homework`).then((r) => r.json()) as Promise<
            Homework[]
          >,
          fetch(`${baseUrl}/api/students/${student.id}/homework`).then((r) =>
            r.json(),
          ) as Promise<StudentHomeworkRecord[]>,
        ]);

        const group = groups.find((g) => g.name === student.group_name);
        const studentLessons = lessons.filter(
          (l) => l.group_name === student.group_name,
        );
        const studentRecords = records.filter(
          (r) => r.student_id === student.id,
        );
        const studentHomework = homework.filter((hw) =>
          studentRecords.some((r) => r.homework_id === hw.id),
        );

        setSelectedStudentData({
          student,
          group: group || null,
          lessons: studentLessons,
          homework: studentHomework,
          studentHomeworkRecords: studentRecords,
        });
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      }
    }

    fetchStudentData();
  }, [selectedStudent]);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowSelectorModal(false);
    // When a student is selected, ensure we are in preview mode
    setShowStudentList(false);
  };

  const handleShowDataPopup = (
    type: "homework" | "lessons" | "group" | "students" | "report",
  ) => {
    setDataPopupType(type);
    setShowDataPopup(true);
  };

  const orbitNodes = [
    {
      label: "Homework",
      icon: "📋",
      count: selectedStudentData?.homework.length ?? 0,
      color: "#be185d",
      pos: "top-0 left-1/2 -translate-x-1/2 -translate-y-12",
      rotate: "-90deg",
      onClick: () => handleShowDataPopup("homework"),
    },
    {
      label: "Group",
      icon: "👥",
      count: selectedStudentData?.group ? 1 : 0,
      color: "#3b82f6",
      pos: "right-[20px] top-[44%] md:right-0 md:top-1/2 -translate-y-1/2 translate-x-12",
      rotate: "0deg",
      onClick: () => handleShowDataPopup("group"),
    },
    {
      label: "Lessons",
      icon: "📅",
      count: selectedStudentData?.lessons.length ?? 0,
      color: "#f59e0b",
      pos: "bottom-0 left-1/2 -translate-x-1/2 translate-y-12",
      rotate: "90deg",
      onClick: () => handleShowDataPopup("lessons"),
    },
    {
      label: "Student",
      icon: "🎓",
      count: 1,
      color: "#10b981",
      pos: "left-[20px] top-[44%] md:left-0 md:top-1/2 -translate-y-1/2 -translate-x-12",
      rotate: "180deg",
      onClick: () => handleShowDataPopup("students"),
    },
  ];

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col">
      <TopBar />

      {/* Canvas */}
      <div className="flex-1 p-10 flex items-center justify-center relative overflow-hidden">
        <>
          {/* Ambient glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

          {selectedStudent ? (
            <>
              {/* Radial Diagram with selected student data */}
              <div className="relative w-130 h-130 flex items-center justify-center">
                {/* Orbit ring */}
                <div className="absolute w-120 h-120 rounded-full border-2 border-dashed border-primary/20" />

                {/* Center node */}
                <button
                  onClick={() => handleShowDataPopup("report")}
                  className="relative z-20 flex flex-col items-center justify-center cursor-pointer group hover:scale-110 transition-transform"
                >
                  <div className="w-32 h-32 rounded-full bg-linear-to-tr from-primary to-primary-container shadow-[0_0_40px_rgba(99,14,212,0.6)] flex items-center justify-center border-4 border-white/20 group-hover:shadow-[0_0_60px_rgba(99,14,212,0.8)] transition-all">
                    <span className="text-4xl">🎯</span>
                  </div>
                  <div className="mt-3 text-center">
                    <h2 className="text-white text-[24px] font-bold tracking-tight">
                      {selectedStudent.name}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 bg-success/20 text-success text-[12px] px-3 py-0.5 rounded-full border border-success/30 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      Active
                    </span>
                  </div>
                </button>

                {/* Orbit nodes */}
                {orbitNodes.map((node) => (
                  <div key={node.label} className={`absolute ${node.pos}`}>
                    <div
                      className="orbit-connector w-45"
                      style={{ transform: `rotate(${node.rotate})` }}
                    />
                    <button
                      onClick={node.onClick}
                      className="relative z-10 w-24 h-24 bg-surface-gray-dark border border-white/10 rounded-2xl flex flex-col items-center justify-center shadow-2xl hover:scale-105 transition-transform cursor-pointer"
                    >
                      <div
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-lg"
                        style={{ backgroundColor: node.color }}
                      >
                        {node.count}
                      </div>
                      <span className="text-2xl mb-1">{node.icon}</span>
                      <span className="text-white text-[12px] font-semibold tracking-wide">
                        {node.label}
                      </span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Generate Link Button */}
              <button
                onClick={() => setShowGenerateLinkModal(true)}
                className="absolute bottom-[28px] left-10 w-14 h-14 bg-success text-white rounded-full hover:bg-success/80 transition-all shadow-lg flex items-center justify-center text-xl"
                title="Generate Share Link"
              >
                🔗
              </button>
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-white text-[32px] font-bold mb-4">
                Welcome to Studento Education
              </h2>
              <p className="text-text-muted text-[16px] mb-8">
                Select a student to view their data and generate a share link
              </p>
              <button
                onClick={() => setShowSelectorModal(true)}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-container transition-colors text-[14px] font-semibold"
              >
                Select Student
              </button>
            </div>
          )}
        </>
      </div>

      {/* Modals */}
      {showSelectorModal && (
        <StudentSelectorModal
          students={students}
          onSelect={handleSelectStudent}
          onClose={() => setShowSelectorModal(false)}
        />
      )}

      {showGenerateLinkModal && selectedStudent && (
        <GenerateLinkModal
          student={selectedStudent}
          onClose={() => setShowGenerateLinkModal(false)}
        />
      )}

      {showDataPopup && selectedStudentData && (
        <StudentDataPopup
          type={dataPopupType}
          data={selectedStudentData}
          onClose={() => setShowDataPopup(false)}
        />
      )}
    </div>
  );
}
