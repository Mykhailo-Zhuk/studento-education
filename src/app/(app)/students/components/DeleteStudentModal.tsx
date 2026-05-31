"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/contexts/notifications";

interface Props {
  id: string;
  onClose: () => void;
}

export default function DeleteStudentModal({ id, onClose }: Props) {
  const router = useRouter();
  const { add: notify } = useNotifications();
  const [deleting, setDeleting] = useState(false);

  // Prevent body scroll while modal is open
  useEffect(() => {
    const prev = {
      overflow: document.body.style.overflow,
      overscroll: document.body.style.overscrollBehavior,
    };
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = prev.overflow;
      document.body.style.overscrollBehavior = prev.overscroll;
    };
  }, []);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    if (!res.ok) {
      notify("Failed to delete student", "error");
      setDeleting(false);
      return;
    }
    notify("Student deleted");
    setDeleting(false);
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center pb-20 modal-overlay">
      <div className="modal-panel bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4">
        <h3 className="text-[18px] font-bold text-text-primary mb-2">
          Delete student?
        </h3>
        <p className="text-[14px] text-text-secondary mb-6">
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-border-light rounded-lg text-[14px] hover:bg-surface-gray-light"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 bg-error text-white rounded-lg text-[14px] font-semibold hover:bg-[#b91c1c] disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
