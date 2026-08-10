"use client";

import { useFormStatus } from "react-dom";
import { useEffect } from "react";
import type { ButtonHTMLAttributes } from "react";
import { useLoadingOverlay } from "./LoadingOverlay";

export default function SubmitButton({
  children,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
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
      {...rest}
    >
      {children}
    </button>
  );
}
