import { NextResponse } from "next/server";
import { getSupabaseAdmin, type AdminTable } from "@/lib/supabase-admin";
import type { Student } from "@/lib/types";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await req.json()) as Record<string, unknown>;
    const supabase = getSupabaseAdmin();
    const studentsTable = supabase.from("students") as unknown as AdminTable<Student>;
    const { data, error } = await studentsTable
      .update(body)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update student";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("students").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete student";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
