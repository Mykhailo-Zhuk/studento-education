import { supabase } from "@/lib/supabase";
import HomeworkDetailClient from "./HomeworkDetailClient";

export default async function HomeworkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: homework } = await supabase
    .from("homework")
    .select("*")
    .eq("id", id)
    .single();

  if (!homework) {
    return (
      <div className="min-h-screen bg-surface-gray-light flex items-center justify-center">
        <p className="text-text-muted text-[16px]">Homework not found.</p>
      </div>
    );
  }

  return <HomeworkDetailClient homework={homework} />;
}
