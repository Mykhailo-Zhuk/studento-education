"use client";

import { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import type { Student } from "@/lib/types";
import { useNotifications } from "@/contexts/notifications";

interface GenerateLinkModalProps {
  student: Student;
  onClose: () => void;
}

const DURATION_PRESETS = [
  { label: "1 Day", hours: 24 },
  { label: "7 Days", hours: 7 * 24 },
  { label: "30 Days", hours: 30 * 24 },
];

export default function GenerateLinkModal({ student, onClose }: GenerateLinkModalProps) {
  const { add: notify } = useNotifications();
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [customHours, setCustomHours] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateLink = async () => {
    setError(null);
    const durationHours = selectedDuration !== null ? selectedDuration : parseInt(customHours);

    if (!durationHours || durationHours <= 0) {
      setError("Please select or enter a valid duration");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/student-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: student.id,
          expires_hours: durationHours,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate link");
      }

      const data = await response.json();
      setGeneratedLink(data.share_link);
      notify(`Share link generated for ${student.name}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setError(msg);
      notify(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay" onClick={onClose}>
      <div className="modal-panel bg-bg-dark rounded-2xl shadow-2xl w-full max-w-md mx-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-white/10">
          <h3 className="text-white text-[20px] font-bold">Generate Share Link</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 flex-1 overflow-y-auto">
          {!generatedLink ? (
            <>
              <p className="text-text-muted text-[14px] mb-6">
                Generate a temporary link for <span className="text-white font-semibold">{student.name}</span>
              </p>

              <div className="mb-6">
                <p className="text-white text-[14px] font-semibold mb-3">Link Duration</p>
                <div className="space-y-2">
                  {DURATION_PRESETS.map((preset) => (
                    <button
                      key={preset.hours}
                      onClick={() => {
                        setSelectedDuration(preset.hours);
                        setCustomHours("");
                      }}
                      className={`w-full px-4 py-3 rounded-lg transition-colors text-left text-[14px] font-semibold ${
                        selectedDuration === preset.hours
                          ? "bg-primary text-white"
                          : "bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-white text-[12px] font-semibold mb-2">Custom Duration (hours)</p>
                <input
                  type="number"
                  min="1"
                  max="8760"
                  value={customHours}
                  onChange={(e) => {
                    setCustomHours(e.target.value);
                    setSelectedDuration(null);
                  }}
                  placeholder="e.g., 48"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-[14px] focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-text-muted"
                />
              </div>

              {error && (
                <div className="mb-6 px-4 py-3 bg-error/20 text-error text-[12px] rounded-lg">
                  {error}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-text-muted text-[12px] mb-2">Share this link with {student.name}:</p>
                <div className="bg-white/5 dark:bg-gray-800 border border-white/10 rounded-lg p-3 break-all">
                  <p className="text-white text-[12px]">{generatedLink}</p>
                </div>
              </div>
              <p className="text-text-muted text-[12px]">The link will be valid until the expiration time.</p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-8 py-6 shrink-0 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-[14px] font-semibold"
          >
            {generatedLink ? "Done" : "Cancel"}
          </button>
          {!generatedLink && (
            <button
              onClick={handleGenerateLink}
              disabled={loading || (selectedDuration === null && !customHours)}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[14px] font-semibold"
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          )}
          {generatedLink && (
            <button
              onClick={copyToClipboard}
              className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/80 transition-colors text-[14px] font-semibold flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check size={16} /> Copied
                </>
              ) : (
                <>
                  <Copy size={16} /> Copy
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
