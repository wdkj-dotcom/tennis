"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { SESSION_COOKIE } from "@/lib/session-cookie";

export async function nameLogin(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    redirect(`/login?error=${encodeURIComponent("名前を入力してください")}`);
  }

  const supabase = createAdminClient();

  const { data: existingRows } = await supabase
    .from("profiles")
    .select("id")
    .ilike("name", name)
    .order("created_at", { ascending: true })
    .limit(1);

  let profileId: string;

  if (existingRows && existingRows.length > 0) {
    profileId = existingRows[0].id;
  } else {
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const role = (count ?? 0) === 0 ? "admin" : "member";

    const { data: created, error } = await supabase
      .from("profiles")
      .insert({ name, role })
      .select("id")
      .single();

    if (error?.code === "23505") {
      // 同時に同名で登録された場合は既存の行にフォールバックする
      const { data: fallback } = await supabase
        .from("profiles")
        .select("id")
        .ilike("name", name)
        .order("created_at", { ascending: true })
        .limit(1);
      if (!fallback || fallback.length === 0) {
        redirect(`/login?error=${encodeURIComponent("登録に失敗しました")}`);
      }
      profileId = fallback![0].id;
    } else if (error || !created) {
      redirect(`/login?error=${encodeURIComponent("登録に失敗しました")}`);
    } else {
      profileId = created.id;
    }
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, profileId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  revalidatePath("/", "layout");
  redirect("/events");
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  revalidatePath("/", "layout");
  redirect("/login");
}
