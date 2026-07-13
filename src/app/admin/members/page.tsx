import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/session";
import MemberActions from "@/components/MemberActions";
import type { Profile } from "@/types/database";
import { addMember, setMemberRole, renameMember, deleteMember } from "./actions";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") redirect("/events");

  const { error } = await searchParams;

  const supabase = createAdminClient();
  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true })
    .returns<Profile[]>();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">メンバー管理</h1>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="font-medium text-sm mb-3">
          メンバーを事前登録する（幹事にすることも可能）
        </h2>
        {error && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 rounded px-3 py-2">
            {error}
          </p>
        )}
        <form action={addMember} className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[10rem]">
            <label className="block text-sm mb-1">お名前</label>
            <input
              name="name"
              required
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="山田 太郎"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">役割</label>
            <select
              name="role"
              defaultValue="member"
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="member">参加者</option>
              <option value="admin">幹事</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-emerald-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-emerald-700"
          >
            追加する
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border divide-y">
        {(members ?? []).map((m) => {
          const isSelf = m.id === profile.id;
          return (
            <div
              key={m.id}
              className="flex items-center justify-between gap-3 px-4 py-3 flex-wrap"
            >
              <span className="text-sm break-words">
                {m.name}
                {m.role === "admin" && (
                  <span className="ml-2 text-xs text-emerald-600">幹事</span>
                )}
                {isSelf && <span className="ml-2 text-xs text-slate-400">(自分)</span>}
              </span>
              <MemberActions
                memberId={m.id}
                currentName={m.name}
                role={m.role}
                isSelf={isSelf}
                renameMember={renameMember}
                setMemberRole={setMemberRole}
                deleteMember={deleteMember}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
