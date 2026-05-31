"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export function CustomSelect({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full border border-border-light rounded-lg px-2 py-1.5 text-[13px] text-left bg-white flex items-center justify-between gap-1 focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <span className="truncate text-text-primary">
          {selected?.label ?? "—"}
        </span>
        <ChevronDown size={12} className="shrink-0 text-text-muted" />
      </button>
      {open && (
        <ul className="absolute left-0 right-0 top-full mt-1 z-10 bg-white border border-border-light rounded-lg shadow-lg max-h-52 overflow-y-auto modal-panel">
          {options.map((o, i) => (
            <li key={o.value}>
              {i > 0 && <div className="mx-3 border-t border-border-light" />}
              <button
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-[13px] hover:bg-surface-gray-light ${
                  o.value === value
                    ? "font-semibold text-primary"
                    : "text-text-primary"
                }`}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
