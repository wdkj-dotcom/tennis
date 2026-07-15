import SubmitButton from "@/components/SubmitButton";
import type { Event } from "@/types/database";

export default function EventForm({
  action,
  defaultValues,
  error,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaultValues?: Partial<Event>;
  error?: string;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-4 bg-white rounded-lg shadow-sm border p-6">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">日付</label>
          <input
            name="event_date"
            type="date"
            required
            defaultValue={defaultValues?.event_date}
            className="w-full min-w-0 border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">開始</label>
          <input
            name="start_time"
            type="time"
            defaultValue={defaultValues?.start_time ?? ""}
            className="w-full min-w-0 border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">終了</label>
          <input
            name="end_time"
            type="time"
            defaultValue={defaultValues?.end_time ?? ""}
            className="w-full min-w-0 border rounded px-3 py-2 text-sm"
          />
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
