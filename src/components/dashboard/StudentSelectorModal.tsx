"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import type { Student } from "@/lib/types";

interface StudentSelectorModalProps {
  students: Student[];
  onSelect: (student: Student) => void;
  onClose: () => void;
}

export default function StudentSelectorModal({
  students,
  onSelect,
  onClose,
}: StudentSelectorModalProps) {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.group_name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleConfirm = () => {
    if (selectedStudent) {
      onSelect(selectedStudent);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-panel bg-bg-dark rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-white/10">
          <h3 className="text-white text-[20px] font-bold">Select Student</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex gap-6 overflow-hidden p-8">
          {/* Left: Search and list */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="relative mb-4">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                placeholder="Search by name or group..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-container border border-white/10 rounded-full pl-9 pr-4 py-2 text-[14px] text-white focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filtered.length > 0 ? (
                filtered.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedStudent?.id === student.id
                        ? "bg-primary text-white"
                        : "bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    <div className="font-semibold text-[14px]">
                      {student.name}
                    </div>
                    <div className="text-[12px] mt-1 opacity-75">
                      {student.group_name}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-text-muted text-[14px] text-center py-8">
                  No students found
                </div>
              )}
            </div>
          </div>

          {/* Right: Preview */}
          {selectedStudent && (
            <div className="w-96 border-l border-white/10 pl-6 flex flex-col">
              <h4 className="text-white font-semibold mb-4">Preview</h4>
              <div className="space-y-3 flex-1 overflow-y-auto">
                <div>
                  <p className="text-text-muted text-[12px]">Name</p>
                  <p className="text-white font-semibold">
                    {selectedStudent.name}
                  </p>
                </div>
                <div>
                  <p className="text-text-muted text-[12px]">Group</p>
                  <p className="text-white font-semibold">
                    {selectedStudent.group_name}
                  </p>
                </div>
                <div>
                  <p className="text-text-muted text-[12px]">Type</p>
                  <p className="text-white font-semibold">
                    {selectedStudent.type}
                  </p>
                </div>
                <div>
                  <p className="text-text-muted text-[12px]">Status</p>
                  <p className="text-white font-semibold capitalize">
                    {selectedStudent.status}
                  </p>
                </div>
                <div>
                  <p className="text-text-muted text-[12px]">Started</p>
                  <p className="text-white font-semibold">
                    {new Date(selectedStudent.started).toLocaleDateString()}
                  </p>
                </div>
                {selectedStudent.telegram && (
                  <div>
                    <p className="text-text-muted text-[12px]">Telegram</p>
                    <p className="text-white text-[14px]">
                      {selectedStudent.telegram}
                    </p>
                  </div>
                )}
                {selectedStudent.notes && (
                  <div>
                    <p className="text-text-muted text-[12px]">Notes</p>
                    <p className="text-white text-[14px]">
                      {selectedStudent.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-8 py-6 shrink-0 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-[14px] font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedStudent}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[14px] font-semibold"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
