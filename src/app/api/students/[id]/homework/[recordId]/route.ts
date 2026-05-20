import { NextResponse } from "next/server";
import { getSupabaseAdmin, type AdminTable } from "@/lib/supabase-admin";
import type { StudentHomeworkRecord } from "@/lib/types";

interface Params {
  params: Promise<{ id: string; recordId: string }>;
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { recordId } = await params;
    const supabase = getSupabaseAdmin();
    const table = supabase.from(
      "student_homework_records",
    ) as unknown as AdminTable<StudentHomeworkRecord>;
    const { error } = await table.delete().eq("id", recordId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
