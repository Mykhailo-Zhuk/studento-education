import { NextResponse } from "next/server";
import { getSupabaseAdmin, type AdminTable } from "@/lib/supabase-admin";
import type {
  Student,
  StudentToken,
  Group,
  Lesson,
  Homework,
  StudentHomeworkRecord,
  PublicStudentInfo,
  StudentPrivateProfile,
  StudentHomeworkDetail,
} from "@/lib/types";

interface Params {
  params: Promise<{ token: string }>;
}

export async function GET(req: Request, { params }: Params) {
  try {
    const { token } = await params;
    if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const requestedStudentId = searchParams.get("student_id");

    const supabase = getSupabaseAdmin();

    // 1. Validate token
    const { data: tokenData, error: tokenError } = await (
      supabase.from("student_tokens") as unknown as AdminTable<StudentToken>
    )
      .select("*")
      .eq("id", token)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }

    // ── Group token ───────────────────────────────────────────────────────────
    // Check if this token belongs to a group (UUID stored as student_id)
    const { data: groupByToken } = await (supabase.from("groups") as unknown as AdminTable<Group>)
      .select("*").eq("id", tokenData.student_id).single();

    if (groupByToken) {
      const groupName = groupByToken.name;

      const [studentsRes, lessonsRes, homeworkRes, allRecordsRes] = await Promise.all([
        (supabase.from("students") as unknown as AdminTable<Student>)
          .select("*").eq("group_name", groupName).order("name"),
        (supabase.from("lessons") as unknown as AdminTable<Lesson>)
          .select("*").eq("group_name", groupName).order("date", { ascending: false }),
        (supabase.from("homework") as unknown as AdminTable<Homework>)
          .select("*").eq("group_name", groupName).order("date", { ascending: false }),
        (supabase.from("student_homework_records") as unknown as AdminTable<StudentHomeworkRecord>)
          .select("*"),
      ]);

      const group = groupByToken;

      const allStudents = (studentsRes.data ?? []) as Student[];
      const lessons = (lessonsRes.data ?? []) as Lesson[];
      const homework = (homeworkRes.data ?? []) as Homework[];
      const allRecords = (allRecordsRes.data ?? []) as StudentHomeworkRecord[];
      const hwIds = new Set(homework.map((h) => h.id));
      const homeworkById = new Map(homework.map((hw) => [hw.id, hw]));

      const students: PublicStudentInfo[] = allStudents.map((s) => {
        const recs = allRecords.filter(
          (r) => r.student_id === s.id && r.homework_id && hwIds.has(r.homework_id!),
        );
        const completed = recs.filter((r) => r.completed).length;
        const total = recs.length;
        return {
          id: s.id,
          name: s.name,
          status: s.status,
          completedCount: completed,
          totalCount: total,
          completionPct: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      });

      const body: Record<string, unknown> = {
        type: "group",
        group,
        students,
        lessons,
        homework,
        expiresAt: tokenData.expires_at,
      };

      // Private data: only if the requested student belongs to this group
      if (requestedStudentId) {
        const priv = allStudents.find((s) => s.id === requestedStudentId);
        if (priv) {
          const studentRecords = allRecords.filter((r) => r.student_id === requestedStudentId);
          body.privateStudent = {
            id: priv.id,
            name: priv.name,
            github_username: priv.github_username,
            started: priv.started,
          } satisfies StudentPrivateProfile;
          body.studentHomeworkDetails = studentRecords
            .filter((r) => r.homework_id)
            .map((r) => {
              const hw = homeworkById.get(r.homework_id!);
              return {
                homeworkId: r.homework_id!,
                title: hw?.title ?? "Homework",
                date: hw?.date ?? r.date,
                completed: r.completed,
              } satisfies StudentHomeworkDetail;
            });
        }
      }

      return NextResponse.json(body, { status: 200 });
    }

    // ── Per-student token (legacy) ─────────────────────────────────────────────
    const { data: student, error: studentError } = await (
      supabase.from("students") as unknown as AdminTable<Student>
    )
      .select("*")
      .eq("id", tokenData.student_id)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const [groupRes, lessonsRes, recordsRes, allHwRes] = await Promise.all([
      (supabase.from("groups") as unknown as AdminTable<Group>)
        .select("*").eq("name", student.group_name).single(),
      (supabase.from("lessons") as unknown as AdminTable<Lesson>)
        .select("*").eq("group_name", student.group_name).order("date", { ascending: false }),
      (supabase.from("student_homework_records") as unknown as AdminTable<StudentHomeworkRecord>)
        .select("*").eq("student_id", student.id),
      (supabase.from("homework") as unknown as AdminTable<Homework>)
        .select("*").order("date", { ascending: false }),
    ]);

    const records = (recordsRes.data ?? []) as StudentHomeworkRecord[];
    const studentHomework = ((allHwRes.data ?? []) as Homework[]).filter((hw) =>
      records.some((r) => r.homework_id === hw.id),
    );

    return NextResponse.json(
      {
        student,
        group: groupRes.data ?? null,
        lessons: lessonsRes.data ?? [],
        homework: studentHomework,
        studentHomeworkRecords: records,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
