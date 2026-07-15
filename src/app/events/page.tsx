import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/session";
import { formatEventTitle } from "@/lib/eventFormat";
import SubmitButton from "@/components/SubmitButton";
import type { Event, Rsvp } from "@/types/database";
import { setRsvp } from "./[id]/actions";

export default async function EventsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = createAdminClient();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true })
    .returns<Event[]>();

  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("*, profiles(name)")
    .returns<(Rsvp & { profiles: { name: string } | null })[]>();

  const today = new Date().toISOString().slice(0, 10);

  const attendingFor = (eventId: string) =>
    (rsvps ?? []).filter((r) => r.event_id === eventId && r.status === "attending");

  const pendingFor = (eventId: string) =>
    (rsvps ?? []).filter((r) => r.event_id === eventId && r.status === "pending");

  const myStatusFor = (eventId: string) =>
    (rsvps ?? []).find((r) => r.event_id === eventId && r.user_id === profile?.id)
      ?.status;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">日程一覧</h1>

      {!events || events.length === 0 ? (
        <p className="text-slate-500 text-sm">まだ日程が登録されていません。</p>
      ) : (
        <ul className="space-y-2">
          {events.map((ev) => {
            const attending = attendingFor(ev.id);
            const pending = pendingFor(ev.id);
            const status = myStatusFor(ev.id);
            const isPast = ev.event_date < today;
            const names = [
              ...attending.map((r) => r.profiles?.name ?? "不明"),
              ...pending.map((r) => `(${r.profiles?.name ?? "不明"})`),
            ];
            const countLabel = `参加${attending.length}${
              ev.capacity ? `/${ev.capacity}` : ""
            }人${pending.length > 0 ? `（${attending.length + pending.length}人）` : ""}`;

            const setAttending = setRsvp.bind(null, ev.id, "attending");
            const setPending = setRsvp.bind(null, ev.id, "pending");
            const setNotAttending = setRsvp.bind(null, ev.id, "not_attending");

            return (
              <li
                key={ev.id}
                className={`bg-white rounded-lg shadow-sm border p-3 ${
                  isPast ? "opacity-50" : ""
                }`}
              >
                <Link
                  href={`/events/${ev.id}`}
                  className="flex items-center gap-2 hover:opacity-80"
                >
                  <div className="flex items-baseline gap-2 min-w-0 flex-1">
                    <span className="text-lg font-bold shrink-0">
                      {formatEventTitle(ev)}
                    </span>
                    <span className="text-sm text-slate-500 truncate">
                      {ev.subtitle ? `${ev.subtitle}・` : ""}
                      {ev.location ?? "場所未定"}・{countLabel}
                      {names.length > 0 ? `・${names.join("、")}` : ""}
                    </span>
                  </div>
                  {status === "attending" && (
                    <span className="shrink-0 text-xs text-emerald-600 font-medium">
                      参加予定
                    </span>
                  )}
                  {status === "pending" && (
                    <span className="shrink-0 text-xs text-amber-600 font-medium">
                      保留
                    </span>
                  )}
                  {status === "not_attending" && (
                    <span className="shrink-0 text-xs text-slate-400">不参加</span>
                  )}
                </Link>

                <div className="mt-2 flex gap-2">
                  <form action={setAttending}>
                    <SubmitButton
                      pendingText="…"
                      className={`px-3 py-1 rounded text-xs font-medium ${
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
                      pendingText="…"
                      className={`px-3 py-1 rounded text-xs font-medium ${
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
                      pendingText="…"
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        status === "not_attending"
                          ? "bg-slate-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      不参加
                    </SubmitButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
