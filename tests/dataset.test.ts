import { describe, expect, it } from "vitest";
import briefQuestions from "./fixtures/brief-questions.json";
import discoverQuestions from "./fixtures/discover-questions.json";
import { ACHIEVEMENTS } from "../src/data/achievements";
import { DISCOVER_QUESTION_TEXTS } from "../src/data/discover";
import { REVISIONS } from "../src/data/review";
import { QUESTION_TEXTS } from "../src/data/questions";
import { TOPICS } from "../src/data/topics";
import { LEVELS, QUESTIONS, assertDataset, buildLevels, buildQuestions, matchingTopics } from "../src/lib/metadata";
import { ACHIEVEMENT_RULE_IDS } from "../src/lib/rewards";
import { THEME_OPTIONS } from "../src/lib/themes";

const together = QUESTIONS.filter((q) => q.gameId === "together");
const discover = QUESTIONS.filter((q) => q.gameId === "discover");

describe("content library (spec §11)", () => {
  it("passes the integrity assertion", () => {
    expect(() => assertDataset(QUESTIONS, LEVELS)).not.toThrow();
  });

  it("has 110 unique questions: 100 Together + 10 Discover", () => {
    expect(QUESTIONS).toHaveLength(110);
    expect(together).toHaveLength(100);
    expect(discover).toHaveLength(10);
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(110);
  });

  it("keeps the original 100 untouched, word for word and in order (fixture from the original brief PDF)", () => {
    expect(QUESTION_TEXTS).toEqual(briefQuestions);
    expect(together.map((q) => q.order)).toEqual(Array.from({ length: 100 }, (_, i) => i + 1));
  });

  it("keeps the original Discover deck untouched (fixture from the v3 PDF)", () => {
    expect(DISCOVER_QUESTION_TEXTS).toEqual(discoverQuestions);
  });

  it("shows original wording except where the register holds an approved revision", () => {
    const originals = [...briefQuestions, ...discoverQuestions];
    QUESTIONS.forEach((q, i) => {
      const rev = REVISIONS[q.id];
      if (rev?.status === "approved_revision") expect(q.text).toBe(rev.text);
      else expect(q.text).toBe(originals[i]);
    });
    const applied = QUESTIONS.filter((q, i) => q.text !== originals[i]).map((q) => q.id);
    expect(applied).toEqual([
      "together-001", "together-004", "together-010", "together-039", "together-057", "together-067",
      "together-081", "together-082", "together-088", "together-099", "discover-004", "discover-010",
    ]);
  });

  it("uses the suggested ID scheme with the original number kept in `order`", () => {
    expect(together[0].id).toBe("together-001");
    expect(together[99].id).toBe("together-100");
    expect(discover[0].id).toBe("discover-001");
    expect(discover[9].id).toBe("discover-010");
  });

  it("assigns levels per spec: Together n = questions 10n-9…10n, Discover D1 = 1–5, D2 = 6–10", () => {
    const tLevels = LEVELS.filter((l) => l.gameId === "together");
    expect(tLevels).toHaveLength(10);
    tLevels.forEach((l, i) => {
      expect(l.questionIds).toEqual(Array.from({ length: 10 }, (_, k) => `together-${String(i * 10 + k + 1).padStart(3, "0")}`));
    });
    const [d1, d2] = LEVELS.filter((l) => l.gameId === "discover");
    expect(d1.questionIds).toEqual(["discover-001", "discover-002", "discover-003", "discover-004", "discover-005"]);
    expect(d2.questionIds).toEqual(["discover-006", "discover-007", "discover-008", "discover-009", "discover-010"]);
    expect(LEVELS.find((l) => l.number === 6 && l.gameId === "together")?.title).toBe("The Big Picture");
  });

  it("groups the ten levels into four chapters (3/2/3/2)", () => {
    const by = (ch: string) => LEVELS.filter((l) => l.chapterId === ch).length;
    expect([by("together-ch1"), by("together-ch2"), by("together-ch3"), by("together-ch4")]).toEqual([3, 2, 3, 2]);
  });

  it("keeps the original category taxonomy separate from levels", () => {
    expect(together.filter((q) => q.categoryId === "fun")).toHaveLength(50);
    expect(together.filter((q) => q.categoryId === "values")).toHaveLength(30);
    expect(together.filter((q) => q.categoryId === "relationship")).toHaveLength(20);
    expect(QUESTIONS.find((q) => q.id === "together-051")).toMatchObject({ categoryId: "values", levelId: "together-level-06" });
  });

  it("gives every question exactly one valid topic, using precedence on overlaps", () => {
    const labels = new Set(TOPICS.map((t) => t.label));
    for (const q of QUESTIONS) expect(labels.has(q.topic)).toBe(true);
    for (const q of together) {
      const winner = matchingTopics(q.order).sort((a, b) => a.precedence - b.precedence)[0];
      expect(q.topic).toBe(winner.label);
    }
    expect(together[15].topic).toBe("Everyday Life");
    expect(together[40].topic).toBe("Everyday Life");
  });

  it("topic themes partition the Together deck", () => {
    const ids = THEME_OPTIONS.filter((t) => t.kind === "topic").flatMap((t) => t.questionIds);
    expect(ids).toHaveLength(100);
    expect(new Set(ids).size).toBe(100);
  });

  it("every achievement has a rule", () => {
    expect(ACHIEVEMENTS.map((a) => a.id).sort()).toEqual([...ACHIEVEMENT_RULE_IDS].sort());
  });

  it("the assertion catches broken content", () => {
    const short = buildQuestions(QUESTION_TEXTS.slice(0, 99));
    expect(() => assertDataset(short, buildLevels(short))).toThrow(/100 Together/);
    const dup = buildQuestions(QUESTION_TEXTS, [
      ...DISCOVER_QUESTION_TEXTS.slice(0, 4),
      QUESTION_TEXTS[1], // discover-005 has no revision, so this stays a duplicate
      ...DISCOVER_QUESTION_TEXTS.slice(5),
    ]);
    expect(() => assertDataset(dup, buildLevels(dup))).toThrow(/Duplicate question text/);
  });
});
