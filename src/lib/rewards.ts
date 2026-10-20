/**
 * THE REWARDS ENGINE — gamification only.
 *
 * Boundary (by design, enforced by tests/boundaries.test.ts):
 * this module knows only that a voluntary game interaction happened — a
 * question answered or skipped, a challenge completed, a bookmark saved —
 * identified by ID. It never sees question text, sensitivity or psychological
 * metadata, and nothing a player said (the MVP doesn't record answers at all).
 * Every question is worth the same, whatever its depth. Accuracy, agreement
 * and disclosure are not inputs, so they can't be rewarded.
 *
 * Every reward has a key and is granted at most once per journey, so
 * refreshing, going back, replaying, resuming or switching modes can't mint
 * more Sparks.
 */
import { ACHIEVEMENTS } from "../data/achievements";
import type { GameProgress } from "../types/game";
import { CATALOG, CATALOG_LEVEL_BY_ID, CATALOG_QUESTION_IDS } from "./catalog";

const TOGETHER_LEVELS = CATALOG.levels.filter((l) => l.gameId === "together").length;

export const SPARKS = {
  question: 10,
  round: 25,
  level: 50,
  challenge: 10,
} as const;

/** Reward keys. Round keys are positional, so reshuffling can't create new ones without bound. */
export const rewardKey = {
  question: (qid: string) => `q:${qid}`,
  round: (scope: string, n: number) => `round:${scope}:${n}`,
  level: (levelId: string) => `level:${levelId}`,
  guess: (qid: string) => `challenge:guess:${qid}`,
  twist: (qid: string) => `challenge:twist:${qid}`,
};

/** The policy amount for a key, or null if the key isn't one we could have granted. */
export function amountForKey(key: string): number | null {
  const [kind, ...rest] = key.split(":");
  switch (kind) {
    case "q":
      return CATALOG_QUESTION_IDS.has(rest.join(":")) ? SPARKS.question : null;
    case "round": {
      const n = Number(rest[rest.length - 1]);
      return rest.length >= 2 && Number.isInteger(n) && n >= 1 && n <= 20 ? SPARKS.round : null;
    }
    case "level":
      return CATALOG_LEVEL_BY_ID.has(rest.join(":")) ? SPARKS.level : null;
    case "challenge":
      return (rest[0] === "guess" || rest[0] === "twist") && CATALOG_QUESTION_IDS.has(rest.slice(1).join(":"))
        ? SPARKS.challenge
        : null;
    default:
      return null;
  }
}

export type SparkEvent = { key: string; amount: number };

/** Grant a reward if (and only if) it hasn't been granted in this journey. */
export function grant(p: GameProgress, key: string, events: SparkEvent[]): GameProgress {
  if (key in p.ledger) return p;
  const amount = amountForKey(key);
  if (amount === null) return p;
  events.push({ key, amount });
  return { ...p, ledger: { ...p.ledger, [key]: amount } };
}

export function totalSparks(p: GameProgress): number {
  return Object.values(p.ledger).reduce((a, b) => a + b, 0);
}

/* ─────────────────────────── Achievements ─────────────────────────── */

export type ProgressStats = {
  questionsAnswered: number;
  discoverLevels: number;
  togetherLevels: number;
  guessChallenges: number;
  bookmarks: number;
};

/** Counts of recorded interactions. Nothing here can describe what was said. */
export function computeStats(p: GameProgress): ProgressStats {
  const statuses = Object.entries(p.questionStatus);
  const levels = p.completedLevelIds.map((id) => CATALOG_LEVEL_BY_ID.get(id)).filter((l) => l !== undefined);
  return {
    questionsAnswered: statuses.filter(([, s]) => s === "done").length,
    discoverLevels: levels.filter((l) => l.gameId === "discover").length,
    togetherLevels: levels.filter((l) => l.gameId === "together").length,
    guessChallenges: Object.keys(p.ledger).filter((k) => k.startsWith("challenge:guess:")).length,
    bookmarks: p.bookmarkedQuestionIds.length,
  };
}

const RULES: Record<string, (s: ProgressStats) => boolean> = {
  "first-spark": (s) => s.questionsAnswered >= 1,
  "ice-breakers": (s) => s.discoverLevels >= 1,
  "getting-curious": (s) => s.questionsAnswered >= 10,
  "behind-the-scenes": (s) => s.togetherLevels >= 1,
  "worth-revisiting": (s) => s.bookmarks >= 5,
  "mind-reader": (s) => s.guessChallenges >= 5,
  "the-next-chapter": (s) => s.togetherLevels >= 5,
  "open-book": (s) => s.togetherLevels >= TOGETHER_LEVELS,
};

/** Unlock any newly earned achievements. Achievements never re-lock. */
export function evaluateAchievements(p: GameProgress, unlocked: string[]): GameProgress {
  const stats = computeStats(p);
  const fresh = ACHIEVEMENTS.filter((a) => !p.unlockedAchievementIds.includes(a.id) && RULES[a.id]?.(stats)).map((a) => a.id);
  if (!fresh.length) return p;
  unlocked.push(...fresh);
  return { ...p, unlockedAchievementIds: [...p.unlockedAchievementIds, ...fresh] };
}

export const ACHIEVEMENT_RULE_IDS = Object.keys(RULES);
