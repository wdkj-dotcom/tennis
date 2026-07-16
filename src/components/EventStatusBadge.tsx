import type { EventStatus } from "@/types/database";

const LABELS: Record<EventStatus, string> = {
  tentative: "調整中",
  confirmed: "開催",
  cancelled: "中止",
};

const STYLES: Record<EventStatus, string> = {
  tentative: "bg-slate-100 text-slate-500",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function EventStatusBadge({ status }: { status: EventStatus }) {
  return (
    <span
      className={`shrink-0 text-xs font-medium px-1.5 py-0.5 rounded whitespace-nowrap ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
