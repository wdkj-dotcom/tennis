"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes } from "react";
import SpinnerIcon from "./SpinnerIcon";

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
