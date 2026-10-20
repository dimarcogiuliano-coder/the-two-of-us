"use client";

import { useSyncExternalStore } from "react";

type ToastState = { id: number; message: string } | null;

let toast: ToastState = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

export function showToast(message: string) {
  toast = { id: (toast?.id ?? 0) + 1, message };
  listeners.forEach((l) => l());
  clearTimeout(timer);
  timer = setTimeout(() => {
    toast = null;
    listeners.forEach((l) => l());
  }, 2600);
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function Toaster() {
  const t = useSyncExternalStore(subscribe, () => toast, () => null);
  return (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-28 z-50 flex justify-center px-4"
    >
      {t && (
        <div
          key={t.id}
          className="fade-up rounded-full bg-ink px-5 py-3 text-sm font-medium text-ivory shadow-lg shadow-ink/10"
        >
          {t.message}
        </div>
      )}
    </div>
  );
}
