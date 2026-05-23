"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import StudentSelectorModal from "@/components/dashboard/StudentSelectorModal";
import GenerateLinkModal from "@/components/dashboard/GenerateLinkModal";
import StudentDataPopup from "@/components/dashboard/StudentDataPopup";
import type { Student, StudentBundle } from "@/lib/types";

interface DashboardClientProps {
  students: Student[];
}

export default function DashboardClient({ students }: DashboardClientProps) {
  const [showSelectorModal, setShowSelectorModal] = useState(false);
  const [showGenerateLinkModal, setShowGenerateLinkModal] = useState(false);
  const [showDataPopup, setShowDataPopup] = useState(false);
  const [dataPopupType, setDataPopupType] = useState<"homework" | "lessons" | "group" | "students" | "report">("homework");

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudentData, setSelectedStudentData] = useState<StudentBundle | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch student data when student is selected
  useEffect(() => {
    if (!selectedStudent) return;

    setLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Temporarily fetch the raw data from the API using the student ID
    // This is a workaround since we don't have a direct API for fetching by student ID
    // In a real scenario, you'd want an /api/students/[id] endpoint
    const fetchStudentData = async () => {
      try {
        // For now, we'll construct the data manually since we don't have a direct API
        const [groups, lessons, homework, records] = await Promise.all([
          fetch(`${baseUrl}/api/groups`).then((r) => r.json()),
          fetch(`${baseUrl}/api/lessons`).then((r) => r.json()),
          fetch(`${baseUrl}/api/homework`).then((r) => r.json()),
          fetch(`${baseUrl}/api/students/${selectedStudent.id}/homework`).then((r) => r.json()),
        ]);

        const group = groups.find((g: any) => g.name === selectedStudent.group_name);
        const studentLessons = lessons.filter((l: any) => l.group_name === selectedStudent.group_name);
        const studentRecords = records.filter((r: any) => r.student_id === selectedStudent.id);
        const studentHomework = homework.filter((hw: any) =>
          studentRecords.some((r: any) => r.homework_id === hw.id),
        );

        setSelectedStudentData({
          student: selectedStudent,
          group: group || null,
          lessons: studentLessons,
          homework: studentHomework,
          studentHomeworkRecords: studentRecords,
        });
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [selectedStudent]);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowSelectorModal(false);
  };

  const handleShowDataPopup = (type: "homework" | "lessons" | "group" | "students" | "report") => {
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
      pos: "right-0 top-1/2 -translate-y-1/2 translate-x-12",
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
      pos: "left-0 top-1/2 -translate-y-1/2 -translate-x-12",
      rotate: "180deg",
      onClick: () => handleShowDataPopup("students"),
    },
  ];

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col">
      <TopBar
        rightContent={
          <button
            onClick={() => setShowSelectorModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-container transition-colors text-[14px] font-semibold"
          >
            {selectedStudent ? `${selectedStudent.name}` : "Select Student"}
          </button>
        }
      />

      {/* Canvas */}
      <div className="flex-1 p-10 flex items-center justify-center relative overflow-hidden">
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
              className="absolute bottom-10 left-10 px-6 py-3 bg-success text-white rounded-lg hover:bg-success/80 transition-colors text-[14px] font-semibold"
            >
              Generate Share Link
            </button>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-white text-[32px] font-bold mb-4">Welcome to Studento Education</h2>
            <p className="text-text-muted text-[16px] mb-8">Select a student to view their data and generate a share link</p>
            <button
              onClick={() => setShowSelectorModal(true)}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-container transition-colors text-[14px] font-semibold"
            >
              Select Student
            </button>
          </div>
        )}

        {/* FAB */}
        <button className="fixed bottom-10 right-10 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50 group">
          <Zap size={24} fill="white" />
          <span className="absolute right-16 bg-bg-dark text-white px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[14px] pointer-events-none">
            Ask AI Assistant
          </span>
        </button>
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
