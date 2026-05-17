import { NextResponse } from "next/server";
import { getSupabaseAdmin, type AdminTable } from "@/lib/supabase-admin";
import type { Student } from "@/lib/types";

type StudentPayload = Omit<Student, "id" | "created_at">;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as StudentPayload & { id?: string };
    const supabase = getSupabaseAdmin();
    const studentsTable = supabase.from("students") as unknown as AdminTable<Student>;
    const { data, error } = await studentsTable
      .insert({
        id: body.id ?? crypto.randomUUID(),
        name: body.name,
        telegram: body.telegram ?? null,
        group_name: body.group_name,
        type: body.type,
        status: body.status,
        started: body.started,
        finished: body.finished ?? null,
        github_username: body.github_username ?? null,
        homework_scores: body.homework_scores ?? null,
        notes: body.notes ?? null,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create student";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
