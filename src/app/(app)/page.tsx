import { getSupabaseAdmin, type AdminTable } from "@/lib/supabase-admin";
import DashboardClient from "./DashboardClient";
import type { Student } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = getSupabaseAdmin();

  const { data } = await (
    supabase.from("students") as unknown as AdminTable<Student>
  ).select("*").order("name");
  const students = data ?? [];

  return <DashboardClient students={students} />;
}
