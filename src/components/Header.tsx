import Link from "next/link";
import { getCurrentProfile } from "@/lib/session";
import { signOut } from "@/app/login/actions";
import MobileNav from "./MobileNav";

export default async function Header() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const isAdmin = profile.role === "admin";
  const userLabel = `${profile.name}${isAdmin ? "（幹事）" : ""}`;

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
            <>
              <Link
                href="/admin/events/new"
                className="text-slate-600 hover:text-emerald-700"
              >
                日程作成
              </Link>
              <Link
                href="/admin/members"
                className="text-slate-600 hover:text-emerald-700"
              >
                メンバー管理
              </Link>
            </>
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
