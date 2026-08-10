import NavLink from "@/components/NavLink";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/session";
import { getAllEvents, getVisibilityRows } from "@/lib/events-data";
import { formatEventTitle } from "@/lib/eventFormat";
import SubmitButton from "@/components/SubmitButton";
import EventStatusBadge from "@/components/EventStatusBadge";
import CalendarView from "@/components/CalendarView";
import SwipeMonthNav from "@/components/SwipeMonthNav";
import type { Event, Rsvp } from "@/types/database";

function getRowClass(eventStatus: Event["status"], myStatus: string | undefined) {
  if (eventStatus === "cancelled" || myStatus === "not_attending") {
    return "text-slate-300";
  }
  if (eventStatus === "confirmed" && myStatus === "attending") {
    return "bg-emerald-100";
  }
  return "";
}
import { setRsvp } from "./[id]/actions";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    includeCancelled?: string;
    view?: string;
  }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { month, includeCancelled, view } = await searchParams;
  const isCalendarView = view === "calendar";

  const supabase = createAdminClient();

  const [allEventsRaw, visibilityRows, { data: rsvps }] = await Promise.all([
    getAllEvents(),
    getVisibilityRows(),
    supabase
      .from("rsvps")
      .select("*, profiles(name)")
      .returns<(Rsvp & { profiles: { name: string } | null })[]>(),
  ]);

  const restrictedEventIds = new Map<string, Set<string>>();
  for (const row of visibilityRows) {
    if (!restrictedEventIds.has(row.event_id)) {
      restrictedEventIds.set(row.event_id, new Set());
    }
    restrictedEventIds.get(row.event_id)!.add(row.profile_id);
  }

  const isVisible = (eventId: string) => {
    if (profile.role === "admin") return true;
    const allowed = restrictedEventIds.get(eventId);
    return !allowed || allowed.has(profile.id);
  };

  const allEvents = allEventsRaw
    .filter((ev) => isVisible(ev.id))
    .filter((ev) => includeCancelled === "1" || ev.status !== "cancelled");

  const today = new Date().toISOString().slice(0, 10);
  const displayMonth = month ?? today.slice(0, 7);

  const events = allEvents.filter((ev) => ev.event_date.startsWith(displayMonth));

  const attendingFor = (eventId: string) =>
    (rsvps ?? []).filter((r) => r.event_id === eventId && r.status === "attending");

  const pendingFor = (eventId: string) =>
    (rsvps ?? []).filter((r) => r.event_id === eventId && r.status === "pending");

  const notAttendingFor = (eventId: string) =>
    (rsvps ?? []).filter((r) => r.event_id === eventId && r.status === "not_attending");

  const myStatusFor = (eventId: string) =>
    (rsvps ?? []).find((r) => r.event_id === eventId && r.user_id === profile?.id)
      ?.status;

  const listParams = new URLSearchParams();
  listParams.set("month", displayMonth);
  if (includeCancelled === "1") listParams.set("includeCancelled", "1");
  const listHref = `/events?${listParams}`;

  const calendarParams = new URLSearchParams(listParams);
  calendarParams.set("view", "calendar");
  const calendarHref = `/events?${calendarParams}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <div className="flex gap-1 mb-3">
        <NavLink
          href={listHref}
          className={`px-3 py-1 rounded text-sm font-medium ${
            !isCalendarView
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          リスト
        </NavLink>
        <NavLink
          href={calendarHref}
          className={`px-3 py-1 rounded text-sm font-medium ${
            isCalendarView
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          カレンダー
        </NavLink>
      </div>

      {isCalendarView ? (
        <CalendarView displayMonth={displayMonth} events={events} today={today} />
      ) : (
        <SwipeMonthNav displayMonth={displayMonth}>
          {!events || events.length === 0 ? (
            <p className="text-slate-500 text-sm">この月の日程はありません。</p>
          ) : (
            <ul className="divide-y bg-white">
          {events.map((ev) => {
            const attending = attendingFor(ev.id);
            const pending = pendingFor(ev.id);
            const notAttending = notAttendingFor(ev.id);
            const status = myStatusFor(ev.id);
            const isPast = ev.event_date < today;
            const names = [
              ...attending.map((r) => r.profiles?.name ?? "不明"),
              ...pending.map((r) => `(${r.profiles?.name ?? "不明"})`),
            ];
            const countLabel = `${attending.length}${
              ev.capacity ? `/${ev.capacity}` : ""
            }人${notAttending.length > 0 ? `（${notAttending.length}）` : ""}`;

            const setAttending = setRsvp.bind(null, ev.id, "attending");
            const setPending = setRsvp.bind(null, ev.id, "pending");
            const setNotAttending = setRsvp.bind(null, ev.id, "not_attending");

            const statusClass = getRowClass(ev.status, status);

            return (
              <li
                key={ev.id}
                className={`py-1.5 px-2 -mx-2 rounded ${statusClass} ${
                  isPast ? "opacity-50" : ""
                }`}
              >
                <NavLink href={`/events/${ev.id}`} className="block hover:opacity-80">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-base font-bold shrink-0">
                      {formatEventTitle(ev)}
                    </span>
                    <EventStatusBadge status={ev.status} />
                    <span className="text-sm truncate opacity-80">
                      {ev.subtitle ? `${ev.subtitle}・` : ""}
                      {ev.location ?? "場所未定"}・{countLabel}
                    </span>
                  </div>
                </NavLink>

                <div className="flex items-center gap-2">
                  <NavLink
                    href={`/events/${ev.id}`}
                    className="min-w-0 flex-1 text-sm truncate opacity-80 hover:opacity-60"
                  >
                    {names.length > 0 ? names.join("、") : "―"}
                  </NavLink>

                  <div className="flex gap-1 shrink-0">
                    <form action={setAttending}>
                      <SubmitButton
                        className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                          status === "attending"
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        参加
                      </SubmitButton>
                    </form>
                    <form action={setPending}>
                      <SubmitButton
                        className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                          status === "pending"
                            ? "bg-amber-500 text-white"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        }`}
                      >
                        保留
                      </SubmitButton>
                    </form>
                    <form action={setNotAttending}>
                      <SubmitButton
                        className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                          status === "not_attending"
                            ? "bg-slate-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        不参加
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
            </ul>
          )}
        </SwipeMonthNav>
      )}
    </div>
  );
}
