import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/session";
import { formatEventTitle } from "@/lib/eventFormat";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import type { Event } from "@/types/database";
import { bulkDeleteEvents } from "../actions";

export default async function BulkDeleteEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") redirect("/events");

  const { error } = await searchParams;

  const supabase = createAdminClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true })
    .returns<Event[]>();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">日程を一括削除</h1>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>
      )}

      {!events || events.length === 0 ? (
        <p className="text-slate-500 text-sm">まだ日程が登録されていません。</p>
      ) : (
        <form action={bulkDeleteEvents}>
          <div className="bg-white rounded-lg shadow-sm border divide-y mb-4">
            {events.map((ev) => (
              <label
                key={ev.id}
                className="flex items-center gap-3 px-4 py-3 text-sm cursor-pointer hover:bg-slate-50"
              >
                <input type="checkbox" name="eventIds" value={ev.id} className="shrink-0" />
                <span className="min-w-0 truncate">
                  <span className="font-medium">{formatEventTitle(ev)}</span>
                  {ev.subtitle && <span className="text-slate-500">・{ev.subtitle}</span>}
                  {ev.location && <span className="text-slate-500">・{ev.location}</span>}
                </span>
              </label>
            ))}
          </div>

          <ConfirmSubmitButton
            confirmText="選択した日程を削除しますか？この操作は取り消せません。"
            className="bg-red-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-red-700"
          >
            選択した日程を削除する
          </ConfirmSubmitButton>
        </form>
      )}
    </div>
  );
}
