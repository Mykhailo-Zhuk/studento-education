import { NextResponse } from "next/server";
import { getSupabaseAdmin, type AdminTable } from "@/lib/supabase-admin";
import type { Group } from "@/lib/types";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await req.json()) as Record<string, unknown>;
    const UPDATABLE = new Set(['name','type','status','members','started','finished','schedule_time','journal_url','telegram_url','notes']);
    const patch = Object.fromEntries(Object.entries(body).filter(([k]) => UPDATABLE.has(k)));
    const supabase = getSupabaseAdmin();
    const groupsTable = supabase.from("groups") as unknown as AdminTable<Group>;
    const { data, error } = await groupsTable
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update group";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("groups").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete group";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
