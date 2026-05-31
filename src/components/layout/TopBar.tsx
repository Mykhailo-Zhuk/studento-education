"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Settings,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Clock,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNotifications, type Notification } from "@/contexts/notifications";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface TopBarProps {
  tabs?: { label: string; active?: boolean }[];
  rightContent?: React.ReactNode;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

function timeAgo(ts: number): string {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function NotificationItem({
  n,
  onDismiss,
}: {
  n: Notification;
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-surface-gray-light transition-colors group">
      {n.type === "success" ? (
        <CheckCircle2 size={16} className="text-success shrink-0 mt-0.5" />
      ) : (
        <AlertCircle size={16} className="text-error shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-text-primary leading-snug">
          {n.message}
        </p>
        <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1">
          <Clock size={10} />
          {timeAgo(n.timestamp)}
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-text-primary transition-opacity"
      >
        <X size={13} />
      </button>
    </div>
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const [defaultHours, setDefaultHours] = useState(() => {
    if (typeof window === "undefined") return "24";
    return localStorage.getItem("studento.link.defaultHours") ?? "24";
  });

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  function toggleDarkMode() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("studento.theme", next ? "dark" : "light");
  }

  function saveDefaults() {
    localStorage.setItem("studento.link.defaultHours", defaultHours);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl shadow-2xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <h3 className="text-[16px] font-bold text-text-primary">Settings</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-container text-text-muted"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">
          <section>
            <h4 className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-3">
              Appearance
            </h4>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-[14px] font-semibold text-text-primary">
                  Dark Mode
                </p>
                <p className="text-[12px] text-text-muted">
                  Switch to dark theme
                </p>
              </div>
              <button
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                className={[
                  "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
                  darkMode ? "bg-primary" : "bg-border-light",
                ].join(" ")}
              >
                <span
                  className={[
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200",
                    darkMode ? "translate-x-6" : "translate-x-1",
                  ].join(" ")}
                />
              </button>
            </div>
          </section>

          <section>
            <h4 className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-3">
              General
            </h4>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-[14px] font-semibold text-text-primary">
                  Language
                </p>
                <p className="text-[12px] text-text-muted">
                  Interface language
                </p>
              </div>
              <span className="text-[13px] text-text-secondary bg-surface-container px-3 py-1 rounded-full">
                English
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-[14px] font-semibold text-text-primary">
                  Date Format
                </p>
                <p className="text-[12px] text-text-muted">
                  How dates are displayed
                </p>
              </div>
              <span className="text-[13px] text-text-secondary bg-surface-container px-3 py-1 rounded-full">
                DD-MM-YYYY
              </span>
            </div>
          </section>

          <section>
            <h4 className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-3">
              Share Link Defaults
            </h4>
            <div>
              <label className="text-[13px] font-semibold text-text-secondary">
                Default expiry (hours)
              </label>
              <input
                type="number"
                min="1"
                max="8760"
                value={defaultHours}
                onChange={(e) => setDefaultHours(e.target.value)}
                className="mt-1.5 w-full border border-border-light rounded-lg px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-primary/20 bg-surface text-text-primary"
              />
              <p className="text-[11px] text-text-muted mt-1">
                Used as the pre-selected duration when generating share links
              </p>
            </div>
          </section>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border-light">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border-light rounded-lg text-[14px] text-text-secondary hover:bg-surface-gray-light transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveDefaults}
            className="px-4 py-2 bg-primary text-white rounded-lg text-[14px] font-semibold hover:bg-primary-hover transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TopBar({
  tabs,
  rightContent,
  searchPlaceholder,
  onSearch,
}: TopBarProps) {
  const router = useRouter();
  const { notifications, dismiss, clearAll } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  const notifsRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node))
        setShowNotifs(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node))
        setShowAvatar(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const unread = notifications.length;
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "T";
  const displayName =
    user?.user_metadata?.full_name ?? user?.email ?? "Teacher";

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 bg-surface/80 backdrop-blur-md border-b border-border-light shadow-sm flex items-center justify-between px-4 sm:px-10">
        {/* Left */}
        <div className="flex items-center gap-6">
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
        <div className="flex items-center gap-3">
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

          {/* Bell */}
          <div className="relative" ref={notifsRef}>
            <button
              onClick={() => {
                setShowNotifs((v) => !v);
                setShowAvatar(false);
              }}
              className="relative p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-surface-container transition-colors"
            >
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="max-sm:fixed max-sm:right-4 max-sm:top-[72px] sm:absolute sm:right-0 sm:top-full sm:mt-2 w-80 max-w-[calc(100vw-2rem)] modal-panel border border-border-light rounded-2xl shadow-xl overflow-hidden z-[91]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
                  <span className="text-[13px] font-bold text-text-primary">
                    Notifications
                  </span>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="flex items-center gap-1 text-[11px] text-text-muted hover:text-error transition-colors"
                    >
                      <Trash2 size={11} /> Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-border-light">
                  {notifications.length === 0 ? (
                    <p className="text-[13px] text-text-muted text-center py-8">
                      No notifications yet
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <NotificationItem
                        key={n.id}
                        n={n}
                        onDismiss={() => dismiss(n.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            onClick={() => {
              setShowSettings(true);
              setShowNotifs(false);
              setShowAvatar(false);
            }}
            className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-surface-container transition-colors"
          >
            <Settings size={20} />
          </button>

          {/* Avatar */}
          <div className="relative" ref={avatarRef}>
            <button
              onClick={() => {
                setShowAvatar((v) => !v);
                setShowNotifs(false);
              }}
              className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white text-[12px] font-bold hover:ring-2 hover:ring-primary/40 transition-all"
            >
              {initials}
            </button>

            {showAvatar && (
              <div className="absolute right-0 top-full mt-2 w-56 modal-panel border border-border-light rounded-2xl shadow-xl overflow-hidden z-[91]">
                <div className="px-4 py-3 border-b border-border-light">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-text-primary truncate">
                        {displayName}
                      </p>
                      {user?.email && (
                        <p className="text-[11px] text-text-muted truncate">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-error hover:bg-error-light transition-colors"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
