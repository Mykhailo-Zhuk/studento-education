"use client";

import { Zap } from "lucide-react";
import type { Student, Group, Lesson, Homework, StudentHomeworkRecord } from "@/lib/types";

interface StudentViewProps {
  student: Student;
  group: Group | null;
  lessons: Lesson[];
  homework: Homework[];
  studentHomeworkRecords: StudentHomeworkRecord[];
}

export default function StudentView({
  student,
  group,
  lessons,
  homework,
  studentHomeworkRecords,
}: StudentViewProps) {
  const getHomeworkStatus = (homeworkId: string | null) => {
    if (!homeworkId) return false;
    return studentHomeworkRecords.find((rec) => rec.homework_id === homeworkId)?.completed ?? false;
  };

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* Main content */}
      <div className="p-10 max-w-6xl mx-auto">
        {/* Personal Info Section */}
        <section className="mb-12">
          <h2 className="text-white text-[24px] font-bold mb-6">Personal Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-text-muted text-[12px] mb-2">Name</p>
              <p className="text-white text-[18px] font-semibold">{student.name}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-text-muted text-[12px] mb-2">Status</p>
              <p className="text-white text-[18px] font-semibold capitalize">{student.status}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-text-muted text-[12px] mb-2">Type</p>
              <p className="text-white text-[18px] font-semibold">{student.type}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-text-muted text-[12px] mb-2">Started</p>
              <p className="text-white text-[18px] font-semibold">
                {new Date(student.started).toLocaleDateString()}
              </p>
            </div>
            {student.telegram && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-text-muted text-[12px] mb-2">Telegram</p>
                <p className="text-white text-[14px]">{student.telegram}</p>
              </div>
            )}
            {student.github_username && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-text-muted text-[12px] mb-2">GitHub</p>
                <p className="text-white text-[14px]">{student.github_username}</p>
              </div>
            )}
            {student.notes && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 col-span-2">
                <p className="text-text-muted text-[12px] mb-2">Notes</p>
                <p className="text-white text-[14px]">{student.notes}</p>
              </div>
            )}
          </div>
        </section>

        {/* Group Info Section */}
        {group && (
          <section className="mb-12">
            <h2 className="text-white text-[24px] font-bold mb-6">Group Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-text-muted text-[12px] mb-2">Group Name</p>
                <p className="text-white text-[18px] font-semibold">{group.name}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-text-muted text-[12px] mb-2">Type</p>
                <p className="text-white text-[18px] font-semibold">{group.type}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-text-muted text-[12px] mb-2">Status</p>
                <p className="text-white text-[18px] font-semibold capitalize">{group.status}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-text-muted text-[12px] mb-2">Started</p>
                <p className="text-white text-[18px] font-semibold">
                  {new Date(group.started).toLocaleDateString()}
                </p>
              </div>
              {group.schedule_time && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <p className="text-text-muted text-[12px] mb-2">Schedule</p>
                  <p className="text-white text-[14px]">{group.schedule_time}</p>
                </div>
              )}
              {group.telegram_url && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <p className="text-text-muted text-[12px] mb-2">Telegram</p>
                  <a
                    href={group.telegram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-container text-[14px]"
                  >
                    Join Group
                  </a>
                </div>
              )}
              {group.journal_url && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <p className="text-text-muted text-[12px] mb-2">Journal</p>
                  <a
                    href={group.journal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-container text-[14px]"
                  >
                    View Journal
                  </a>
                </div>
              )}
              {group.notes && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 col-span-2">
                  <p className="text-text-muted text-[12px] mb-2">Notes</p>
                  <p className="text-white text-[14px]">{group.notes}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Lessons Section */}
        <section className="mb-12">
          <h2 className="text-white text-[24px] font-bold mb-6">Lessons ({lessons.length})</h2>
          {lessons.length > 0 ? (
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{lesson.title}</h3>
                    <p className="text-text-muted text-[12px] mb-2">
                      {new Date(lesson.date).toLocaleDateString()} • {lesson.hours} hours • {lesson.type}
                    </p>
                    <p className="text-text-muted text-[12px]">Status: {lesson.status}</p>
                  </div>
                  {lesson.youtube_url && (
                    <a
                      href={lesson.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 px-4 py-2 bg-primary text-white rounded-lg text-[14px] hover:bg-primary-container transition-colors"
                    >
                      Watch
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-[14px]">No lessons yet</p>
          )}
        </section>

        {/* Homework Section */}
        <section className="mb-12">
          <h2 className="text-white text-[24px] font-bold mb-6">Homework ({homework.length})</h2>
          {homework.length > 0 ? (
            <div className="space-y-3">
              {homework.map((hw) => {
                const isCompleted = getHomeworkStatus(hw.id);
                return (
                  <div
                    key={hw.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-semibold">{hw.title}</h3>
                        <span
                          className={`text-[11px] px-2 py-1 rounded-full ${
                            isCompleted
                              ? "bg-success/20 text-success"
                              : "bg-warning/20 text-warning"
                          }`}
                        >
                          {isCompleted ? "Completed" : "Pending"}
                        </span>
                      </div>
                      <p className="text-text-muted text-[12px] mb-2">
                        {new Date(hw.date).toLocaleDateString()} • {hw.type}
                      </p>
                      {hw.notes && (
                        <p className="text-text-muted text-[12px]">{hw.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-text-muted text-[14px]">No homework yet</p>
          )}
        </section>
      </div>

      {/* FAB */}
      <button className="fixed bottom-10 right-10 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50 group">
        <Zap size={24} fill="white" />
        <span className="absolute right-16 bg-bg-dark text-white px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[14px] pointer-events-none">
          Ask AI Assistant
        </span>
      </button>
    </div>
  );
}
