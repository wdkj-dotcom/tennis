import { cache } from "react";
import { createAdminClient } from "./supabase/admin";
import type { Event } from "@/types/database";

// リクエスト単位でメモ化し、Header と各ページで同じデータを
// 二重に問い合わせないようにする。
export const getAllEvents = cache(async (): Promise<Event[]> => {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: true })
    .returns<Event[]>();
  return data ?? [];
});

export const getVisibilityRows = cache(
  async (): Promise<{ event_id: string; profile_id: string }[]> => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("event_visibility")
      .select("event_id, profile_id");
    return data ?? [];
  }
);
