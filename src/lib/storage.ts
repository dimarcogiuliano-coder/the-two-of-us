import type { GameProgress } from "../types/game";
import { createInitialProgress } from "./engine";
import { sanitizeProgress } from "./validation";

export const STORAGE_KEY = "the-two-of-us:state";
export const VISIT_KEY = "the-two-of-us:visit";

/** Read, migrate and validate saved progress. Never throws. */
export function loadProgress(): GameProgress {
  const now = new Date().toISOString();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress(now);
    return sanitizeProgress(JSON.parse(raw), now);
  } catch {
    return createInitialProgress(now);
  }
}

/** Persist progress. Fails silently: the game keeps working in memory. */
export function saveProgress(p: GameProgress): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}

export function clearAllLocalData() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(VISIT_KEY);
  } catch {
    /* ignore */
  }
}
