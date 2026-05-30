import { createClient } from "@supabase/supabase-js";
import { assertSupabaseEnv, supabaseUrl } from "./config";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function hasSupabaseAdmin() {
  try {
    assertSupabaseEnv();
  } catch {
    return false;
  }
  return Boolean(serviceRoleKey);
}

export function createAdminClient() {
  assertSupabaseEnv();
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
