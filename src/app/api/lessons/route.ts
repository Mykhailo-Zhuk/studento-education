import { NextResponse } from "next/server";
import { getSupabaseAdmin, type AdminTable } from "@/lib/supabase-admin";
import type { Lesson } from "@/lib/types";

type LessonPayload = Omit<Lesson, "id" | "created_at">;

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const table = supabase.from("lessons") as unknown as AdminTable<Lesson>;
    const { data, error } = await table.select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data ?? []);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch lessons";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LessonPayload & { id?: string };
    const supabase = getSupabaseAdmin();
    const id = body.id ?? crypto.randomUUID();
    const lessonsTable = supabase.from("lessons") as unknown as AdminTable<Lesson>;
    const { data, error } = await lessonsTable
      .insert({
        id,
        title: body.title,
        group_name: body.group_name,
        type: body.type,
        date: body.date,
        status: body.status,
        hours: body.hours,
        youtube_url: body.youtube_url ?? null,
        has_homework: body.has_homework,
        has_feedback: body.has_feedback,
        comment: body.comment ?? null,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save lesson";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
