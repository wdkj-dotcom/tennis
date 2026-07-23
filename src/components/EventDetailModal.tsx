"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export default function EventDetailModal({ children }: { children: ReactNode }) {
  const router = useRouter();

  const close = () => router.back();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="min-h-full flex items-center justify-center py-8 px-3">
        <div className="relative w-full max-w-lg bg-slate-50 rounded-2xl shadow-2xl">
          <button
            onClick={close}
            aria-label="閉じる"
            className="absolute -top-3 -right-3 z-10 p-1.5 rounded-full bg-white shadow-md border border-slate-200 text-slate-500 hover:text-slate-800"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}
