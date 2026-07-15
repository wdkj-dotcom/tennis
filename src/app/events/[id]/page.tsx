import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/session";
import { formatEventTitle } from "@/lib/eventFormat";
import SubmitButton from "@/components/SubmitButton";
import type { Event, Rsvp } from "@/types/database";
import { setRsvp, deleteEvent } from "./actions";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const myProfile = await getCurrentProfile();
  if (!myProfile) redirect("/login");

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single<Event>();

  if (!event) notFound();

  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("*, profiles(name)")
    .eq("event_id", id)
    .returns<(Rsvp & { profiles: { name: string } | null })[]>();

  const attending = (rsvps ?? []).filter((r) => r.status === "attending");
  const pending = (rsvps ?? []).filter((r) => r.status === "pending");
  const notAttending = (rsvps ?? []).filter((r) => r.status === "not_attending");
  const myStatus = (rsvps ?? []).find((r) => r.user_id === myProfile?.id)?.status;

  const isAdmin = myProfile?.role === "admin";

  const setRsvpAttending = setRsvp.bind(null, id, "attending");
  const setRsvpPending = setRsvp.bind(null, id, "pending");
  const setRsvpNotAttending = setRsvp.bind(null, id, "not_attending");
  const removeEvent = deleteEvent.bind(null, id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/events" className="text-sm text-emerald-600 hover:underline">
        ← 日程一覧に戻る
      </Link>

      <div className="bg-white rounded-lg shadow-sm border p-6 mt-4">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <h1 className="text-xl font-bold break-words">{formatEventTitle(event)}</h1>
            {event.subtitle && (
              <p className="text-sm text-slate-500 break-words">{event.subtitle}</p>
            )}
          </div>
          {isAdmin && (
            <div className="flex gap-3 text-sm">
              <Link
                href={`/admin/events/${event.id}/edit`}
                className="text-slate-500 hover:text-emerald-700"
              >
                編集
              </Link>
              <Link
                href={`/admin/events/new?copy=${event.id}`}
                className="text-slate-500 hover:text-emerald-700"
              >
                複製
              </Link>
              <form action={removeEvent}>
                <SubmitButton
                  pendingText="削除中…"
                  className="text-red-500 hover:text-red-700"
                >
                  削除
                </SubmitButton>
              </form>
            </div>
          )}
        </div>

        <dl className="mt-4 space-y-1 text-sm text-slate-600">
          <div className="flex gap-2">
            <dt className="w-16 text-slate-400">場所</dt>
            <dd className="break-words">{event.location ?? "未定"}</dd>
          </div>
          {event.capacity && (
            <div className="flex gap-2">
              <dt className="w-16 text-slate-400">定員</dt>
              <dd>
                {event.capacity}人
                {pending.length > 0 &&
                  `（保留含め${attending.length + pending.length}人）`}
              </dd>
            </div>
          )}
          {event.note && (
            <div className="flex gap-2">
              <dt className="w-16 text-slate-400">備考</dt>
              <dd className="whitespace-pre-wrap">{event.note}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex gap-3">
          <form action={setRsvpAttending}>
            <SubmitButton
              pendingText="送信中…"
              className={`px-4 py-2 rounded text-sm font-medium ${
                myStatus === "attending"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              参加する
            </SubmitButton>
          </form>
          <form action={setRsvpPending}>
            <SubmitButton
              pendingText="送信中…"
              className={`px-4 py-2 rounded text-sm font-medium ${
                myStatus === "pending"
                  ? "bg-amber-500 text-white"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
            >
              保留
            </SubmitButton>
          </form>
          <form action={setRsvpNotAttending}>
            <SubmitButton
              pendingText="送信中…"
              className={`px-4 py-2 rounded text-sm font-medium ${
                myStatus === "not_attending"
                  ? "bg-slate-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              不参加
            </SubmitButton>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-lg shadow-sm border p-4 min-w-0">
          <h2 className="font-medium text-sm mb-2 text-emerald-700">
            参加 ({attending.length})
          </h2>
          <ul className="space-y-1 text-sm text-slate-600">
            {attending.map((r) => (
              <li key={r.user_id} className="break-words">
                {r.profiles?.name ?? "不明"}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 min-w-0">
          <h2 className="font-medium text-sm mb-2 text-amber-600">
            保留 ({pending.length})
          </h2>
          <ul className="space-y-1 text-sm text-slate-600">
            {pending.map((r) => (
              <li key={r.user_id} className="break-words">
                （{r.profiles?.name ?? "不明"}）
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 min-w-0">
          <h2 className="font-medium text-sm mb-2 text-slate-500">
            不参加 ({notAttending.length})
          </h2>
          <ul className="space-y-1 text-sm text-slate-600">
            {notAttending.map((r) => (
              <li key={r.user_id} className="break-words">
                {r.profiles?.name ?? "不明"}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
