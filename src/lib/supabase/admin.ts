import { createClient } from "@supabase/supabase-js";

// service role key はRLSを無視するため、サーバー専用（"use server"配下）でのみ使用すること。
// ブラウザに渡してはいけない。
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
