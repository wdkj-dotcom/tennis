"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import SpinnerIcon from "./SpinnerIcon";

const LoadingOverlayContext = createContext<{ show: () => void; hide: () => void } | null>(null);

export function LoadingOverlayProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const show = useCallback(() => setCount((c) => c + 1), []);
  const hide = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);

  return (
    <LoadingOverlayContext.Provider value={{ show, hide }}>
      {children}
      {count > 0 && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/10">
          <div className="bg-white rounded-full p-4 shadow-lg">
            <SpinnerIcon size={32} className="text-emerald-600" />
          </div>
        </div>
      )}
    </LoadingOverlayContext.Provider>
  );
}

export function useLoadingOverlay() {
  const ctx = useContext(LoadingOverlayContext);
  if (!ctx) throw new Error("useLoadingOverlay must be used within LoadingOverlayProvider");
  return ctx;
}
