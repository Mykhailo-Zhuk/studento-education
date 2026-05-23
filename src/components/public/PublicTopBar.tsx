"use client";

export default function PublicTopBar() {
  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-bg-dark border-b border-white/10 flex items-center justify-between px-10">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎯</span>
        <h1 className="text-white text-[20px] font-bold">Studento Education</h1>
      </div>
      <div className="text-text-muted text-[14px]">Student View</div>
    </header>
  );
}
