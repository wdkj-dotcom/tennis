"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/session";
import type { Role } from "@/types/database";

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") redirect("/events");
  return profile;
}

export async function addMember(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const role = (String(formData.get("role")) === "admin" ? "admin" : "member") as Role;
  if (!name) {
    redirect(`/admin/members?error=${encodeURIComponent("名前を入力してください")}`);
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .ilike("name", name)
    .limit(1);

  if (existing && existing.length > 0) {
    redirect(`/admin/members?error=${encodeURIComponent("同じ名前がすでに登録されています")}`);
  }

  const { error } = await supabase.from("profiles").insert({ name, role });
  if (error) {
    const message =
      error.code === "23505" ? "同じ名前がすでに登録されています" : error.message;
    redirect(`/admin/members?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/members");
}

export async function setMemberRole(memberId: string, role: Role) {
  await requireAdmin();

  const supabase = createAdminClient();
  await supabase.from("profiles").update({ role }).eq("id", memberId);

  revalidatePath("/admin/members");
}
