import { NextResponse } from "next/server";
import { getSupabaseAdmin, type AdminTable } from "@/lib/supabase-admin";
import type { Group } from "@/lib/types";

type GroupPayload = Omit<Group, "id" | "created_at">;

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const table = supabase.from("groups") as unknown as AdminTable<Group>;
    const { data, error } = await table.select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data ?? []);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch groups";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GroupPayload & { id?: string };
    const supabase = getSupabaseAdmin();
    const groupsTable = supabase.from("groups") as unknown as AdminTable<Group>;
    const { data, error } = await groupsTable
      .insert({
        id: body.id ?? crypto.randomUUID(),
        name: body.name,
        type: body.type,
        status: body.status,
        members: body.members ?? null,
        started: body.started,
        finished: body.finished ?? null,
        schedule_time: body.schedule_time ?? null,
        journal_url: body.journal_url ?? null,
        telegram_url: body.telegram_url ?? null,
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
      error instanceof Error ? error.message : "Failed to create group";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
