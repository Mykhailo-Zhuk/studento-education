import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase";

export type AdminSingleResponse<T> = Promise<{
  data: T | null;
  error: { message: string } | null;
}>;

export type AdminWriteBuilder<T> = {
  select: (columns?: string) => {
    single: () => AdminSingleResponse<T>;
  };
};

export type AdminTable<T> = {
  insert: (payload: Record<string, unknown>) => AdminWriteBuilder<T>;
  update: (payload: Record<string, unknown>) => {
    eq: (column: string, value: string) => AdminWriteBuilder<T>;
  };
  delete: () => {
    eq: (column: string, value: string) => Promise<{
      error: { message: string } | null;
    }>;
  };
};

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
