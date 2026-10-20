import type { ReactNode } from "react";
import type { GameSession } from "@/types/game";
import { getLevel } from "@/lib/metadata";
import { getTheme } from "@/lib/themes";

/** Resolve the accent colour for a session and render children with it. */
export function LevelBadgeColor({ session, children }: { session: GameSession; children: (color: string) => ReactNode }) {
  const color = session.levelId
    ? getLevel(session.levelId).accentColor
    : session.themeId
      ? (getTheme(session.themeId)?.accentColor ?? "#753F4C")
      : session.gameId === "discover"
        ? "#BC7762"
        : "#C6A26B";
  return <>{children(color)}</>;
}
