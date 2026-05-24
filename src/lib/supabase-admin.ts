import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase";

export type AdminSingleResponse<T> = Promise<{
  data: T | null;
  error: { message: string } | null;
}>;

export type AdminListResponse<T> = Promise<{
  data: T[];
  error: { message: string } | null;
}> & {
  single: () => AdminSingleResponse<T>;
  order: (column: string, options?: { ascending?: boolean }) => AdminListResponse<T>;
  eq: (column: string, value: string) => AdminListResponse<T>;
};

export type AdminFilterBuilder<T> = AdminListResponse<T>;

export type AdminQueryBuilder<T> = AdminListResponse<T>;

export type AdminWriteBuilder<T> = {
  select: (columns?: string) => {
    single: () => AdminSingleResponse<T>;
  };
};

export type AdminTable<T> = {
  select: (columns?: string) => AdminQueryBuilder<T>;
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
