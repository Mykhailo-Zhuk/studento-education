import TopBar from "@/components/layout/TopBar";
import { supabase } from "@/lib/supabase";
import type { Lesson, Group } from "@/lib/types";
import LessonsClient from "./LessonsClient";

export const dynamic = "force-dynamic";

export default async function LessonsPage() {
  const [{ data: lessons }, { data: groups }] = await Promise.all([
    supabase.from("lessons").select("*").order("date", { ascending: false }).limit(500),
    supabase.from("groups").select("*").order("name"),
  ]);

  return (
    <div className="min-h-screen bg-surface">
      <TopBar />
      <LessonsClient
        initialLessons={(lessons ?? [] as Lesson[]) as Lesson[]}
        groups={(groups ?? [] as Group[]) as Group[]}
      />
    </div>
  );
}
