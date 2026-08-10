"use client";

import { useEffect, useRef, useTransition, type ReactNode, type TouchEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoadingOverlay } from "./LoadingOverlay";
import { shiftMonth } from "@/lib/month";

const SWIPE_THRESHOLD = 50;

export default function SwipeMonthNav({
  displayMonth,
  children,
}: {
  displayMonth: string;
  children: ReactNode;
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

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("month", shiftMonth(displayMonth, dx < 0 ? 1 : -1));
    startTransition(() => {
      router.push(`/events?${params.toString()}`);
    });
  };

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {children}
    </div>
  );
}
