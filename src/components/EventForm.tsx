import SubmitButton from "@/components/SubmitButton";
import type { Event, Profile } from "@/types/database";

export default function EventForm({
  action,
  defaultValues,
  members,
  visibleMemberIds,
  error,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaultValues?: Partial<Event>;
  members: Profile[];
  visibleMemberIds?: string[];
  error?: string;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-4 bg-white p-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>
      )}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-500">コートの空き状況を確認してから日程を決められます</p>
        <a
          href="https://www.tennisbear.net/place/1328/info"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-sm text-emerald-600 hover:underline whitespace-nowrap"
        >
          空き状況を見る ↗
        </a>
      </div>
      <div>
        <label className="block text-sm mb-1">開催ステータス</label>
        <select
          name="status"
          defaultValue={defaultValues?.status ?? "tentative"}
          className="w-full border rounded px-3 py-2 text-sm bg-white"
        >
          <option value="tentative">調整中</option>
          <option value="confirmed">開催決定</option>
          <option value="cancelled">中止</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">日付</label>
          <input
            name="event_date"
            type="date"
            required
            defaultValue={defaultValues?.event_date}
            className="w-full min-w-0 max-w-full box-border border rounded px-2 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">開始</label>
          <input
            name="start_time"
            type="time"
            defaultValue={defaultValues?.start_time ?? ""}
            className="w-full min-w-0 max-w-full box-border border rounded px-2 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">終了</label>
          <input
            name="end_time"
            type="time"
            defaultValue={defaultValues?.end_time ?? ""}
            className="w-full min-w-0 max-w-full box-border border rounded px-2 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">公開範囲</label>
        <p className="text-xs text-slate-400 mb-2">
          誰もチェックしなければ全員に表示されます。特定のメンバーだけに見せたい場合はチェックしてください。
        </p>
        <div className="border rounded divide-y max-h-48 overflow-y-auto">
          {members.map((m) => (
            <label
              key={m.id}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50"
            >
              <input
                type="checkbox"
                name="visibleMemberIds"
                value={m.id}
                defaultChecked={visibleMemberIds?.includes(m.id) ?? false}
              />
              {m.name}
              {m.role === "admin" && (
                <span className="text-xs text-emerald-600">幹事</span>
              )}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">サブタイトル（任意）</label>
        <input
          name="subtitle"
          defaultValue={defaultValues?.subtitle ?? ""}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="例: 初心者歓迎"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">場所</label>
        <input
          name="location"
          defaultValue={defaultValues?.location ?? ""}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="例: 市営コート第2面"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">定員（任意）</label>
        <input
          name="capacity"
          type="number"
          min={1}
          defaultValue={defaultValues?.capacity ?? ""}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">備考</label>
        <textarea
          name="note"
          rows={3}
          defaultValue={defaultValues?.note ?? ""}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="持ち物や注意事項など"
        />
      </div>
      <SubmitButton
        pendingText="保存しています…"
        className="bg-emerald-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-emerald-700"
      >
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
