/**
 * The game engine: pure state transitions shared by Discover and Together.
 * No React, no storage, no clock — `now` is passed in, which keeps it testable.
 */
import { ROUND_SIZE } from "../data/levels";
import type { GameId, GameProgress, GameSession, QuestionStatus, SessionMode } from "../types/game";
import { LEVELS, LEVEL_BY_ID, QUESTION_BY_ID, getLevel, levelsFor, questionsFor } from "./metadata";
import { type SparkEvent, evaluateAchievements, grant, rewardKey } from "./rewards";
import { shuffle } from "./shuffle";
import { getTheme } from "./themes";

export const STORAGE_VERSION = 2;

export const DEFAULT_SETTINGS = { motion: "system", quiet: false, sensitive: "ask" } as const;

export type SessionSpec = { gameId: GameId; mode: SessionMode; levelId?: string; themeId?: string };

const isOptIn = (qid: string) => QUESTION_BY_ID.get(qid)?.requiresOptIn === true;

export type Celebration =
  | { kind: "round"; sessionId: string; roundNumber: number; totalRounds: number; sparks: number; messageIndex: number }
  | { kind: "level"; sessionId: string; levelId: string; completed: boolean; sparks: number }
  | { kind: "finished"; sessionId: string; sparks: number }
  | { kind: "discover-finale"; sessionId: string; sparks: number };

export type EngineEvents = {
  sparks: SparkEvent[];
  achievements: string[];
  celebration: Celebration | null;
  answered: number;
  bookmarked: number;
};

export function emptyEvents(): EngineEvents {
  return { sparks: [], achievements: [], celebration: null, answered: 0, bookmarked: 0 };
}

export function newJourneyId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `j-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createInitialProgress(now: string, journeyId = newJourneyId()): GameProgress {
  return {
    version: STORAGE_VERSION,
    journeyId,
    journeyStartedAt: now,
    ledger: {},
    unlockedAchievementIds: [],
    questionStatus: {},
    completedLevelIds: [],
    bookmarkedQuestionIds: [],
    discussionMarkers: {},
    sessions: {},
    activeSessionId: null,
    settings: { ...DEFAULT_SETTINGS },
  };
}

/* ─────────────────────────── Sessions ─────────────────────────── */

export function sessionIdFor(spec: SessionSpec): string {
  if (spec.mode === "level") return `${spec.gameId}:level:${spec.levelId}`;
  if (spec.mode === "theme") return `${spec.gameId}:theme:${spec.themeId}`;
  return `${spec.gameId}:shuffle`;
}

export function parseSessionId(id: string): SessionSpec | null {
  const [gameId, mode, ...rest] = id.split(":");
  if (gameId !== "discover" && gameId !== "together") return null;
  const value = rest.join(":");
  if (mode === "shuffle" && !value) return { gameId, mode };
  if (mode === "level" && LEVEL_BY_ID.get(value)?.gameId === gameId) return { gameId, mode, levelId: value };
  if (mode === "theme" && gameId === "together" && getTheme(value)) return { gameId, mode, themeId: value };
  return null;
}

/** Every question a session could contain, before any sensitive-topic choice. */
export function fullDeck(spec: SessionSpec): string[] {
  if (spec.mode === "level") return getLevel(spec.levelId!).questionIds.slice();
  if (spec.mode === "theme") return getTheme(spec.themeId)?.questionIds.slice() ?? [];
  return questionsFor(spec.gameId).map((q) => q.id);
}

/**
 * The deck for a session. Opt-in sensitive questions are left out unless the
 * players chose to include them (v4 §5.3). Shuffle returns a fresh order.
 */
export function buildDeck(spec: SessionSpec, includeSensitive: boolean): string[] {
  const ids = fullDeck(spec).filter((id) => includeSensitive || !isOptIn(id));
  return spec.mode === "shuffle" ? shuffle(ids) : ids;
}

/** The opt-in questions a deck would contain if players opted in. */
export function optInQuestionsIn(spec: SessionSpec): string[] {
  return fullDeck(spec).filter(isOptIn);
}

function freshSession(spec: SessionSpec, now: string, includeSensitive = false): GameSession {
  return {
    id: sessionIdFor(spec),
    gameId: spec.gameId,
    mode: spec.mode,
    levelId: spec.levelId,
    themeId: spec.themeId,
    questionIds: buildDeck(spec, includeSensitive),
    currentIndex: 0,
    completedIds: [],
    skippedIds: [],
    twistsUsed: [],
    includeSensitive,
    introSeen: false,
    startedAt: now,
    updatedAt: now,
  };
}

function putSession(p: GameProgress, s: GameSession): GameProgress {
  return { ...p, sessions: { ...p.sessions, [s.id]: s } };
}

/** Open a session (resuming it if it exists) and make it active. */
export function openSession(p: GameProgress, spec: SessionSpec, now: string): GameProgress {
  const id = sessionIdFor(spec);
  const existing = p.sessions[id];
  const next = existing ? p : putSession(p, freshSession(spec, now));
  return { ...next, activeSessionId: id };
}

/** Start a fresh pass through a session's deck (replay / reshuffle). Rewards already earned stay earned. */
export function restartSession(p: GameProgress, sessionId: string, now: string): GameProgress {
  const spec = parseSessionId(sessionId);
  if (!spec) return p;
  return { ...putSession(p, freshSession(spec, now)), activeSessionId: sessionId };
}

/**
 * Record the players' choice about opt-in sensitive questions for a deck.
 * Only possible before the pass has started, so the deck never changes under them.
 * The "never" setting always wins.
 */
export function setSensitiveChoice(p: GameProgress, sessionId: string, include: boolean, now: string): GameProgress {
  const s = p.sessions[sessionId];
  const spec = parseSessionId(sessionId);
  if (!s || !spec) return p;
  const allowed = include && p.settings.sensitive !== "never";
  const started = s.completedIds.length + s.skippedIds.length > 0;
  if (started) return p;
  return putSession(p, { ...freshSession(spec, s.startedAt, allowed), introSeen: true, updatedAt: now });
}

export function markIntroSeen(p: GameProgress, sessionId: string, now: string): GameProgress {
  const s = p.sessions[sessionId];
  if (!s || s.introSeen) return p;
  return putSession(p, { ...s, introSeen: true, updatedAt: now });
}

export function goBack(p: GameProgress, sessionId: string, now: string): GameProgress {
  const s = p.sessions[sessionId];
  if (!s || s.currentIndex === 0) return p;
  return putSession(p, { ...s, currentIndex: s.currentIndex - 1, finishedAt: undefined, updatedAt: now });
}

/** Jump to a position in the deck (e.g. to revisit a card). */
export function goTo(p: GameProgress, sessionId: string, index: number, now: string): GameProgress {
  const s = p.sessions[sessionId];
  if (!s || index < 0 || index >= s.questionIds.length) return p;
  return putSession(p, { ...s, currentIndex: index, finishedAt: undefined, updatedAt: now });
}

export function roundCount(s: GameSession): number {
  return Math.ceil(s.questionIds.length / ROUND_SIZE);
}

export function roundOf(index: number): number {
  return Math.floor(index / ROUND_SIZE);
}

function roundIds(s: GameSession, r: number): string[] {
  return s.questionIds.slice(r * ROUND_SIZE, r * ROUND_SIZE + ROUND_SIZE);
}

function roundScope(s: GameSession): string {
  return s.mode === "level" ? s.levelId! : s.id;
}

/** Sparks in the ledger that relate to a set of questions (+ extra keys). */
function sparksFor(p: GameProgress, ids: string[], extraKeys: string[] = []): number {
  const keys = new Set(extraKeys);
  for (const id of ids) {
    keys.add(rewardKey.question(id));
    keys.add(rewardKey.guess(id));
    keys.add(rewardKey.twist(id));
  }
  let total = 0;
  for (const k of keys) total += p.ledger[k] ?? 0;
  return total;
}

/**
 * A level is complete once every question in it is explored (answered or
 * skipped) — or deliberately left out as an opt-in sensitive question — and at
 * least one was answered. Declining sensitive topics never blocks progress.
 */
function isLevelComplete(p: GameProgress, levelId: string): boolean {
  const lvl = getLevel(levelId);
  const levelSession = p.sessions[sessionIdFor({ gameId: lvl.gameId, mode: "level", levelId })];
  const optedOut = p.settings.sensitive === "never" || (levelSession !== undefined && !levelSession.includeSensitive);
  const covered = lvl.questionIds.every((id) => p.questionStatus[id] !== undefined || (optedOut && isOptIn(id)));
  return covered && lvl.questionIds.some((id) => p.questionStatus[id] === "done");
}

export function levelExplored(p: GameProgress, levelId: string): number {
  return getLevel(levelId).questionIds.filter((id) => p.questionStatus[id] !== undefined).length;
}

/**
 * Answer ("We've answered") or skip the current card, then move on.
 * Returns the new progress and what happened (Sparks, badges, celebrations).
 */
export function resolveCurrent(
  p0: GameProgress,
  sessionId: string,
  outcome: QuestionStatus,
  now: string,
): { progress: GameProgress; events: EngineEvents } {
  const events = emptyEvents();
  const s0 = p0.sessions[sessionId];
  if (!s0 || s0.questionIds.length === 0) return { progress: p0, events };
  const qid = s0.questionIds[s0.currentIndex];
  const r = roundOf(s0.currentIndex);
  const roundWasComplete = roundIds(s0, r).every((id) => s0.completedIds.includes(id) || s0.skippedIds.includes(id));

  // 1. Record the outcome in this pass and in the journey.
  let completedIds = s0.completedIds;
  let skippedIds = s0.skippedIds;
  if (outcome === "done") {
    completedIds = completedIds.includes(qid) ? completedIds : [...completedIds, qid];
    skippedIds = skippedIds.filter((id) => id !== qid);
  } else if (!completedIds.includes(qid)) {
    skippedIds = skippedIds.includes(qid) ? skippedIds : [...skippedIds, qid];
  }
  const prevStatus = p0.questionStatus[qid];
  const status: QuestionStatus = prevStatus === "done" || outcome === "done" ? "done" : "skipped";
  let p: GameProgress = { ...p0, questionStatus: { ...p0.questionStatus, [qid]: status } };
  if (outcome === "done") {
    events.answered = 1;
    p = grant(p, rewardKey.question(qid), events.sparks);
  }

  // 2. Advance.
  const isLast = s0.currentIndex >= s0.questionIds.length - 1;
  const s: GameSession = {
    ...s0,
    completedIds,
    skippedIds,
    currentIndex: isLast ? s0.currentIndex : s0.currentIndex + 1,
    finishedAt: isLast ? now : undefined,
    updatedAt: now,
  };

  // 3. Round completion (all five explored in this pass).
  const rIds = roundIds(s, r);
  const roundDone = rIds.every((id) => s.completedIds.includes(id) || s.skippedIds.includes(id));
  const roundKey = rewardKey.round(roundScope(s), r + 1);
  if (roundDone && rIds.some((id) => s.completedIds.includes(id))) {
    p = grant(p, roundKey, events.sparks);
  }

  // 4. Level completion — wherever the questions were explored.
  const level = LEVEL_BY_ID.get(LEVELS.find((l) => l.questionIds.includes(qid))?.id ?? "");
  if (level && !p.completedLevelIds.includes(level.id) && isLevelComplete(p, level.id)) {
    p = { ...p, completedLevelIds: [...p.completedLevelIds, level.id] };
    p = grant(p, rewardKey.level(level.id), events.sparks);
  }

  // 5. Has the whole Discover deck now been explored? (Celebrated, not extra-rewarded.)
  const discoverExplored = questionsFor("discover").every((q) => p.questionStatus[q.id] !== undefined);

  p = putSession(p, s);
  p = evaluateAchievements(p, events.achievements);

  // 6. Celebration, if this action completed a round or the deck.
  if (isLast) {
    if (s.gameId === "discover" && discoverExplored) {
      events.celebration = { kind: "discover-finale", sessionId, sparks: sparksFor(p, s.questionIds) };
    } else if (s.mode === "level") {
      const lvl = getLevel(s.levelId!);
      const roundKeys = Array.from({ length: roundCount(s) }, (_, i) => rewardKey.round(lvl.id, i + 1));
      events.celebration = {
        kind: "level",
        sessionId,
        levelId: lvl.id,
        completed: p.completedLevelIds.includes(lvl.id),
        sparks: sparksFor(p, lvl.questionIds, [rewardKey.level(lvl.id), ...roundKeys]),
      };
    } else {
      events.celebration = { kind: "finished", sessionId, sparks: sparksFor(p, s.questionIds) };
    }
  } else if (roundDone && !roundWasComplete) {
    events.celebration = {
      kind: "round",
      sessionId,
      roundNumber: r + 1,
      totalRounds: roundCount(s),
      sparks: sparksFor(p, rIds, [roundKey]),
      messageIndex: hash(`${p.journeyId}:${roundKey}`),
    };
  }
  return { progress: p, events };
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Complete an optional challenge on a question. Never depends on whether a guess was right. */
export function completeChallenge(
  p0: GameProgress,
  sessionId: string | null,
  qid: string,
  kind: "guess" | "twist",
  now: string,
): { progress: GameProgress; events: EngineEvents } {
  const events = emptyEvents();
  let p = grant(p0, kind === "guess" ? rewardKey.guess(qid) : rewardKey.twist(qid), events.sparks);
  const s = sessionId ? p.sessions[sessionId] : undefined;
  if (s) p = putSession(p, { ...s, updatedAt: now });
  p = evaluateAchievements(p, events.achievements);
  return { progress: p, events };
}

export function recordTwist(p: GameProgress, sessionId: string, twistId: string): GameProgress {
  const s = p.sessions[sessionId];
  if (!s) return p;
  return putSession(p, { ...s, twistsUsed: [...s.twistsUsed, twistId].slice(-12) });
}

/* ─────────────────────────── Bookmarks, notes, resets ─────────────────────────── */

export function toggleBookmark(p0: GameProgress, qid: string): { progress: GameProgress; events: EngineEvents } {
  const events = emptyEvents();
  const has = p0.bookmarkedQuestionIds.includes(qid);
  let p: GameProgress = {
    ...p0,
    bookmarkedQuestionIds: has ? p0.bookmarkedQuestionIds.filter((b) => b !== qid) : [...p0.bookmarkedQuestionIds, qid],
  };
  if (!has) events.bookmarked = 1;
  p = evaluateAchievements(p, events.achievements);
  return { progress: p, events };
}

export function setMarker(p: GameProgress, qid: string, marker: GameProgress["discussionMarkers"][string] | null): GameProgress {
  const markers = { ...p.discussionMarkers };
  if (marker === null || markers[qid] === marker) delete markers[qid];
  else markers[qid] = marker;
  return { ...p, discussionMarkers: markers };
}

export function clearBookmarks(p: GameProgress): GameProgress {
  return { ...p, bookmarkedQuestionIds: [] };
}

/** Start a fresh journey: progress, Sparks and badges reset. Bookmarks, notes and settings stay. */
export function resetJourney(p: GameProgress, now: string): GameProgress {
  return {
    ...createInitialProgress(now),
    bookmarkedQuestionIds: p.bookmarkedQuestionIds,
    discussionMarkers: p.discussionMarkers,
    settings: p.settings,
  };
}

export function updateSettings(p: GameProgress, patch: Partial<GameProgress["settings"]>): GameProgress {
  return { ...p, settings: { ...p.settings, ...patch } };
}

/* ─────────────────────────── Derived views ─────────────────────────── */

export type LevelStatus = "not-started" | "in-progress" | "completed";

export function levelStatus(p: GameProgress, levelId: string): LevelStatus {
  if (p.completedLevelIds.includes(levelId)) return "completed";
  const sess = p.sessions[sessionIdFor({ gameId: getLevel(levelId).gameId, mode: "level", levelId })];
  if (levelExplored(p, levelId) > 0 || (sess && sess.currentIndex > 0)) return "in-progress";
  return "not-started";
}

/** The recommended next level: first not-completed level, in order. */
export function recommendedLevel(p: GameProgress, gameId: GameId): string | null {
  return levelsFor(gameId).find((l) => !p.completedLevelIds.includes(l.id))?.id ?? null;
}

export function isFreshCard(p: GameProgress, s: GameSession, qid: string): boolean {
  return !(p.questionStatus[qid] === "done" && !s.completedIds.includes(qid));
}
