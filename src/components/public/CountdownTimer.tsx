"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  /** ISO 8601 expiration date string */
  expiresAt: string;
}

function getRemaining(expiresAt: string): {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

  const total = Math.floor(diff / 1000);
  return {
    total,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export default function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() => getRemaining(expiresAt));
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (remaining.total <= 0) {
      setExpired(true);
      return;
    }

    const interval = setInterval(() => {
      const next = getRemaining(expiresAt);
      setRemaining(next);
      if (next.total <= 0) {
        clearInterval(interval);
        setExpired(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, remaining.total]);

  if (expired) {
    return (
      <span className="text-error text-[13px] font-semibold whitespace-nowrap">
        Link expired
      </span>
    );
  }

  const parts: string[] = [];
  if (remaining.days > 0) parts.push(`${remaining.days}d`);
  if (remaining.hours > 0 || remaining.days > 0) parts.push(`${remaining.hours}h`);
  parts.push(`${String(remaining.minutes).padStart(2, "0")}m`);
  parts.push(`${String(remaining.seconds).padStart(2, "0")}s`);

  const isLow = remaining.total < 3600; // less than 1 hour

  return (
    <span
      className={`text-[13px] font-mono font-semibold whitespace-nowrap ${
        isLow ? "text-error" : "text-text-muted"
      }`}
    >
      Expires in {parts.join(" ")}
    </span>
  );
}
