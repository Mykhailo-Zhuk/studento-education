"use client";

import { createPortal } from "react-dom";
import { Check, Copy } from "lucide-react";
import type { CellTooltip } from "../types";

interface Props {
  tooltip: CellTooltip | null;
  copiedValue: string | null;
  onCopy: (value: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function GroupTooltip({
  tooltip,
  copiedValue,
  onCopy,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  if (!tooltip) return null;

  return createPortal(
    <div className="fixed inset-0 z-60 pointer-events-none">
      <div
        style={{
          top: tooltip.top,
          left: tooltip.left,
          width: 360,
        }}
        className="fixed z-70 rounded-xl border border-border-light bg-white shadow-2xl p-4 pointer-events-auto"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-text-muted font-semibold">
              {tooltip.label}
            </p>
            <p className="text-[12px] text-text-secondary">
              Select or copy the full value below.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onCopy(tooltip.value)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-border-light text-[12px] font-semibold text-text-primary hover:bg-surface-gray-light transition-colors"
          >
            {copiedValue === tooltip.value ? (
              <Check size={14} />
            ) : (
              <Copy size={14} />
            )}
            {copiedValue === tooltip.value ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="max-h-40 overflow-auto rounded-lg border border-[#f1f5f9] bg-surface-gray-light p-3">
          <p className="text-[13px] leading-5 text-text-primary whitespace-pre-wrap select-text wrap-break-word">
            {tooltip.value}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
