"use client";

import { useEffect, useTransition } from "react";
import { useLoadingOverlay } from "./LoadingOverlay";
import type { Role } from "@/types/database";

type ActionResult = { error?: string };

export default function MemberActions({
  memberId,
  currentName,
  role,
  isSelf,
  renameMember,
  setMemberRole,
  deleteMember,
}: {
  memberId: string;
  currentName: string;
  role: Role;
  isSelf: boolean;
  renameMember: (id: string, name: string) => Promise<ActionResult>;
  setMemberRole: (id: string, role: Role) => Promise<void>;
  deleteMember: (id: string) => Promise<ActionResult>;
}) {
  const [isPending, startTransition] = useTransition();
  const { show, hide } = useLoadingOverlay();

  useEffect(() => {
    if (!isPending) return;
    show();
    return () => hide();
  }, [isPending, show, hide]);

  function handleRename() {
    const name = window.prompt("新しい名前を入力してください", currentName);
    if (!name || name.trim() === "" || name.trim() === currentName) return;
    startTransition(async () => {
      const result = await renameMember(memberId, name.trim());
      if (result.error) window.alert(result.error);
    });
  }

  function handleToggleRole() {
    startTransition(() => setMemberRole(memberId, role === "admin" ? "member" : "admin"));
  }

  function handleDelete() {
    if (!window.confirm(`「${currentName}」を削除しますか？この操作は取り消せません。`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteMember(memberId);
      if (result.error) window.alert(result.error);
    });
  }

  return (
    <div className="flex items-center gap-3 text-xs whitespace-nowrap">
      <button
        onClick={handleRename}
        disabled={isPending}
        className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-wait"
      >
        名前を変更
      </button>
      {!isSelf && (
        <>
          <button
            onClick={handleToggleRole}
            disabled={isPending}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-wait"
          >
            {role === "admin" ? "参加者にする" : "幹事にする"}
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-wait"
          >
            削除
          </button>
        </>
      )}
    </div>
  );
}
