import { NextResponse } from "next/server";
import { getSupabaseAdmin, type AdminTable } from "@/lib/supabase-admin";
import type { Homework } from "@/lib/types";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await req.json()) as Record<string, unknown>;
    const supabase = getSupabaseAdmin();
    const homeworkTable = supabase.from("homework") as unknown as AdminTable<Homework>;
    const { data, error } = await homeworkTable
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
      error instanceof Error ? error.message : "Failed to update homework";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("homework").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete homework";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
