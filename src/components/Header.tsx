import Link from "next/link";
import { getCurrentProfile } from "@/lib/session";
import { signOut } from "@/app/login/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import SubmitButton from "@/components/SubmitButton";
import MonthFilter from "@/components/MonthFilter";
import IncludeCancelledToggle from "@/components/IncludeCancelledToggle";
import MobileNav from "./MobileNav";

export default async function Header() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const isAdmin = profile.role === "admin";
  const userLabel = `${profile.name}${isAdmin ? "（幹事）" : ""}`;

  const supabase = createAdminClient();
  const { data: events } = await supabase.from("events").select("id, event_date");

  let visibleEvents = events ?? [];
  if (!isAdmin) {
    const { data: visibilityRows } = await supabase
      .from("event_visibility")
      .select("event_id, profile_id");

    const restrictedEventIds = new Map<string, Set<string>>();
    for (const row of visibilityRows ?? []) {
      if (!restrictedEventIds.has(row.event_id)) {
        restrictedEventIds.set(row.event_id, new Set());
      }
      restrictedEventIds.get(row.event_id)!.add(row.profile_id);
    }

    visibleEvents = visibleEvents.filter((ev) => {
      const allowed = restrictedEventIds.get(ev.id);
      return !allowed || allowed.has(profile.id);
    });
  }

  const months = Array.from(
    new Set(visibleEvents.map((ev) => ev.event_date.slice(0, 7)))
  ).sort();

  return (
    <header className="border-b bg-white relative">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/events" className="font-bold text-emerald-700">
            開催日程
          </Link>
          {months.length > 0 && <MonthFilter months={months} />}
          <IncludeCancelledToggle />
        </div>

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
              <Link
                href="/admin/events/bulk-delete"
                className="text-slate-600 hover:text-emerald-700"
              >
                日程を一括削除
              </Link>
            </>
          )}
          <span className="text-slate-400">{userLabel}</span>
          <form action={signOut}>
            <SubmitButton pendingText="ログアウト中…" className="text-slate-500 hover:text-red-600">
              ログアウト
            </SubmitButton>
          </form>
        </nav>

        <MobileNav isAdmin={isAdmin} userLabel={userLabel} signOutAction={signOut} />
      </div>
    </header>
  );
}
