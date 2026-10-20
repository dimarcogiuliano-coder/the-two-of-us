/**
 * The structural catalog: question IDs and level membership only — no question
 * text, no sensitivity or psychological metadata, and no player input.
 *
 * This is the only content the rewards engine may see. It is derived from the
 * level definitions alone, so it doesn't even load the question bank.
 * Enforced by tests/boundaries.test.ts.
 */
import { LEVEL_DEFS } from "../data/levels";
import type { GameId } from "../types/game";

const id = (gameId: GameId, n: number) => `${gameId}-${String(n).padStart(3, "0")}`;

export const CATALOG = {
  levels: LEVEL_DEFS.map((l) => ({
    id: l.id,
    gameId: l.gameId,
    chapterId: l.chapterId,
    questionIds: Array.from({ length: l.to - l.from + 1 }, (_, i) => id(l.gameId, l.from + i)),
  })),
};

export const CATALOG_QUESTION_IDS: ReadonlySet<string> = new Set(CATALOG.levels.flatMap((l) => l.questionIds));
export const CATALOG_LEVEL_BY_ID = new Map(CATALOG.levels.map((l) => [l.id, l]));
