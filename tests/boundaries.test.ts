import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOG } from "../src/lib/catalog";
import { QUESTIONS } from "../src/lib/metadata";

/**
 * Architectural guardrail: gamification is kept apart from content and
 * psychology. The rewards engine may know only that a voluntary interaction
 * happened (by ID) — never question text, sensitivity/psychological metadata,
 * or anything a player said.
 */
const src = (f: string) => readFileSync(join(__dirname, "..", "src", f), "utf8");
const imports = (code: string) => [...code.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);

describe("gamification ⟂ psychology boundary", () => {
  it("rewards.ts imports only the ID catalog, achievement definitions and types", () => {
    expect(imports(src("lib/rewards.ts")).sort()).toEqual(["../data/achievements", "../types/game", "./catalog"].sort());
  });

  it("catalog.ts doesn't load the question bank or review data", () => {
    expect(imports(src("lib/catalog.ts")).sort()).toEqual(["../data/levels", "../types/game"].sort());
  });

  it("the catalog carries no question text", () => {
    const blob = JSON.stringify(CATALOG);
    for (const q of QUESTIONS) expect(blob.includes(q.text)).toBe(false);
  });

  it("no reward or achievement rule mentions sensitivity, intimacy, topics or answers", () => {
    const code = src("lib/rewards.ts") + src("data/achievements.ts");
    const stripped = code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    for (const word of ["sensitive", "intimacy", "requiresOptIn", "topic", "answerText", "evidence", "construct"]) {
      expect(stripped.toLowerCase().includes(word.toLowerCase()), word).toBe(false);
    }
  });

  it("nothing in the app stores free-text answers", () => {
    const types = src("types/game.ts");
    const progress = types.slice(types.indexOf("export type GameProgress"), types.indexOf("};", types.indexOf("export type GameProgress")));
    expect(progress).not.toMatch(/answer(Text|s)\b/i);
  });
});
