import { cache } from "react";
import { cookies } from "next/headers";
import { createAdminClient } from "./supabase/admin";
import { SESSION_COOKIE } from "./session-cookie";
import type { Profile } from "@/types/database";

// リクエスト単位でメモ化し、同じレンダリング内（レイアウト＋ページ）で
// 何度呼んでもDBへの問い合わせは1回だけになるようにする。
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
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
});
