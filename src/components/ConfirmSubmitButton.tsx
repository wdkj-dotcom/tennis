"use client";

import { useFormStatus } from "react-dom";
import { useEffect } from "react";
import type { ButtonHTMLAttributes } from "react";
import SpinnerIcon from "./SpinnerIcon";
import { useLoadingOverlay } from "./LoadingOverlay";

export default function ConfirmSubmitButton({
  children,
  pendingText,
  confirmText,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingText?: string;
  confirmText: string;
}) {
  const { pending } = useFormStatus();
  const { show, hide } = useLoadingOverlay();

  useEffect(() => {
    if (!pending) return;
    show();
    return () => hide();
  }, [pending, show, hide]);

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className ?? ""} disabled:opacity-60 disabled:cursor-wait inline-flex items-center justify-center gap-1.5`}
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
      {...rest}
    >
      {pending && <SpinnerIcon />}
      {pending ? pendingText ?? "処理中…" : children}
    </button>
  );
}
