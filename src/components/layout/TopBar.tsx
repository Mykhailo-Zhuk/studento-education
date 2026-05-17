"use client";

import { Bell, Settings, ChevronRight, Search } from "lucide-react";

interface TopBarProps {
  breadcrumb?: string[];
  tabs?: { label: string; active?: boolean }[];
  rightContent?: React.ReactNode;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

export default function TopBar({
  breadcrumb,
  tabs,
  rightContent,
  searchPlaceholder,
  onSearch,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-surface/80 backdrop-blur-md border-b border-border-light shadow-sm flex items-center justify-between px-10">
      {/* Left */}
      <div className="flex items-center gap-6">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1 text-[14px] text-text-muted">
            {breadcrumb.map((crumb, i) => (
              <span key={crumb} className="flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight size={14} className="text-text-muted" />
                )}
                <span
                  className={
                    i === breadcrumb.length - 1 ? "text-primary font-bold" : ""
                  }
                >
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        )}
        {tabs && (
          <nav className="hidden md:flex gap-6">
            {tabs.map((tab) => (
              <a
                key={tab.label}
                href="#"
                className={[
                  "text-[14px] pb-1 transition-colors",
                  tab.active
                    ? "text-primary border-b-2 border-primary"
                    : "text-text-secondary hover:text-primary",
                ].join(" ")}
              >
                {tab.label}
              </a>
            ))}
          </nav>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {searchPlaceholder && (
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch?.(e.target.value)}
              className="bg-surface-container border-none rounded-full pl-9 pr-4 py-1.5 text-[14px] w-56 focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        )}
        {rightContent}
        <Bell
          size={20}
          className="text-text-secondary cursor-pointer hover:text-primary transition-colors"
        />
        <Settings
          size={20}
          className="text-text-secondary cursor-pointer hover:text-primary transition-colors"
        />
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white text-[12px] font-bold">
          T
        </div>
      </div>
    </header>
  );
}
