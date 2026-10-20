/**
 * Validation and migration of stored progress. Anything read from
 * localStorage goes through `sanitizeProgress` — corrupted, outdated or
 * hand-edited data degrades gracefully instead of crashing the game.
 */
import { ACHIEVEMENTS } from "../data/achievements";
import { TWISTS } from "../data/challenges";
import type { DiscussionMarker, GameProgress, GameSession, QuestionStatus } from "../types/game";
import { STORAGE_VERSION, buildDeck, createInitialProgress, parseSessionId } from "./engine";
import { LEVEL_BY_ID, QUESTION_BY_ID, questionId } from "./metadata";
import { amountForKey, evaluateAchievements } from "./rewards";

const MARKERS: ReadonlySet<string> = new Set(["agree", "difference", "revisit"]);
const ACHIEVEMENT_IDS: ReadonlySet<string> = new Set(ACHIEVEMENTS.map((a) => a.id));
const TWIST_IDS: ReadonlySet<string> = new Set(TWISTS.map((t) => t.id));

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(v: unknown, fallback: string): string {
  return typeof v === "string" && v.length > 0 && v.length < 200 ? v : fallback;
}

function validIds(v: unknown, allowed: (id: string) => boolean): string[] {
  if (!Array.isArray(v)) return [];
  return [...new Set(v.filter((x): x is string => typeof x === "string" && allowed(x)))];
}

const isQuestion = (id: string) => QUESTION_BY_ID.has(id);

function sanitizeSession(id: string, raw: unknown, now: string): GameSession | null {
  const spec = parseSessionId(id);
  if (!spec || !isRecord(raw)) return null;
  let deck = validIds(raw.questionIds, isQuestion);
  const includeSensitive = raw.includeSensitive === true;
  // For shuffle only membership matters; ordered decks use the canonical order.
  const expected = buildDeck(spec, includeSensitive);
  const expectedSet = new Set(expected);
  const sameMembers = deck.length === expected.length && deck.every((q) => expectedSet.has(q));
  if (!sameMembers) return null; // content changed or corrupted: start that deck afresh
  if (spec.mode !== "shuffle") deck = expected; // ordered decks always use canonical order
  const inDeck = (q: string) => expectedSet.has(q);
  const completedIds = validIds(raw.completedIds, inDeck);
  const skippedIds = validIds(raw.skippedIds, inDeck).filter((q) => !completedIds.includes(q));
  const idx = Number.isInteger(raw.currentIndex) ? (raw.currentIndex as number) : 0;
  return {
    id,
    gameId: spec.gameId,
    mode: spec.mode,
    levelId: spec.levelId,
    themeId: spec.themeId,
    questionIds: deck,
    currentIndex: Math.min(Math.max(idx, 0), deck.length - 1),
    completedIds,
    skippedIds,
    twistsUsed: validIds(raw.twistsUsed, (t) => TWIST_IDS.has(t)),
    includeSensitive,
    introSeen: raw.introSeen === true,
    startedAt: str(raw.startedAt, now),
    updatedAt: str(raw.updatedAt, now),
    finishedAt: typeof raw.finishedAt === "string" ? raw.finishedAt : undefined,
  };
}

function sanitizeMarkers(v: unknown, mapId: (k: string) => string | null): Record<string, DiscussionMarker> {
  const out: Record<string, DiscussionMarker> = {};
  if (!isRecord(v)) return out;
  for (const [k, m] of Object.entries(v)) {
    const id = mapId(k);
    if (id && typeof m === "string" && MARKERS.has(m)) out[id] = m as DiscussionMarker;
  }
  return out;
}

/**
 * v1 (the first release) stored numeric Together IDs and had no rewards.
 * Bookmarks and discussion notes carry over. v1 "progress" only recorded
 * cards that were paged past, which v2 does not count as answered, so the
 * journey starts fresh rather than inventing completions and Sparks.
 */
function migrateV1(raw: Record<string, unknown>, now: string): GameProgress {
  const fromNum = (n: unknown): string | null => {
    const num = typeof n === "number" ? n : Number(n);
    return Number.isInteger(num) && num >= 1 && num <= 100 ? questionId("together", num) : null;
  };
  const bookmarks = Array.isArray(raw.bookmarkedQuestionIds)
    ? [...new Set(raw.bookmarkedQuestionIds.map(fromNum).filter((x): x is string => x !== null))]
    : [];
  const base = createInitialProgress(now);
  const p = { ...base, bookmarkedQuestionIds: bookmarks, discussionMarkers: sanitizeMarkers(raw.discussionMarkers, fromNum) };
  return evaluateAchievements(p, []);
}

export function sanitizeProgress(raw: unknown, now: string): GameProgress {
  const base = createInitialProgress(now);
  if (!isRecord(raw)) return base;
  const version = typeof raw.version === "number" ? raw.version : 0;

  if (version === 1) return migrateV1(raw, now);
  if (version !== STORAGE_VERSION) {
    // Unknown or future format: keep only what we can safely understand.
    return { ...base, bookmarkedQuestionIds: validIds(raw.bookmarkedQuestionIds, isQuestion) };
  }

  const ledger: Record<string, number> = {};
  if (isRecord(raw.ledger)) {
    for (const key of Object.keys(raw.ledger)) {
      const amount = amountForKey(key);
      if (amount !== null) ledger[key] = amount; // amounts always come from policy, never storage
    }
  }

  const questionStatus: Record<string, QuestionStatus> = {};
  if (isRecord(raw.questionStatus)) {
    for (const [id, st] of Object.entries(raw.questionStatus)) {
      if (isQuestion(id) && (st === "done" || st === "skipped")) questionStatus[id] = st;
    }
  }

  const sessions: Record<string, GameSession> = {};
  if (isRecord(raw.sessions)) {
    for (const [id, value] of Object.entries(raw.sessions)) {
      const s = sanitizeSession(id, value, now);
      if (s) sessions[id] = s;
    }
  }

  const rs = isRecord(raw.settings) ? raw.settings : {};
  const settings: GameProgress["settings"] = {
    motion: rs.motion === "reduce" ? "reduce" : "system",
    quiet: rs.quiet === true,
    sensitive: rs.sensitive === "never" ? "never" : "ask",
  };

  return {
    version: STORAGE_VERSION,
    journeyId: str(raw.journeyId, base.journeyId),
    journeyStartedAt: str(raw.journeyStartedAt, now),
    ledger,
    unlockedAchievementIds: validIds(raw.unlockedAchievementIds, (a) => ACHIEVEMENT_IDS.has(a)),
    questionStatus,
    completedLevelIds: validIds(raw.completedLevelIds, (l) => LEVEL_BY_ID.has(l)),
    bookmarkedQuestionIds: validIds(raw.bookmarkedQuestionIds, isQuestion),
    discussionMarkers: sanitizeMarkers(raw.discussionMarkers, (k) => (isQuestion(k) ? k : null)),
    sessions,
    activeSessionId: typeof raw.activeSessionId === "string" && sessions[raw.activeSessionId] ? raw.activeSessionId : null,
    settings,
  };
}
