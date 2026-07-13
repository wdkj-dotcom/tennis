import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/session";
import { formatEventTitle } from "@/lib/eventFormat";
import type { Event, Rsvp } from "@/types/database";

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
        <ul className="space-y-3">
          {events.map((ev) => {
            const attending = attendingFor(ev.id);
            const pending = pendingFor(ev.id);
            const status = myStatusFor(ev.id);
            const isPast = ev.event_date < today;
            const names = [
              ...attending.map((r) => r.profiles?.name ?? "不明"),
              ...pending.map((r) => `(${r.profiles?.name ?? "不明"})`),
            ];
            return (
              <li key={ev.id}>
                <Link
                  href={`/events/${ev.id}`}
                  className={`block bg-white rounded-lg shadow-sm border p-4 hover:border-emerald-400 transition ${
                    isPast ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-medium break-words">
                      {formatEventTitle(ev)}
                    </span>
                    {ev.subtitle && (
                      <span className="text-sm text-slate-500 break-words">
                        {ev.subtitle}
                      </span>
                    )}
                    <span className="text-sm text-slate-500 break-words">
                      {ev.location ?? "場所未定"}
                    </span>
                    <span className="text-sm text-slate-500 break-words">
                      参加 {attending.length}
                      {ev.capacity ? ` / ${ev.capacity}` : ""}人
                      {pending.length > 0 && `（${attending.length + pending.length}人）`}
                      {status === "attending" && (
                        <span className="ml-2 text-emerald-600 font-medium">
                          参加予定
                        </span>
                      )}
                      {status === "pending" && (
                        <span className="ml-2 text-amber-600 font-medium">保留</span>
                      )}
                      {status === "not_attending" && (
                        <span className="ml-2 text-slate-400">不参加</span>
                      )}
                    </span>
                  </div>
                  {names.length > 0 && (
                    <p className="mt-1 text-sm text-slate-500 break-words">
                      {names.join("、")}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
