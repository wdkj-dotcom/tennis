import type { Event } from "@/types/database";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function formatEventTitle(ev: Pick<Event, "event_date" | "start_time" | "end_time">) {
  const d = new Date(`${ev.event_date}T00:00:00`);
  const dateLabel = `${d.getMonth() + 1}/${d.getDate()}(${WEEKDAYS[d.getDay()]})`;

  const start = ev.start_time ? ev.start_time.slice(0, 5) : null;
  const end = ev.end_time ? ev.end_time.slice(0, 5) : null;

  let timeLabel = "";
  if (start && end) timeLabel = ` ${start}〜${end}`;
  else if (start) timeLabel = ` ${start}〜`;
  else if (end) timeLabel = ` 〜${end}`;

  return `${dateLabel}${timeLabel}`;
}
