import { NextResponse } from "next/server";
import { getSupabaseAdmin, type AdminTable } from "@/lib/supabase-admin";
import type { StudentToken, Group } from "@/lib/types";

interface CreateTokenPayload {
  student_id?: string;
  group_name?: string;
  expires_hours: number;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateTokenPayload;

    if (!body.expires_hours || body.expires_hours <= 0) {
      return NextResponse.json({ error: "expires_hours is required" }, { status: 400 });
    }
    if (!body.student_id && !body.group_name) {
      return NextResponse.json({ error: "student_id or group_name is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const tokenTable = supabase.from("student_tokens") as unknown as AdminTable<StudentToken>;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + body.expires_hours);

    let studentId: string;
    if (body.group_name) {
      const { data: group } = await (supabase.from("groups") as unknown as AdminTable<Group>).select("*").eq("name", body.group_name).single();
      if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });
      studentId = group.id;
    } else {
      studentId = body.student_id!;
    }

    const { data, error } = await tokenTable
      .insert({
        id: crypto.randomUUID(),
        student_id: studentId,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Failed to create token" }, { status: 400 });
    }

    const proto = req.headers.get("x-forwarded-proto") ?? "http";
    const host = req.headers.get("host") ?? "localhost:3000";
    const baseUrl = `${proto}://${host}`;
    return NextResponse.json(
      {
        id: data.id,
        token: data.id,
        student_id: data.student_id,
        expires_at: data.expires_at,
        share_link: `${baseUrl}/view/${data.id}`,
        role: "student",
        scope: body.group_name ? "group" : "student",
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
