import { describe, expect, it } from "vitest";
import type { GameProgress } from "../src/types/game";
import {
  completeChallenge,
  createInitialProgress,
  goBack,
  levelStatus,
  openSession,
  recommendedLevel,
  resetJourney,
  resolveCurrent,
  restartSession,
  sessionIdFor,
  setSensitiveChoice,
  toggleBookmark,
  updateSettings,
} from "../src/lib/engine";
import { QUESTION_BY_ID } from "../src/lib/metadata";
import { shuffle } from "../src/lib/shuffle";
import { amountForKey, totalSparks } from "../src/lib/rewards";
import { sanitizeProgress } from "../src/lib/validation";

const NOW = "2026-10-20T18:00:00.000Z";
const L1 = "together-level-01";
const L1_ID = sessionIdFor({ gameId: "together", mode: "level", levelId: L1 });

function play(p: GameProgress, sid: string, outcomes: ("done" | "skipped")[]) {
  const celebrations: string[] = [];
  const achievements: string[] = [];
  for (const o of outcomes) {
    if (p.sessions[sid].finishedAt) break;
    const r = resolveCurrent(p, sid, o, NOW);
    p = r.progress;
    if (r.events.celebration) celebrations.push(r.events.celebration.kind);
    achievements.push(...r.events.achievements);
  }
  return { p, celebrations, achievements };
}

const fresh = () => createInitialProgress(NOW, "journey-test");
const done = (n: number) => Array<"done">(n).fill("done");

describe("Sparks (spec §5.1)", () => {
  it("awards +10 per answered question, +25 per round, +50 per level", () => {
    let p = openSession(fresh(), { gameId: "together", mode: "level", levelId: L1 }, NOW);
    const first5 = play(p, L1_ID, done(5));
    expect(totalSparks(first5.p)).toBe(5 * 10 + 25);
    expect(first5.celebrations).toEqual(["round"]);
    const all = play(first5.p, L1_ID, done(5));
    p = all.p;
    expect(totalSparks(p)).toBe(10 * 10 + 2 * 25 + 50);
    expect(all.celebrations).toEqual(["level"]);
    expect(p.completedLevelIds).toEqual([L1]);
  });

  it("does not award Sparks for a skip, and skipping is not penalised for the level", () => {
    const p = openSession(fresh(), { gameId: "together", mode: "level", levelId: L1 }, NOW);
    const r = play(p, L1_ID, ["skipped", "done", "done", "done", "done", "done", "done", "done", "done", "skipped"]);
    expect(totalSparks(r.p)).toBe(8 * 10 + 2 * 25 + 50);
    expect(r.p.completedLevelIds).toContain(L1);
  });

  it("a round of only skips completes (celebrates) but earns nothing", () => {
    const p = openSession(fresh(), { gameId: "together", mode: "level", levelId: L1 }, NOW);
    const r = play(p, L1_ID, Array(5).fill("skipped"));
    expect(totalSparks(r.p)).toBe(0);
    expect(r.celebrations).toEqual(["round"]);
  });

  it("never pays twice: back + re-answer, refresh, replay and mode switches", () => {
    let p = openSession(fresh(), { gameId: "together", mode: "level", levelId: L1 }, NOW);
    p = play(p, L1_ID, done(10)).p;
    const earned = totalSparks(p);

    // back and answer again
    p = goBack(p, L1_ID, NOW);
    p = resolveCurrent(p, L1_ID, "done", NOW).progress;
    expect(totalSparks(p)).toBe(earned);

    // refresh = serialise + sanitise
    p = sanitizeProgress(JSON.parse(JSON.stringify(p)), NOW);
    expect(totalSparks(p)).toBe(earned);

    // replay the level from scratch
    p = restartSession(p, L1_ID, NOW);
    p = play(p, L1_ID, done(10)).p;
    expect(totalSparks(p)).toBe(earned);

    // same questions in shuffle mode: no question rewards again
    const sh = sessionIdFor({ gameId: "together", mode: "shuffle" });
    p = openSession(p, { gameId: "together", mode: "shuffle" }, NOW);
    const before = totalSparks(p);
    const deck = p.sessions[sh].questionIds;
    const r = resolveCurrent(p, sh, "done", NOW);
    const isOld = deck[0] <= "together-010";
    expect(totalSparks(r.progress) - before).toBe(isOld ? 0 : 10);
  });

  it("reshuffling cannot mint unlimited round bonuses", () => {
    const sh = sessionIdFor({ gameId: "discover", mode: "shuffle" });
    let p = openSession(fresh(), { gameId: "discover", mode: "shuffle" }, NOW);
    p = play(p, sh, done(10)).p;
    const once = totalSparks(p);
    for (let i = 0; i < 5; i++) {
      p = restartSession(p, sh, NOW);
      p = play(p, sh, done(10)).p;
    }
    expect(totalSparks(p)).toBe(once);
  });

  it("guess challenges pay the same regardless of outcome and only once per question", () => {
    const p = fresh();
    const a = completeChallenge(p, null, "together-001", "guess", NOW);
    expect(a.events.sparks).toEqual([{ key: "challenge:guess:together-001", amount: 10 }]);
    const b = completeChallenge(a.progress, null, "together-001", "guess", NOW);
    expect(b.events.sparks).toEqual([]);
    const c = completeChallenge(b.progress, null, "together-001", "twist", NOW);
    expect(totalSparks(c.progress)).toBe(20);
  });

  it("finishing the whole Discover deck shows the finale", () => {
    const d1 = sessionIdFor({ gameId: "discover", mode: "level", levelId: "discover-level-d1" });
    const d2 = sessionIdFor({ gameId: "discover", mode: "level", levelId: "discover-level-d2" });
    let p = openSession(fresh(), { gameId: "discover", mode: "level", levelId: "discover-level-d1" }, NOW);
    const r1 = play(p, d1, done(5));
    expect(r1.celebrations).toEqual(["level"]);
    p = openSession(r1.p, { gameId: "discover", mode: "level", levelId: "discover-level-d2" }, NOW);
    const r2 = play(p, d2, done(5));
    expect(r2.celebrations).toEqual(["discover-finale"]);
    // 10 q × 10 + 2 rounds × 25 + 2 levels × 50 (no extra bonus for "finishing")
    expect(totalSparks(r2.p)).toBe(100 + 50 + 100);
  });
});

describe("achievements (spec §5.4)", () => {
  it("unlock at the right milestones", () => {
    let p = openSession(fresh(), { gameId: "together", mode: "level", levelId: L1 }, NOW);
    let r = play(p, L1_ID, done(1));
    expect(r.achievements).toEqual(["first-spark"]);
    r = play(r.p, L1_ID, done(9));
    expect(r.achievements).toEqual(["getting-curious", "behind-the-scenes"]);

    p = r.p;
    for (let i = 1; i <= 5; i++) p = completeChallenge(p, null, `together-00${i}`, "guess", NOW).progress;
    expect(p.unlockedAchievementIds).toContain("mind-reader");

    for (let i = 1; i <= 5; i++) p = toggleBookmark(p, `together-01${i}`).progress;
    expect(p.unlockedAchievementIds).toContain("worth-revisiting");
  });

  it("Behind the Scenes, The Next Chapter and Open Book — without ever opting in to sensitive topics", () => {
    let p = fresh();
    const unlocked: string[] = [];
    for (let lvl = 1; lvl <= 10; lvl++) {
      const levelId = `together-level-${String(lvl).padStart(2, "0")}`;
      const sid = sessionIdFor({ gameId: "together", mode: "level", levelId });
      p = openSession(p, { gameId: "together", mode: "level", levelId }, NOW);
      expect(p.sessions[sid].includeSensitive).toBe(false);
      // Deep levels: answer one, skip the rest — no disclosure needed.
      const r = play(p, sid, lvl >= 9 ? ["done", ...Array(9).fill("skipped")] : done(10));
      p = r.p;
      unlocked.push(...r.achievements);
      expect(p.completedLevelIds).toContain(levelId);
      if (lvl === 1) expect(unlocked).toContain("behind-the-scenes");
      if (lvl === 5) expect(unlocked).toContain("the-next-chapter");
    }
    expect(unlocked).toContain("open-book");
    expect(recommendedLevel(p, "together")).toBeNull();
  });

  it("are never awarded for markers, agreement or bookmarks beyond the rule", () => {
    const p = toggleBookmark(fresh(), "together-089").progress;
    expect(p.unlockedAchievementIds).toEqual([]);
  });

  it("every question is worth the same, sensitive or not", () => {
    for (const id of ["together-001", "together-089", "together-083", "discover-001"]) {
      expect(amountForKey(`q:${id}`)).toBe(10);
      expect(amountForKey(`challenge:guess:${id}`)).toBe(10);
    }
  });
});

describe("sessions and shuffle", () => {
  it("shuffle is a permutation and visits each question once before finishing", () => {
    const ids = Array.from({ length: 100 }, (_, i) => i);
    const s = shuffle(ids);
    expect(new Set(s).size).toBe(100);
    const sid = sessionIdFor({ gameId: "together", mode: "shuffle" });
    let p = openSession(fresh(), { gameId: "together", mode: "shuffle" }, NOW);
    const seen: string[] = [];
    while (!p.sessions[sid].finishedAt) {
      const sess = p.sessions[sid];
      seen.push(sess.questionIds[sess.currentIndex]);
      p = resolveCurrent(p, sid, "skipped", NOW).progress;
    }
    expect(seen).toHaveLength(92); // opt-in questions excluded by default
    expect(new Set(seen).size).toBe(92);
  });

  it("shuffled order persists through save/load", () => {
    const sid = sessionIdFor({ gameId: "together", mode: "shuffle" });
    const p = openSession(fresh(), { gameId: "together", mode: "shuffle" }, NOW);
    const back = sanitizeProgress(JSON.parse(JSON.stringify(p)), NOW);
    expect(back.sessions[sid].questionIds).toEqual(p.sessions[sid].questionIds);
  });

  it("theme sessions use only that theme", () => {
    const sid = sessionIdFor({ gameId: "together", mode: "theme", themeId: "topic:family-children" });
    const p = openSession(fresh(), { gameId: "together", mode: "theme", themeId: "topic:family-children" }, NOW);
    expect(p.sessions[sid].questionIds).toEqual(["together-061", "together-064"]); // 062/063 need opt-in
  });

  it("level status reflects progress anywhere", () => {
    let p = openSession(fresh(), { gameId: "together", mode: "level", levelId: L1 }, NOW);
    expect(levelStatus(p, L1)).toBe("not-started");
    p = resolveCurrent(p, L1_ID, "done", NOW).progress;
    expect(levelStatus(p, L1)).toBe("in-progress");
  });

  it("resetJourney clears progress but keeps bookmarks", () => {
    let p = openSession(fresh(), { gameId: "together", mode: "level", levelId: L1 }, NOW);
    p = play(p, L1_ID, done(3)).p;
    p = toggleBookmark(p, "together-002").progress;
    const r = resetJourney(p, NOW);
    expect(totalSparks(r)).toBe(0);
    expect(r.sessions).toEqual({});
    expect(r.bookmarkedQuestionIds).toEqual(["together-002"]);
    expect(r.journeyId).not.toBe(p.journeyId);
  });
});

describe("storage validation and migration", () => {
  it("survives garbage", () => {
    for (const junk of [null, 1, "x", [], { version: 2, sessions: "no", ledger: [1] }, { version: 99 }]) {
      const p = sanitizeProgress(junk, NOW);
      expect(p.version).toBe(2);
      expect(totalSparks(p)).toBe(0);
    }
  });

  it("ignores forged ledger amounts and unknown keys", () => {
    const p = sanitizeProgress({ version: 2, ledger: { "q:together-001": 9999, "free:money": 500, "level:nope": 50 } }, NOW);
    expect(p.ledger).toEqual({ "q:together-001": 10 });
  });

  it("drops corrupted decks and keeps valid ones", () => {
    const p = sanitizeProgress(
      {
        version: 2,
        sessions: {
          "together:shuffle": { questionIds: ["together-001", "together-001"], currentIndex: 0 },
          [L1_ID]: { questionIds: Array.from({ length: 10 }, (_, i) => `together-${String(i + 1).padStart(3, "0")}`), currentIndex: 42, completedIds: ["together-001", "x"] },
          "nonsense:level:x": {},
        },
        activeSessionId: "together:shuffle",
      },
      NOW,
    );
    expect(Object.keys(p.sessions)).toEqual([L1_ID]);
    expect(p.sessions[L1_ID].currentIndex).toBe(9);
    expect(p.sessions[L1_ID].completedIds).toEqual(["together-001"]);
    expect(p.activeSessionId).toBeNull();
  });

  it("migrates v1 bookmarks and notes to the new IDs", () => {
    const v1 = {
      version: 1,
      activeMode: "progressive",
      sessions: { progressive: { deck: Array.from({ length: 100 }, (_, i) => i + 1), currentIndex: 3, completedQuestionIds: [1, 2, 3], finished: false } },
      bookmarkedQuestionIds: [3, 42, 42, 500],
      discussionMarkers: { 5: "agree", 6: "lol" },
    };
    const p = sanitizeProgress(v1, NOW);
    expect(p.version).toBe(2);
    expect(p.bookmarkedQuestionIds).toEqual(["together-003", "together-042"]);
    expect(p.discussionMarkers).toEqual({ "together-005": "agree" });
    expect(totalSparks(p)).toBe(0);
  });
});

describe("sensitive-topic controls (v4 §5.3)", () => {
  const OPT_IN = ["together-062", "together-063", "together-072", "together-080", "together-083", "together-089", "together-095", "together-096"];

  it("shuffle leaves opt-in questions out unless the players opt in", () => {
    const sid = sessionIdFor({ gameId: "together", mode: "shuffle" });
    let p = openSession(fresh(), { gameId: "together", mode: "shuffle" }, NOW);
    expect(p.sessions[sid].questionIds).toHaveLength(92);
    expect(p.sessions[sid].questionIds.some((id) => OPT_IN.includes(id))).toBe(false);
    p = setSensitiveChoice(p, sid, true, NOW);
    expect(p.sessions[sid].questionIds).toHaveLength(100);
  });

  it("level 9 without opt-in has 8 questions, in original order", () => {
    const levelId = "together-level-09";
    const sid = sessionIdFor({ gameId: "together", mode: "level", levelId });
    let p = openSession(fresh(), { gameId: "together", mode: "level", levelId }, NOW);
    expect(p.sessions[sid].questionIds).toEqual(["together-081", "together-082", "together-084", "together-085", "together-086", "together-087", "together-088", "together-090"]);
    p = setSensitiveChoice(p, sid, true, NOW);
    expect(p.sessions[sid].questionIds).toHaveLength(10);
  });

  it("the 'never' setting overrides any opt-in", () => {
    const sid = sessionIdFor({ gameId: "together", mode: "theme", themeId: "topic:intimacy" });
    let p = updateSettings(fresh(), { sensitive: "never" });
    p = openSession(p, { gameId: "together", mode: "theme", themeId: "topic:intimacy" }, NOW);
    p = setSensitiveChoice(p, sid, true, NOW);
    expect(p.sessions[sid].questionIds).toEqual([]);
  });

  it("the choice can't change a deck mid-pass", () => {
    const levelId = "together-level-07";
    const sid = sessionIdFor({ gameId: "together", mode: "level", levelId });
    let p = openSession(fresh(), { gameId: "together", mode: "level", levelId }, NOW);
    p = resolveCurrent(p, sid, "done", NOW).progress;
    const deck = p.sessions[sid].questionIds;
    p = setSensitiveChoice(p, sid, true, NOW);
    expect(p.sessions[sid].questionIds).toEqual(deck);
  });

  it("opt-in questions never offer Guess, sensitive ones never offer a Twist", () => {
    for (const id of OPT_IN) expect(QUESTION_BY_ID.get(id)?.guessEnabled).toBe(false);
    expect(QUESTION_BY_ID.get("together-081")?.guessEnabled).toBe(true);
    expect(QUESTION_BY_ID.get("together-081")?.twistEnabled).toBe(false);
    expect(QUESTION_BY_ID.get("together-001")?.twistEnabled).toBe(true);
  });
});
