"use client";

import { useEffect } from "react";
import { useProgress } from "@/hooks/useProgress";

/** Mirrors the in-app reduced-motion setting (and Quiet Mode) onto <html data-motion>. */
export function MotionPreference() {
  const p = useProgress();
  const reduce = p?.settings.motion === "reduce" || p?.settings.quiet === true;
  useEffect(() => {
    if (reduce) document.documentElement.dataset.motion = "reduce";
    else delete document.documentElement.dataset.motion;
  }, [reduce]);
  return null;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return (
    document.documentElement.dataset.motion === "reduce" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
