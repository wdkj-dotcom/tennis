import NavLink from "@/components/NavLink";
import { getCurrentProfile } from "@/lib/session";
import { signOut } from "@/app/login/actions";
import { getAllEvents, getVisibilityRows } from "@/lib/events-data";
import SubmitButton from "@/components/SubmitButton";
import MonthFilter from "@/components/MonthFilter";
import IncludeCancelledToggle from "@/components/IncludeCancelledToggle";
import MobileNav from "./MobileNav";
import RefreshButton from "./RefreshButton";

export default async function Header() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const isAdmin = profile.role === "admin";
  const userLabel = `${profile.name}${isAdmin ? "（幹事）" : ""}`;

  const [events, visibilityRows] = await Promise.all([
    getAllEvents(),
    isAdmin ? Promise.resolve([]) : getVisibilityRows(),
  ]);

  let visibleEvents = events;
  if (!isAdmin) {
    const restrictedEventIds = new Map<string, Set<string>>();
    for (const row of visibilityRows) {
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

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonth = `${nextMonthDate.getFullYear()}-${String(
    nextMonthDate.getMonth() + 1
  ).padStart(2, "0")}`;

  const eventMonths = new Set(visibleEvents.map((ev) => ev.event_date.slice(0, 7)));
  const months = [currentMonth, nextMonth].filter((m) => eventMonths.has(m));

  return (
    <header className="border-b bg-white relative z-40">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <NavLink
            href="/events"
            className="font-bold text-emerald-700 shrink-0 whitespace-nowrap"
          >
            開催日程
          </NavLink>
          {months.length > 0 && (
            <MonthFilter months={months} currentMonth={currentMonth} />
          )}
          <IncludeCancelledToggle />
          <RefreshButton />
        </div>

        <nav className="hidden sm:flex items-center gap-4 text-sm">
          <NavLink href="/events" className="text-slate-600 hover:text-emerald-700">
            日程一覧
          </NavLink>
          {isAdmin && (
            <>
              <NavLink
                href="/admin/events/new"
                className="text-slate-600 hover:text-emerald-700"
              >
                日程作成
              </NavLink>
              <NavLink
                href="/admin/members"
                className="text-slate-600 hover:text-emerald-700"
              >
                メンバー管理
              </NavLink>
              <NavLink
                href="/admin/events/bulk-delete"
                className="text-slate-600 hover:text-emerald-700"
              >
                日程を一括削除
              </NavLink>
            </>
          )}
          <span className="text-slate-400">{userLabel}</span>
          <form action={signOut}>
            <SubmitButton className="text-slate-500 hover:text-red-600">
              ログアウト
            </SubmitButton>
          </form>
        </nav>

        <MobileNav isAdmin={isAdmin} userLabel={userLabel} signOutAction={signOut} />
      </div>
    </header>
  );
}
