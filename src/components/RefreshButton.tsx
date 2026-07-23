"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import SpinnerIcon from "./SpinnerIcon";
import { useLoadingOverlay } from "./LoadingOverlay";

export default function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { show, hide } = useLoadingOverlay();

  useEffect(() => {
    if (!isPending) return;
    show();
    return () => hide();
  }, [isPending, show, hide]);

  return (
    <button
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
      aria-label="更新"
      className="p-1.5 -ml-1 rounded text-slate-500 hover:text-emerald-700 hover:bg-slate-100 disabled:opacity-50"
    >
      {isPending ? (
        <SpinnerIcon size={18} />
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path
            d="M3 12a9 9 0 0115.3-6.4M21 12a9 9 0 01-15.3 6.4M3 4v5h5M21 20v-5h-5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
