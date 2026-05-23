"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type NotifType = "success" | "error";

export interface Notification {
  id: string;
  message: string;
  type: NotifType;
  timestamp: number;
}

interface NotificationsCtx {
  notifications: Notification[];
  add: (message: string, type?: NotifType) => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
}

const Ctx = createContext<NotificationsCtx | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const add = useCallback((message: string, type: NotifType = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setNotifications((prev) => [{ id, message, type, timestamp: Date.now() }, ...prev].slice(0, 50));
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 8000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  return (
    <Ctx.Provider value={{ notifications, add, dismiss, clearAll }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationsProvider");
  return ctx;
}
