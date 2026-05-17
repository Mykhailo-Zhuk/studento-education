import { supabase } from "@/lib/supabase";
import type { Homework } from "@/lib/types";
import HomeworkClient from "./HomeworkClient";

export default async function HomeworkPage() {
  const { data: homework } = await supabase
    .from("homework")
    .select("*")
    .order("date", { ascending: false });

  return <HomeworkClient initialHomework={(homework ?? []) as Homework[]} />;
}
