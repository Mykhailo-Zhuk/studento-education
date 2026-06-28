"use client";

import CountdownTimer from "./CountdownTimer";

interface PublicTopBarProps {
  expiresAt?: string;
}

export default function PublicTopBar({ expiresAt }: PublicTopBarProps) {
  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-bg-dark border-b border-white/10 flex items-center justify-between px-10">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎯</span>
        <h1 className="text-white text-[20px] font-bold">Studento Education</h1>
      </div>
      <div className="flex items-center gap-4">
        {expiresAt && <CountdownTimer expiresAt={expiresAt} />}
        <span className="text-text-muted text-[14px]">Student View</span>
      </div>
    </header>
  );
}
