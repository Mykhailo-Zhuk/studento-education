"use client";

import type { Group } from "@/lib/types";

interface Props {
  group: Group;
  deleting: boolean;
  onCancel: () => void;
  onDelete: () => void;
}

export default function DeleteGroupDialog({
  group,
  deleting,
  onCancel,
  onDelete,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4">
      <div className="modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-[16px] font-bold text-text-primary mb-2">
          Delete Group
        </h3>
        <p className="text-[14px] text-text-secondary mb-6">
          Are you sure you want to delete &ldquo;{group.name}&rdquo;? This
          action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-border-light rounded-lg text-[14px] font-semibold text-text-secondary hover:bg-surface-gray-light transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-[14px] font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
