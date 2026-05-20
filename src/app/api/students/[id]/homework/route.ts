import { NextResponse } from "next/server";
import { getSupabaseAdmin, type AdminTable } from "@/lib/supabase-admin";
import type { StudentHomeworkRecord } from "@/lib/types";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await req.json()) as { date: string; completed: boolean; homework_id?: string | null };

    const supabase = getSupabaseAdmin();
    const table = supabase.from("student_homework_records") as unknown as AdminTable<StudentHomeworkRecord>;
    const { data, error } = await table
      .insert({
        student_id: id,
        homework_id: body.homework_id ?? null,
        date: body.date,
        completed: body.completed,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data as StudentHomeworkRecord, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add homework record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
