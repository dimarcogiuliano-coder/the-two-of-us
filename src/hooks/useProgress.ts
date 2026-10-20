"use client";

import { useSyncExternalStore } from "react";
import type { GameProgress } from "@/types/game";
import type { EngineEvents } from "@/lib/engine";
import { STORAGE_KEY, VISIT_KEY, clearAllLocalData, loadProgress, saveProgress } from "@/lib/storage";

/*
 * Client-side store for game progress, backed by localStorage.
 * useSyncExternalStore gives `null` during server render and hydration, so
 * there are no hydration mismatches; the real state arrives right after.
 */

let current: GameProgress | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function ensure(): GameProgress {
  if (current === null) current = loadProgress();
  return current;
}

function onStorage(e: StorageEvent) {
  if (e.key === STORAGE_KEY || e.key === null) {
    current = loadProgress();
    emit();
  }
}

function subscribe(l: () => void) {
  listeners.add(l);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function useProgress(): GameProgress | null {
  return useSyncExternalStore(subscribe, ensure, () => null);
}

export const nowIso = () => new Date().toISOString();

/** Apply a plain state change. */
export function update(fn: (p: GameProgress) => GameProgress) {
  const prev = ensure();
  const next = fn(prev);
  if (next === prev) return;
  current = next;
  saveProgress(next);
  emit();
}

/** Apply an engine action that also reports events; feeds rewards UI and tonight's stats. */
export function act(fn: (p: GameProgress) => { progress: GameProgress; events: EngineEvents }): EngineEvents {
  const { progress, events } = fn(ensure());
  if (progress !== current) {
    current = progress;
    saveProgress(progress);
    emit();
  }
  recordVisit(events);
  // Quiet Mode: no floats or toasts. Celebration screens list new badges themselves.
  if (!progress.settings.quiet) announce(events.celebration ? { ...events, achievements: [] } : events);
  return events;
}

export function wipeEverything() {
  clearAllLocalData();
  current = loadProgress();
  emit();
}

/* ─────────── Tonight's discoveries (this browser tab's visit) ─────────── */

export type VisitStats = { answered: number; sparks: number; badges: string[]; bookmarks: number };
const EMPTY_VISIT: VisitStats = { answered: 0, sparks: 0, badges: [], bookmarks: 0 };

export function readVisit(): VisitStats {
  try {
    const raw = window.sessionStorage.getItem(VISIT_KEY);
    if (!raw) return EMPTY_VISIT;
    const v = JSON.parse(raw);
    return {
      answered: Number(v.answered) || 0,
      sparks: Number(v.sparks) || 0,
      badges: Array.isArray(v.badges) ? v.badges.filter((b: unknown) => typeof b === "string") : [],
      bookmarks: Number(v.bookmarks) || 0,
    };
  } catch {
    return EMPTY_VISIT;
  }
}

function recordVisit(e: EngineEvents) {
  if (!e.answered && !e.sparks.length && !e.achievements.length && !e.bookmarked) return;
  const v = readVisit();
  const next: VisitStats = {
    answered: v.answered + e.answered,
    sparks: v.sparks + e.sparks.reduce((a, s) => a + s.amount, 0),
    badges: [...v.badges, ...e.achievements],
    bookmarks: v.bookmarks + e.bookmarked,
  };
  try {
    window.sessionStorage.setItem(VISIT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function resetVisit() {
  try {
    window.sessionStorage.removeItem(VISIT_KEY);
  } catch {
    /* ignore */
  }
}

/* ─────────── Reward feedback (Spark floats and badge toasts) ─────────── */

export type Feedback = { id: number; kind: "sparks"; amount: number } | { id: number; kind: "badge"; achievementId: string };

let feedback: Feedback[] = [];
let seq = 0;
const fbListeners = new Set<() => void>();

function setFeedback(next: Feedback[]) {
  feedback = next;
  fbListeners.forEach((l) => l());
}

function announce(e: EngineEvents) {
  const total = e.sparks.reduce((a, s) => a + s.amount, 0);
  const items: Feedback[] = [];
  if (total > 0) items.push({ id: ++seq, kind: "sparks", amount: total });
  for (const a of e.achievements) items.push({ id: ++seq, kind: "badge", achievementId: a });
  if (!items.length) return;
  setFeedback([...feedback, ...items]);
  for (const it of items) {
    setTimeout(() => setFeedback(feedback.filter((f) => f.id !== it.id)), it.kind === "badge" ? 3600 : 1400);
  }
}

export function useFeedback(): Feedback[] {
  return useSyncExternalStore(
    (l) => {
      fbListeners.add(l);
      return () => fbListeners.delete(l);
    },
    () => feedback,
    () => EMPTY_FEEDBACK,
  );
}
const EMPTY_FEEDBACK: Feedback[] = [];
