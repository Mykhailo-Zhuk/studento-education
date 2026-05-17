import TopBar from "@/components/layout/TopBar";
import { TrendingUp, CheckCircle, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";

const stats = [
  {
    label: "Active Sessions",
    value: "18",
    trend: "+12%",
    trendColor: "text-success",
    icon: <TrendingUp size={14} className="text-success" />,
  },
  {
    label: "Avg. Engagement",
    value: "92%",
    trend: "Optimal",
    trendColor: "text-info",
    icon: <CheckCircle size={14} className="text-info" />,
  },
];

export default async function DashboardPage() {
  const [
    { count: homeworkCount },
    { count: groupsCount },
    { count: lessonsCount },
    { count: studentsCount },
    { data: topStudents },
  ] = await Promise.all([
    supabase.from("homework").select("*", { count: "exact", head: true }),
    supabase.from("groups").select("*", { count: "exact", head: true }),
    supabase.from("lessons").select("*", { count: "exact", head: true }),
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase.from("students").select("name").limit(3),
  ]);

  const orbitNodes = [
    {
      label: "Homework",
      icon: "📋",
      count: homeworkCount ?? 0,
      color: "#be185d",
      pos: "top-0 left-1/2 -translate-x-1/2 -translate-y-12",
      rotate: "-90deg",
    },
    {
      label: "Groups",
      icon: "👥",
      count: groupsCount ?? 0,
      color: "#3b82f6",
      pos: "right-0 top-1/2 -translate-y-1/2 translate-x-12",
      rotate: "0deg",
    },
    {
      label: "Lessons",
      icon: "📅",
      count: lessonsCount ?? 0,
      color: "#f59e0b",
      pos: "bottom-0 left-1/2 -translate-x-1/2 translate-y-12",
      rotate: "90deg",
    },
    {
      label: "Students",
      icon: "🎓",
      count: studentsCount ?? 0,
      color: "#10b981",
      pos: "left-0 top-1/2 -translate-y-1/2 -translate-x-12",
      rotate: "180deg",
    },
  ];

  const avatarLetters = ((topStudents ?? []) as { name: string }[]).map((s) =>
    s.name
      .split(" ")
      .map((n: string) => n[0])
      .join(""),
  );
  const remaining = (studentsCount ?? 0) - avatarLetters.length;

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col">
      <TopBar
        tabs={[{ label: "Analytics", active: true }, { label: "Reports" }]}
        searchPlaceholder="Search insights..."
      />

      {/* Canvas */}
      <div className="flex-1 p-10 flex items-center justify-center relative overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Radial Diagram */}
        <div className="relative w-130 h-130 flex items-center justify-center">
          {/* Orbit ring */}
          <div className="absolute w-120 h-120 rounded-full border-2 border-dashed border-primary/20" />

          {/* Center node */}
          <div className="relative z-20 flex flex-col items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-linear-to-tr from-primary to-primary-container shadow-[0_0_40px_rgba(99,14,212,0.6)] flex items-center justify-center border-4 border-white/20">
              <span className="text-4xl">🎯</span>
            </div>
            <div className="mt-3 text-center">
              <h2 className="text-white text-[24px] font-bold tracking-tight">
                EduOrchestrate
              </h2>
              <span className="inline-flex items-center gap-1.5 bg-success/20 text-success text-[12px] px-3 py-0.5 rounded-full border border-success/30 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                System Active
              </span>
            </div>
          </div>

          {/* Orbit nodes */}
          {orbitNodes.map((node) => (
            <div key={node.label} className={`absolute ${node.pos}`}>
              {/* Dashed connector line */}
              <div
                className="orbit-connector w-45"
                style={{ transform: `rotate(${node.rotate})` }}
              />
              <div className="relative z-10 w-24 h-24 bg-surface-gray-dark border border-white/10 rounded-2xl flex flex-col items-center justify-center shadow-2xl hover:scale-105 transition-transform cursor-pointer">
                <div
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-lg"
                  style={{ backgroundColor: node.color }}
                >
                  {node.count}
                </div>
                <span className="text-2xl mb-1">{node.icon}</span>
                <span className="text-white text-[12px] font-semibold tracking-wide">
                  {node.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-10 left-10 right-10 grid grid-cols-4 gap-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl"
            >
              <p className="text-text-muted text-[12px] mb-1">{s.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-white text-[32px] font-bold leading-none">
                  {s.value}
                </span>
                <span
                  className={`flex items-center gap-0.5 text-[12px] ${s.trendColor}`}
                >
                  {s.icon}
                  {s.trend}
                </span>
              </div>
            </div>
          ))}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl col-span-2 flex items-center justify-between">
            <div>
              <p className="text-text-muted text-[12px] mb-1">
                AI Orchestration Status
              </p>
              <h4 className="text-white text-[18px] font-semibold">
                Intelligent Routing Active
              </h4>
            </div>
            <div className="flex -space-x-2">
              {avatarLetters.map((l) => (
                <div
                  key={l}
                  className="w-10 h-10 rounded-full border-2 border-bg-dark bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white text-[12px] font-bold"
                >
                  {l}
                </div>
              ))}
              {remaining > 0 && (
                <div className="w-10 h-10 rounded-full border-2 border-bg-dark bg-primary-container flex items-center justify-center text-white text-[12px] font-bold">
                  +{remaining}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FAB */}
        <button className="fixed bottom-10 right-10 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50 group">
          <Zap size={24} fill="white" />
          <span className="absolute right-16 bg-bg-dark text-white px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[14px] pointer-events-none">
            Ask AI Assistant
          </span>
        </button>
      </div>
    </div>
  );
}
