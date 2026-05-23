import { NextResponse } from "next/server";
import { getSupabaseAdmin, type AdminTable } from "@/lib/supabase-admin";
import type { StudentToken } from "@/lib/types";

interface CreateTokenPayload {
  student_id: string;
  expires_hours: number;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateTokenPayload;

    if (!body.student_id || !body.expires_hours) {
      return NextResponse.json(
        { error: "student_id and expires_hours are required" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const tokenTable = supabase.from("student_tokens") as unknown as AdminTable<StudentToken>;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + body.expires_hours);

    const { data, error } = await tokenTable
      .insert({
        id: crypto.randomUUID(),
        student_id: body.student_id,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Failed to create token" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const shareLink = `${baseUrl}/view/${data.id}`;

    return NextResponse.json(
      {
        id: data.id,
        token: data.id,
        student_id: data.student_id,
        expires_at: data.expires_at,
        share_link: shareLink,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
