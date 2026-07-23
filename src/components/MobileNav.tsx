"use client";

import { useState } from "react";
import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";

export default function MobileNav({
  isAdmin,
  userLabel,
  signOutAction,
}: {
  isAdmin: boolean;
  userLabel: string;
  signOutAction: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="メニュー"
        aria-expanded={open}
        className={`p-2 -mr-2 rounded-md transition-colors ${
          open ? "bg-slate-200 text-slate-900" : "text-slate-600 active:bg-slate-100"
        }`}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 bg-white border-b shadow-lg">
          <nav className="flex flex-col px-4 py-2 text-sm bg-white">
            <Link
              href="/events"
              className="py-3 border-b text-slate-600"
              onClick={() => setOpen(false)}
            >
              日程一覧
            </Link>
            {isAdmin && (
              <>
                <Link
                  href="/admin/events/new"
                  className="py-3 border-b text-slate-600"
                  onClick={() => setOpen(false)}
                >
                  日程作成
                </Link>
                <Link
                  href="/admin/members"
                  className="py-3 border-b text-slate-600"
                  onClick={() => setOpen(false)}
                >
                  メンバー管理
                </Link>
                <Link
                  href="/admin/events/bulk-delete"
                  className="py-3 border-b text-slate-600"
                  onClick={() => setOpen(false)}
                >
                  日程を一括削除
                </Link>
              </>
            )}
            <span className="py-3 border-b text-slate-400">{userLabel}</span>
            <form action={signOutAction}>
              <SubmitButton
                pendingText="ログアウト中…"
                className="py-3 text-red-600 w-full text-left"
              >
                ログアウト
              </SubmitButton>
            </form>
          </nav>
        </div>
      )}
    </div>
  );
}
