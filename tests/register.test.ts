import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { OPT_IN_IDS, REFERENCES, REVISIONS, SENSITIVE_IDS } from "../src/data/review";
import { QUESTIONS } from "../src/lib/metadata";
import { REGISTER, registerCsv } from "../src/lib/register";

const norm = (s: string) => s.replace(/\s+/g, " ").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").trim();
const fixture = (f: string) => norm(readFileSync(join(__dirname, "fixtures", f), "utf8"));
const CSV_PATH = join(__dirname, "..", "content", "review-register.csv");

describe("content-review register", () => {
  it("has one record per question with the required fields", () => {
    expect(REGISTER).toHaveLength(110);
    for (const r of REGISTER) {
      expect(r.originalWording).toBeTruthy();
      expect(r.currentWording).toBe(QUESTIONS.find((q) => q.id === r.questionId)?.text);
      expect(["E", "T", "S"]).toContain(r.contentClass);
      expect(r.constructs.length).toBeGreaterThan(0);
      expect(r.optionalFollowUp).toBeTruthy();
      if (r.wordingStatus === "original") expect(r.currentWording).toBe(r.originalWording);
      if (r.wordingStatus === "proposed_revision") expect(r.currentWording).toBe(r.originalWording);
      if (r.wordingStatus !== "original") expect(r.revisionReasoning).toBeTruthy();
    }
  });

  it("every approved and proposed revision is word for word from v4 §5.2", () => {
    const src = fixture("v4-section-5-2.txt").replace(/\b(\d{3}|D\d{2})\b/g, " ").replace(/\s+/g, " ");
    for (const [id, rev] of Object.entries(REVISIONS)) {
      expect(src, id).toContain(norm(rev.text));
    }
    expect(Object.values(REVISIONS).filter((r) => r.status === "approved_revision")).toHaveLength(12);
    expect(Object.entries(REVISIONS).filter(([, r]) => r.status === "proposed_revision").map(([id]) => id)).toEqual([
      "together-059", "together-091", "together-092",
    ]);
  });

  it("sensitive and opt-in sets match v4 §5.3", () => {
    const src = fixture("v4-section-5-3.txt");
    const listed = src.slice(src.indexOf("Together:"), src.indexOf("Some are")).match(/\d{3}/g)!;
    expect([...SENSITIVE_IDS].map((id) => id.slice(-3))).toEqual(listed);
    const optIn = src.slice(src.indexOf("Before questions"), src.indexOf("ensure that")).match(/\d{3}/g)!;
    expect([...OPT_IN_IDS].map((id) => id.slice(-3))).toEqual(optIn);
    for (const r of REGISTER) {
      expect(r.intimacyLevel === "sensitive").toBe(SENSITIVE_IDS.has(r.questionId));
      expect(r.requiresExplicitOptIn).toBe(OPT_IN_IDS.has(r.questionId));
    }
  });

  it("makes no validation claims and every reference is from the approved list", () => {
    const allowed = new Set<string>(Object.values(REFERENCES));
    for (const r of REGISTER) {
      expect(r.evidenceClass).not.toBe("validated");
      expect(r.reviewStatus).toBe("draft"); // nothing has had expert review yet
      for (const ref of r.researchReferences) expect(allowed.has(ref)).toBe(true);
      if (r.evidenceClass === "entertainment") expect(r.researchReferences).toEqual([]);
    }
  });

  it("content/review-register.csv is up to date (UPDATE_REGISTER=1 npm test to regenerate)", () => {
    const csv = registerCsv();
    if (process.env.UPDATE_REGISTER === "1") writeFileSync(CSV_PATH, csv);
    expect(readFileSync(CSV_PATH, "utf8")).toBe(csv);
  });
});
