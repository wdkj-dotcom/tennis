import NavLink from "@/components/NavLink";
import type { Event } from "@/types/database";

const STATUS_DOT: Record<Event["status"], string> = {
  tentative: "bg-slate-400",
  confirmed: "bg-emerald-500",
  cancelled: "bg-red-300",
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function EventsCalendar({
  displayMonth,
  events,
  today,
}: {
  displayMonth: string; // "YYYY-MM"
  events: Event[];
  today: string; // "YYYY-MM-DD"
  includeCancelled?: string;
}) {
  const [year, month] = displayMonth.split("-").map(Number);
  const firstOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startWeekday = firstOfMonth.getDay();

  const eventsByDate = new Map<string, Event[]>();
  for (const ev of events) {
    if (!eventsByDate.has(ev.event_date)) eventsByDate.set(ev.event_date, []);
    eventsByDate.get(ev.event_date)!.push(ev);
  }

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-500 border-b">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1.5">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={i} className="border-b border-r bg-slate-50 min-h-20" />;
          }
          const dateStr = `${year}-${pad(month)}-${pad(day)}`;
          const dayEvents = eventsByDate.get(dateStr) ?? [];
          const isToday = dateStr === today;
          return (
            <div
              key={i}
              className="border-b border-r p-1 min-h-20 align-top"
            >
              <div
                className={`text-xs mb-1 inline-flex items-center justify-center w-5 h-5 rounded-full ${
                  isToday ? "bg-emerald-600 text-white font-bold" : "text-slate-500"
                }`}
              >
                {day}
              </div>
              <div className="space-y-0.5">
                {dayEvents.map((ev) => (
                  <NavLink
                    key={ev.id}
                    href={`/events/${ev.id}`}
                    className="flex items-center gap-1 text-[11px] leading-tight text-slate-700 hover:bg-slate-100 rounded px-0.5 truncate"
                  >
                    <span
                      className={`shrink-0 w-1.5 h-1.5 rounded-full ${STATUS_DOT[ev.status]}`}
                    />
                    <span className="truncate">
                      {ev.start_time ? ev.start_time.slice(0, 5) : ""}
                      {ev.subtitle ? ` ${ev.subtitle}` : ""}
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
