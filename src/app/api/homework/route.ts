import { NextResponse } from "next/server";
import { getSupabaseAdmin, type AdminTable } from "@/lib/supabase-admin";
import type { Homework } from "@/lib/types";

type HomeworkPayload = Omit<Homework, "id" | "created_at">;

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const table = supabase.from("homework") as unknown as AdminTable<Homework>;
    const { data, error } = await table.select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data ?? []);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch homework";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as HomeworkPayload & { id?: string };
    const supabase = getSupabaseAdmin();
    const id = body.id ?? crypto.randomUUID();
    const homeworkTable = supabase.from("homework") as unknown as AdminTable<Homework>;

    const { data, error } = await homeworkTable
      .insert({
        id,
        title: body.title,
        date: body.date,
        group_name: body.group_name,
        type: body.type,
        status: body.status,
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
      error instanceof Error ? error.message : "Failed to save homework";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
