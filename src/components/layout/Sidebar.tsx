"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Calendar,
  GraduationCap,
  Plus,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/homework", label: "Homework", icon: ClipboardList },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/lessons", label: "Lessons", icon: Calendar },
  { href: "/students", label: "Students", icon: GraduationCap },
];

export default function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapsed,
  onCloseMobile,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={[
        "fixed left-0 top-0 h-screen bg-bg-dark border-r border-border-dark flex flex-col py-5 sm:py-6 z-50 shadow-xl transition-all duration-300",
        mobileOpen ? "translate-x-0 md:translate-x-0" : "-translate-x-full md:translate-x-0",
        collapsed ? "md:w-[72px]" : "md:w-sidebar",
        "w-sidebar",
      ].join(" ")}
    >
      <div
        className={[
          "flex items-start gap-3 px-4 mb-6 transition-all",
          collapsed ? "justify-center md:justify-center" : "justify-between",
        ].join(" ")}
      >
        <div className={collapsed ? "md:hidden" : ""}>
          <h1 className="text-[22px] sm:text-[24px] font-bold leading-[1.3] text-primary-fixed">
            EduOrchestrate
          </h1>
          <p className="text-[12px] text-text-muted mt-0.5">AI-Driven Learning</p>
        </div>
        <button
          onClick={onToggleCollapsed}
          className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-lg bg-surface-gray-dark/80 text-text-muted hover:text-white hover:bg-surface-gray-dark transition-colors shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <button
          onClick={onCloseMobile}
          className="inline-flex md:hidden items-center justify-center w-9 h-9 rounded-lg bg-surface-gray-dark/80 text-text-muted hover:text-white hover:bg-surface-gray-dark transition-colors shrink-0"
          aria-label="Close sidebar"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onCloseMobile}
              className={[
                "flex items-center rounded-lg text-[14px] transition-all duration-200 active:scale-95",
                collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3",
                active
                  ? "text-primary-fixed-dim bg-primary/10 border-l-4 border-primary"
                  : "text-text-muted hover:text-on-primary-fixed-variant hover:bg-surface-gray-dark/50",
              ].join(" ")}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className={collapsed ? "hidden" : ""}>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto">
        <button
          className={[
            "w-full bg-primary-container text-on-primary-container py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-95 text-[14px]",
            collapsed ? "md:py-3 md:px-0" : "",
          ].join(" ")}
        >
          <Plus size={18} />
          <span className={collapsed ? "hidden" : ""}>New Session</span>
        </button>
      </div>
    </aside>
  );
}
