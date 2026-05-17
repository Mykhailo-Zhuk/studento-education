"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

const STORAGE_KEY = "studento.sidebar.collapsed";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === null ? false : stored === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <div className="min-h-screen bg-surface">
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-[60] inline-flex md:hidden items-center justify-center w-10 h-10 rounded-xl bg-bg-dark text-primary-fixed shadow-lg border border-border-dark hover:bg-surface-gray-dark transition-colors"
        aria-label="Open sidebar"
      >
        ☰
      </button>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div
        className={[
          "min-h-screen min-w-0 transition-[margin-left] duration-300",
          sidebarCollapsed ? "md:ml-[72px]" : "md:ml-sidebar",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
