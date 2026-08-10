"use client";

import Link, { useLinkStatus } from "next/link";
import { useEffect } from "react";
import type { ComponentProps, ReactNode } from "react";
import { useLoadingOverlay } from "./LoadingOverlay";

function StatusIndicator() {
  const { pending } = useLinkStatus();
  const { show, hide } = useLoadingOverlay();

  useEffect(() => {
    if (!pending) return;
    show();
    return () => hide();
  }, [pending, show, hide]);

  return null;
}

export default function NavLink({
  children,
  ...props
}: ComponentProps<typeof Link> & { children: ReactNode }) {
  return (
    <Link {...props}>
      {children}
      <StatusIndicator />
    </Link>
  );
}
