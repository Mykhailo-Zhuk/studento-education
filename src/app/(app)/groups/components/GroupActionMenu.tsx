"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { MenuAnchor } from "../types";

interface Props {
  anchor: MenuAnchor | null;
  onEdit: (group: MenuAnchor["group"]) => void;
  onDelete: (group: MenuAnchor["group"]) => void;
  onClose: () => void;
}

export default function GroupActionMenu({
  anchor,
  onEdit,
  onDelete,
  onClose,
}: Props) {
  if (!anchor) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        style={{
          position: "absolute",
          top: anchor.top,
          right: anchor.right,
          zIndex: 50,
        }}
        className="bg-white border border-border-light rounded-xl shadow-lg py-1 w-36 modal-panel"
      >
        <button
          onClick={() => onEdit(anchor.group)}
          className="w-full flex items-center gap-2 px-4 py-2 text-[13px] text-text-primary hover:bg-surface-container transition-colors"
        >
          <Pencil size={14} />
          Edit
        </button>
        <button
          onClick={() => onDelete(anchor.group)}
          className="w-full flex items-center gap-2 px-4 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </>
  );
}
