/**
 * Builds the content-review register (one ContentRecord per question) from the
 * source datasets, the revisions log and the draft classification.
 */
import { DISCOVER_QUESTION_TEXTS } from "../data/discover";
import { QUESTION_TEXTS } from "../data/questions";
import { FOLLOW_UPS_BY_INTIMACY, NOTES, OPT_IN_IDS, REVISIONS, draftClassification } from "../data/review";
import type { ContentRecord } from "../types/game";
import { QUESTIONS } from "./metadata";

function originalOf(id: string): string {
  const [game, num] = id.split("-");
  const n = Number(num);
  return game === "together" ? QUESTION_TEXTS[n - 1] : DISCOVER_QUESTION_TEXTS[n - 1];
}

export function buildRegister(): ContentRecord[] {
  return QUESTIONS.map((q) => {
    const original = originalOf(q.id);
    const rev = REVISIONS[q.id];
    const c = draftClassification(q.id, q.order, q.topicId, q.text);
    return {
      questionId: q.id,
      contentClass: c.intimacyLevel === "sensitive" ? "S" : c.evidenceClass === "entertainment" ? "E" : "T",
      originalWording: original,
      currentWording: q.text,
      wordingStatus: rev?.status ?? "original",
      revisedWording: rev?.text,
      revisionSource: rev?.source,
      revisionReasoning: rev?.reasoning,
      evidenceClass: c.evidenceClass,
      constructs: c.constructs,
      researchReferences: c.researchReferences,
      intimacyLevel: c.intimacyLevel,
      relationshipStage: c.relationshipStage,
      requiresExplicitOptIn: OPT_IN_IDS.has(q.id),
      optionalFollowUp: FOLLOW_UPS_BY_INTIMACY[c.intimacyLevel],
      potentialRisks: c.potentialRisks,
      reviewStatus: "draft",
      notes: NOTES[q.id],
    };
  });
}

export const REGISTER: readonly ContentRecord[] = buildRegister();
export const REGISTER_BY_ID: ReadonlyMap<string, ContentRecord> = new Map(REGISTER.map((r) => [r.questionId, r]));

const COLUMNS: (keyof ContentRecord)[] = [
  "questionId",
  "contentClass",
  "wordingStatus",
  "originalWording",
  "currentWording",
  "revisedWording",
  "revisionSource",
  "revisionReasoning",
  "evidenceClass",
  "constructs",
  "researchReferences",
  "intimacyLevel",
  "relationshipStage",
  "requiresExplicitOptIn",
  "optionalFollowUp",
  "potentialRisks",
  "reviewStatus",
  "notes",
];

function cell(v: unknown): string {
  const s = Array.isArray(v) ? v.join(" | ") : v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function registerCsv(rows: readonly ContentRecord[] = REGISTER): string {
  return [COLUMNS.join(","), ...rows.map((r) => COLUMNS.map((c) => cell(r[c])).join(","))].join("\n") + "\n";
}
