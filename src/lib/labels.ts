import type { GameSession } from "../types/game";
import { getLevel } from "./metadata";
import { getTheme } from "./themes";

export const GAME_NAMES = { discover: "Discover", together: "Together" } as const;

/** Human title for a session, e.g. "Level 3 · Behind the Scenes". */
export function sessionTitle(s: Pick<GameSession, "gameId" | "mode" | "levelId" | "themeId">): string {
  if (s.mode === "level" && s.levelId) {
    const l = getLevel(s.levelId);
    return `Level ${l.label} · ${l.title}`;
  }
  if (s.mode === "theme") return getTheme(s.themeId)?.label ?? "Theme";
  return s.gameId === "discover" ? "Discover · Shuffle" : "Together · Shuffle all 100";
}

/** Where "back" goes from a session. */
export function sessionHome(s: Pick<GameSession, "gameId"> | undefined): string {
  return s?.gameId === "discover" ? "/discover" : "/together";
}
