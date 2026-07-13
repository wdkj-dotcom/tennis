import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/session";
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
    .select("*")
    .returns<Rsvp[]>();

  const today = new Date().toISOString().slice(0, 10);

  const countFor = (eventId: string) =>
    (rsvps ?? []).filter((r) => r.event_id === eventId && r.status === "attending")
      .length;

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
            const status = myStatusFor(ev.id);
            const isPast = ev.event_date < today;
            return (
              <li key={ev.id}>
                <Link
                  href={`/events/${ev.id}`}
                  className={`block bg-white rounded-lg shadow-sm border p-4 hover:border-emerald-400 transition ${
                    isPast ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-medium break-words">{ev.title}</span>
                    <span className="text-sm text-slate-500 whitespace-nowrap">
                      {ev.event_date}
                      {ev.start_time ? ` ${ev.start_time.slice(0, 5)}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap mt-2 text-sm text-slate-500">
                    <span className="break-words">{ev.location ?? "場所未定"}</span>
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      参加 {countFor(ev.id)}
                      {ev.capacity ? ` / ${ev.capacity}` : ""}人
                      {status === "attending" && (
                        <span className="text-emerald-600 font-medium">参加予定</span>
                      )}
                      {status === "not_attending" && (
                        <span className="text-slate-400">不参加</span>
                      )}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
