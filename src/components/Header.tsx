import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import Link from "next/link";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();

  return (
    <header className="border-b bg-white">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/events" className="font-bold text-emerald-700">
          テニスサークル
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/events" className="text-slate-600 hover:text-emerald-700">
            日程一覧
          </Link>
          {profile?.role === "admin" && (
            <Link
              href="/admin/events/new"
              className="text-slate-600 hover:text-emerald-700"
            >
              日程作成
            </Link>
          )}
          <span className="text-slate-400">
            {profile?.name}
            {profile?.role === "admin" && "（幹事）"}
          </span>
          <form action={signOut}>
            <button className="text-slate-500 hover:text-red-600">
              ログアウト
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
