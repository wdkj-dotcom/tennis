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

export async function renameMember(
  memberId: string,
  name: string
): Promise<{ error?: string }> {
  await requireAdmin();

  const trimmed = name.trim();
  if (!trimmed) return { error: "名前を入力してください" };

  const supabase = createAdminClient();

  const { data: dup } = await supabase
    .from("profiles")
    .select("id")
    .ilike("name", trimmed)
    .neq("id", memberId)
    .limit(1);

  if (dup && dup.length > 0) {
    return { error: "同じ名前がすでに登録されています" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ name: trimmed })
    .eq("id", memberId);

  if (error) {
    return {
      error: error.code === "23505" ? "同じ名前がすでに登録されています" : error.message,
    };
  }

  revalidatePath("/admin/members");
  revalidatePath("/events");
  return {};
}

export async function deleteMember(memberId: string): Promise<{ error?: string }> {
  const admin = await requireAdmin();

  if (admin.id === memberId) {
    return { error: "自分自身は削除できません" };
  }

  const supabase = createAdminClient();

  const { count } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("created_by", memberId);

  if ((count ?? 0) > 0) {
    return {
      error:
        "このメンバーが作成した日程が残っているため削除できません。先にその日程を削除するか編集で作成者を整理してください。",
    };
  }

  const { error } = await supabase.from("profiles").delete().eq("id", memberId);
  if (error) return { error: error.message };

  revalidatePath("/admin/members");
  revalidatePath("/events");
  return {};
}
