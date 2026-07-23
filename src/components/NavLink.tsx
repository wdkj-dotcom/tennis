"use client";

import Link, { useLinkStatus } from "next/link";
import { useEffect } from "react";
import type { ComponentProps, ReactNode } from "react";
import SpinnerIcon from "./SpinnerIcon";
import { useLoadingOverlay } from "./LoadingOverlay";

function StatusIndicator({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  const { show, hide } = useLoadingOverlay();

  useEffect(() => {
    if (!pending) return;
    show();
    return () => hide();
  }, [pending, show, hide]);

  if (!pending) return null;
  return <SpinnerIcon className={className ?? "ml-1.5"} />;
}

export default function NavLink({
  children,
  spinnerClassName,
  ...props
}: ComponentProps<typeof Link> & { children: ReactNode; spinnerClassName?: string }) {
  return (
    <Link {...props}>
      {children}
      <StatusIndicator className={spinnerClassName} />
    </Link>
  );
}
