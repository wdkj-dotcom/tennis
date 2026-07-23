import NavLink from "@/components/NavLink";
import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/session";
import { formatEventTitle } from "@/lib/eventFormat";
import SubmitButton from "@/components/SubmitButton";
import EventStatusBadge from "@/components/EventStatusBadge";
import type { Event, Rsvp } from "@/types/database";
import { setRsvp, deleteEvent } from "./actions";
import { setEventStatus } from "@/app/admin/events/actions";

export default async function EventDetailContent({
  id,
  isModal = false,
  bare = false,
}: {
  id: string;
  isModal?: boolean;
  bare?: boolean;
}) {
  const myProfile = await getCurrentProfile();
  if (!myProfile) redirect("/login");

  const supabase = createAdminClient();

  const [{ data: event }, { data: allowed }, { data: rsvps }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).single<Event>(),
    myProfile.role !== "admin"
      ? supabase.from("event_visibility").select("profile_id").eq("event_id", id)
      : Promise.resolve({ data: null }),
    supabase
      .from("rsvps")
      .select("*, profiles(name)")
      .eq("event_id", id)
      .returns<(Rsvp & { profiles: { name: string } | null })[]>(),
  ]);

  if (!event) notFound();

  if (
    myProfile.role !== "admin" &&
    allowed &&
    allowed.length > 0 &&
    !allowed.some((a) => a.profile_id === myProfile.id)
  ) {
    notFound();
  }

  const attending = (rsvps ?? []).filter((r) => r.status === "attending");
  const pending = (rsvps ?? []).filter((r) => r.status === "pending");
  const notAttending = (rsvps ?? []).filter((r) => r.status === "not_attending");
  const myStatus = (rsvps ?? []).find((r) => r.user_id === myProfile?.id)?.status;

  const isAdmin = myProfile?.role === "admin";

  const setRsvpAttending = setRsvp.bind(null, id, "attending");
  const setRsvpPending = setRsvp.bind(null, id, "pending");
  const setRsvpNotAttending = setRsvp.bind(null, id, "not_attending");
  const removeEvent = deleteEvent.bind(null, id);
  const markTentative = setEventStatus.bind(null, id, "tentative");
  const markConfirmed = setEventStatus.bind(null, id, "confirmed");
  const markCancelled = setEventStatus.bind(null, id, "cancelled");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tennis-taupe-seven.vercel.app";
  const eventUrl = `${siteUrl}/events/${event.id}`;
  const shareText = [
    formatEventTitle(event),
    event.subtitle,
    event.location ? `場所: ${event.location}` : null,
    eventUrl,
  ]
    .filter(Boolean)
    .join("\n");
  const lineShareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`;

  const card = (
      <div
        className={`bg-white rounded-xl shadow-sm border border-slate-200 p-5 ${
          isModal || bare ? "" : "mt-4"
        }`}
      >
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold break-words">{formatEventTitle(event)}</h1>
              <EventStatusBadge status={event.status} />
            </div>
            {event.subtitle && (
              <p className="text-sm text-slate-500 break-words mt-0.5">{event.subtitle}</p>
            )}
          </div>
          {isAdmin && (
            <div className="flex gap-3 text-xs shrink-0">
              <NavLink
                href={`/admin/events/${event.id}/edit`}
                className="text-slate-500 hover:text-emerald-700"
              >
                編集
              </NavLink>
              <NavLink
                href={`/admin/events/new?copy=${event.id}`}
                className="text-slate-500 hover:text-emerald-700"
              >
                複製
              </NavLink>
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

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
          <span>
            <span className="text-slate-400">場所　</span>
            {event.location ?? "未定"}
          </span>
          {event.capacity && (
            <span>
              <span className="text-slate-400">定員　</span>
              {event.capacity}人
            </span>
          )}
        </div>
        {event.note && (
          <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">
            <span className="text-slate-400">備考　</span>
            {event.note}
          </p>
        )}

        {isAdmin && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <form action={markTentative}>
              <SubmitButton
                pendingText="…"
                className={`px-2.5 py-1 rounded text-xs font-medium ${
                  event.status === "tentative"
                    ? "bg-slate-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                調整中
              </SubmitButton>
            </form>
            <form action={markConfirmed}>
              <SubmitButton
                pendingText="…"
                className={`px-2.5 py-1 rounded text-xs font-medium ${
                  event.status === "confirmed"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                開催決定
              </SubmitButton>
            </form>
            <form action={markCancelled}>
              <SubmitButton
                pendingText="…"
                className={`px-2.5 py-1 rounded text-xs font-medium ${
                  event.status === "cancelled"
                    ? "bg-red-600 text-white"
                    : "bg-red-50 text-red-600 hover:bg-red-100"
                }`}
              >
                中止
              </SubmitButton>
            </form>
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <form action={setRsvpAttending}>
            <SubmitButton
              pendingText="送信中…"
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
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
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
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
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                myStatus === "not_attending"
                  ? "bg-slate-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              不参加
            </SubmitButton>
          </form>
        </div>

        {isAdmin && (
          <a
            href={lineShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-[#06C755] hover:underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 5.94 2 10.8c0 4.36 3.58 8 8.44 8.68.33.07.78.22.9.5.1.26.07.66.03.92l-.15.9c-.05.26-.2 1.03.9.56 1.1-.47 5.94-3.5 8.1-6 1.5-1.65 2.28-3.33 2.28-5.56C22.5 5.94 17.52 2 12 2z" />
            </svg>
            LINEで共有
          </a>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-sm">
          <div className="flex gap-2">
            <span className="shrink-0 text-emerald-700 font-medium w-14">
              参加{attending.length}
            </span>
            <span className="text-slate-600 break-words">
              {attending.map((r) => r.profiles?.name ?? "不明").join("、") || "―"}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0 text-amber-600 font-medium w-14">
              保留{pending.length}
            </span>
            <span className="text-slate-600 break-words">
              {pending.map((r) => r.profiles?.name ?? "不明").join("、") || "―"}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0 text-slate-400 font-medium w-14">
              不参加{notAttending.length}
            </span>
            <span className="text-slate-600 break-words">
              {notAttending.map((r) => r.profiles?.name ?? "不明").join("、") || "―"}
            </span>
          </div>
        </div>
      </div>
  );

  if (bare) return card;

  return (
    <div className={`max-w-3xl mx-auto px-4 ${isModal ? "py-4" : "py-8"}`}>
      {!isModal && (
        <NavLink href="/events" className="text-sm text-emerald-600 hover:underline">
          ← 日程一覧に戻る
        </NavLink>
      )}
      {card}
    </div>
  );
}
