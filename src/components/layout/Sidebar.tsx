"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Calendar,
  GraduationCap,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lessons", label: "Lessons", icon: Calendar },
  { href: "/homework", label: "Homework", icon: ClipboardList },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/students", label: "Students", icon: GraduationCap },
];

function NavLink({
  href,
  label,
  Icon,
  active,
  showLabels,
  onClick,
}: {
  href: string;
  label: string;
  Icon: typeof Link2;
  active: boolean;
  showLabels: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "flex items-center rounded-lg text-[14px] transition-all duration-200 active:scale-95",
        showLabels ? "gap-3 px-4 py-3" : "justify-center px-2 py-3",
        active
          ? "text-white dark:text-white bg-primary/10 border-l-4 border-primary"
          : "text-text-muted hover:text-on-primary-fixed-variant hover:bg-surface-gray-dark/50",
      ].join(" ")}
    >
      <Icon size={20} strokeWidth={1.5} />
      <span className={showLabels ? "" : "hidden"}>{label}</span>
    </Link>
  );
}

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
  const showLabels = mobileOpen || !collapsed;

  return (
    <aside
      className={[
        "app-sidebar fixed left-0 top-0 h-screen bg-bg-dark border-r border-border-dark flex flex-col py-5 sm:py-6 z-50 shadow-xl transition-all duration-300",
        mobileOpen
          ? "translate-x-0 md:translate-x-0"
          : "-translate-x-full md:translate-x-0",
        collapsed ? "md:w-[72px]" : "md:w-sidebar",
        "w-sidebar",
      ].join(" ")}
    >
      {/* Header */}
      <div
        className={[
          "flex items-start gap-3 px-4 mb-6 transition-all",
          showLabels ? "justify-between" : "justify-center",
        ].join(" ")}
      >
        <div className={showLabels ? "" : "md:hidden"}>
          <h1 className="text-[22px] sm:text-[24px] font-bold leading-[1.3] text-primary-fixed">
            Studento Education
          </h1>
          <p className="text-[12px] text-text-muted mt-0.5">
            AI-Driven Learning
          </p>
        </div>
        <button
          onClick={onToggleCollapsed}
          className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-lg bg-surface-gray-dark/80 text-text-muted hover:text-white hover:bg-surface-gray-dark transition-colors shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
        <button
          onClick={onCloseMobile}
          className="inline-flex md:hidden items-center justify-center w-9 h-9 rounded-lg bg-surface-gray-dark/80 text-text-muted hover:text-white hover:bg-surface-gray-dark transition-colors shrink-0"
          aria-label="Close sidebar"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-1 px-2 overflow-y-auto">
        {showLabels && (
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            Navigation
          </p>
        )}
        {navItems.map(({ href, label, icon: Icon }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            Icon={Icon}
            active={pathname === href}
            showLabels={showLabels}
            onClick={onCloseMobile}
          />
        ))}
      </nav>
    </aside>
  );
}
