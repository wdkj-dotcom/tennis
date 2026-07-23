"use client";

import { useEffect, useRef, useTransition, type TouchEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Event } from "@/types/database";
import EventsCalendar from "./EventsCalendar";
import SpinnerIcon from "./SpinnerIcon";
import { useLoadingOverlay } from "./LoadingOverlay";

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const SWIPE_THRESHOLD = 50;

export default function CalendarView({
  displayMonth,
  events,
  today,
}: {
  displayMonth: string;
  events: Event[];
  today: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { show, hide } = useLoadingOverlay();
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!isPending) return;
    show();
    return () => hide();
  }, [isPending, show, hide]);

  const goTo = (month: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", month);
    params.set("view", "calendar");
    startTransition(() => {
      router.push(`/events?${params.toString()}`);
    });
  };

  const [y, m] = displayMonth.split("-").map(Number);

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    goTo(shiftMonth(displayMonth, dx < 0 ? 1 : -1));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => goTo(shiftMonth(displayMonth, -1))}
          disabled={isPending}
          aria-label="前の月"
          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-sm font-medium inline-flex items-center gap-1.5">
          {y}年{m}月
          {isPending && <SpinnerIcon />}
        </span>
        <button
          onClick={() => goTo(shiftMonth(displayMonth, 1))}
          disabled={isPending}
          aria-label="次の月"
          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <EventsCalendar displayMonth={displayMonth} events={events} today={today} />
      </div>
    </div>
  );
}
