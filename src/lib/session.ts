import { cookies } from "next/headers";
import { createAdminClient } from "./supabase/admin";
import { SESSION_COOKIE } from "./session-cookie";
import type { Profile } from "@/types/database";

export async function getCurrentProfile(): Promise<Profile | null> {
  const cookieStore = await cookies();
  const id = cookieStore.get(SESSION_COOKIE)?.value;
  if (!id) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single<Profile>();

  return data ?? null;
}
