"use client";

import { useRouter, useSearchParams } from "next/navigation";

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function CalendarMonthNav({ displayMonth }: { displayMonth: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goTo = (month: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", month);
    params.set("view", "calendar");
    router.push(`/events?${params.toString()}`);
  };

  const [y, m] = displayMonth.split("-").map(Number);

  return (
    <div className="flex items-center justify-between mb-2">
      <button
        onClick={() => goTo(shiftMonth(displayMonth, -1))}
        aria-label="前の月"
        className="p-1.5 rounded hover:bg-slate-100 text-slate-500"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="text-sm font-medium">
        {y}年{m}月
      </span>
      <button
        onClick={() => goTo(shiftMonth(displayMonth, 1))}
        aria-label="次の月"
        className="p-1.5 rounded hover:bg-slate-100 text-slate-500"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
