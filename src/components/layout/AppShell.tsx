"use client";

import { useEffect, useState } from "react";

import Sidebar from "./Sidebar";
import { NotificationsProvider } from "@/contexts/notifications";
import AiChat from "@/components/ai/AiChat";

const STORAGE_KEY = "studento.sidebar.collapsed";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Set CSS variable --vh to handle mobile browser UI showing/hiding
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  return (
    <NotificationsProvider>
      <div className="min-dvh-screen bg-surface">
        <button
          onClick={() => setMobileOpen(true)}
          className={[
            "fixed left-3 top-3.5 z-60 inline-flex md:hidden items-center justify-center w-9 h-9 rounded-xl bg-primary text-white shadow transition-opacity",
            mobileOpen ? "invisible" : "",
          ].join(" ")}
          aria-label="Open sidebar"
        >
          <span className="text-[18px] leading-none">☰</span>
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
            "min-dvh-screen min-w-0 transition-[margin-left] duration-300",
            sidebarCollapsed ? "md:ml-[72px]" : "md:ml-sidebar",
          ].join(" ")}
        >
          {children}
        </div>
        <AiChat />
      </div>
    </NotificationsProvider>
  );
}
