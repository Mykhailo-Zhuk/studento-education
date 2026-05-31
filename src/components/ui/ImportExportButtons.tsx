"use client";

import { useRef, useState } from "react";
import {
  Download,
  Upload,
  ChevronDown,
  FileJson,
  FileText,
  Sheet,
} from "lucide-react";
import { parseImportFile } from "@/lib/import-export";

interface ImportExportButtonsProps {
  onExport: (format: "json" | "csv" | "excel") => void;
  onImport: (rows: Record<string, string>[]) => Promise<void>;
}

const EXPORT_FORMATS = [
  { id: "json" as const, label: "JSON", Icon: FileJson },
  { id: "csv" as const, label: "CSV", Icon: FileText },
  { id: "excel" as const, label: "Excel", Icon: Sheet },
];

export default function ImportExportButtons({
  onExport,
  onImport,
}: ImportExportButtonsProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImportError(null);
    setImporting(true);
    try {
      const rows = await parseImportFile(file);
      await onImport(rows);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {importError && (
        <span className="text-[12px] text-error bg-error-light px-2 py-1 rounded-lg">
          {importError}
        </span>
      )}

      {/* Import */}
      <button
        onClick={() => fileRef.current?.click()}
        disabled={importing}
        className="px-3 py-2.5 border border-border-light bg-white rounded-lg text-[13px] flex items-center gap-1.5 hover:bg-surface-gray-light transition-colors disabled:opacity-50"
      >
        <Upload size={14} />
        {importing ? "Importing…" : "Import"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".json,.csv,.xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Export dropdown */}
      <div className="relative">
        <button
          onClick={() => setExportOpen((v) => !v)}
          className="px-3 py-2.5 border border-border-light bg-white rounded-lg text-[13px] flex items-center gap-1.5 hover:bg-surface-gray-light transition-colors"
        >
          <Download size={14} />
          Export
          <ChevronDown
            size={12}
            className={`transition-transform ${exportOpen ? "rotate-180" : ""}`}
          />
        </button>

        {exportOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setExportOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 bg-white border border-border-light rounded-xl shadow-lg py-1 w-36 z-20 modal-panel">
              {EXPORT_FORMATS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setExportOpen(false);
                    onExport(id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-text-primary hover:bg-surface-container transition-colors"
                >
                  <Icon size={14} className="text-text-muted" />
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
