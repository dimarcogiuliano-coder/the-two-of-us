"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { type SessionSpec, openSession, restartSession, sessionIdFor } from "@/lib/engine";
import { nowIso, update } from "./useProgress";

/** Open (or resume) a session and go to the play screen. */
export function useStartSession() {
  const router = useRouter();
  return useCallback(
    (spec: SessionSpec, opts: { fresh?: boolean } = {}) => {
      update((p) => {
        const id = sessionIdFor(spec);
        const s = p.sessions[id];
        // A finished deck starts a fresh pass; "fresh" forces one (replay / reshuffle).
        if (s && (opts.fresh || s.finishedAt)) return restartSession(p, id, nowIso());
        return openSession(p, spec, nowIso());
      });
      router.push("/play");
    },
    [router],
  );
}
