import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import Link from "next/link";
import MobileNav from "./MobileNav";

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

  const isAdmin = profile?.role === "admin";
  const userLabel = `${profile?.name ?? ""}${isAdmin ? "（幹事）" : ""}`;

  return (
    <header className="border-b bg-white relative">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/events" className="font-bold text-emerald-700">
          テニスサークル
        </Link>

        <nav className="hidden sm:flex items-center gap-4 text-sm">
          <Link href="/events" className="text-slate-600 hover:text-emerald-700">
            日程一覧
          </Link>
          {isAdmin && (
            <Link
              href="/admin/events/new"
              className="text-slate-600 hover:text-emerald-700"
            >
              日程作成
            </Link>
          )}
          <span className="text-slate-400">{userLabel}</span>
          <form action={signOut}>
            <button className="text-slate-500 hover:text-red-600">
              ログアウト
            </button>
          </form>
        </nav>

        <MobileNav isAdmin={isAdmin} userLabel={userLabel} signOutAction={signOut} />
      </div>
    </header>
  );
}
