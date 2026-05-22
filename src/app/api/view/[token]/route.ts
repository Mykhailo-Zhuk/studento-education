import { NextResponse } from "next/server";
import { getSupabaseAdmin, type AdminTable } from "@/lib/supabase-admin";
import type { Student, StudentToken, Group, Lesson, Homework, StudentHomeworkRecord } from "@/lib/types";

interface Params {
  params: Promise<{ token: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1. Validate token and get student_id
    const { data: tokenData, error: tokenError } = await (
      supabase.from("student_tokens") as unknown as AdminTable<StudentToken>
    )
      .select("*")
      .eq("id", token)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 2. Check expiry
    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }

    // 3. Fetch student data
    const { data: student, error: studentError } = await (
      supabase.from("students") as unknown as AdminTable<Student>
    )
      .select("*")
      .eq("id", tokenData.student_id)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // 4. Fetch group data
    const { data: group } = await (
      supabase.from("groups") as unknown as AdminTable<Group>
    )
      .select("*")
      .eq("name", student.group_name)
      .single();

    // 5. Fetch lessons for student's group
    const { data: lessons = [] } = await (
      supabase.from("lessons") as unknown as AdminTable<Lesson>
    )
      .select("*")
      .eq("group_name", student.group_name)
      .order("date", { ascending: false });

    // 6. Fetch homework records for student
    const { data: studentHomeworkRecords = [] } = await (
      supabase.from("student_homework_records") as unknown as AdminTable<StudentHomeworkRecord>
    )
      .select("*")
      .eq("student_id", student.id);

    // 7. Fetch all homework to join with student records
    const { data: allHomework = [] } = await (
      supabase.from("homework") as unknown as AdminTable<Homework>
    )
      .select("*")
      .order("date", { ascending: false });

    // 8. Filter homework to only include those the student has records for
    const studentHomework = allHomework.filter((hw) =>
      studentHomeworkRecords.some((rec) => rec.homework_id === hw.id),
    );

    return NextResponse.json(
      {
        student,
        group: group || null,
        lessons,
        homework: studentHomework,
        studentHomeworkRecords,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch student data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
