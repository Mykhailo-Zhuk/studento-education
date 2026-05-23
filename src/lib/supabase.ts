import { createBrowserClient } from "@supabase/ssr";
import type { Student, Group, Lesson, Homework, StudentHomeworkRecord } from "./types";

export type Database = {
  public: {
    Tables: {
      students: { Row: Student; Insert: Omit<Student, "id" | "created_at">; Update: Partial<Student>; Relationships: [] };
      groups: { Row: Group; Insert: Omit<Group, "id" | "created_at">; Update: Partial<Group>; Relationships: [] };
      lessons: { Row: Lesson; Insert: Omit<Lesson, "id">; Update: Partial<Lesson>; Relationships: [] };
      homework: { Row: Homework; Insert: Omit<Homework, "id">; Update: Partial<Homework>; Relationships: [] };
      student_homework_records: {
        Row: StudentHomeworkRecord;
        Insert: Omit<StudentHomeworkRecord, "id" | "created_at">;
        Update: Partial<StudentHomeworkRecord>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
