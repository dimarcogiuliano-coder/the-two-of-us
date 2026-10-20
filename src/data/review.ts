/**
 * CONTENT-REVIEW REGISTER — the single place where question wording may change.
 *
 * The source datasets (questions.ts, discover.ts) are never edited: they keep
 * the original wording forever. Any change to what players see must be recorded
 * here as a revision with a source, a reason and a status, so every change is
 * traceable and nothing is silently replaced (by a person or an AI agent).
 *
 * Classification metadata below (evidence class, constructs, intimacy, stage,
 * risks, follow-ups) is a DRAFT prepared during implementation from the v4.0
 * spec. It has not been reviewed by a relationship psychologist. Every entry's
 * reviewStatus is "draft" until that review happens — do not change that
 * without a recorded reviewer.
 *
 * The register is exported to content/review-register.csv (npm run register)
 * and the tests fail if the CSV is out of date.
 */
import type { EvidenceClass, IntimacyLevel, RelationshipStage, TopicId, WordingStatus } from "../types/game";

/* ─────────────────────────── References (v4 §21) ─────────────────────────── */

export const REFERENCES = {
  aron1997:
    "Aron et al. (1997). The Experimental Generation of Interpersonal Closeness. https://doi.org/10.1177/0146167297234003",
  laurenceau1998:
    "Laurenceau et al. (1998). Intimacy as an Interpersonal Process. https://doi.org/10.1037/0022-3514.74.5.1238",
  deciRyan1987:
    "Deci & Ryan (1987). The Support of Autonomy and the Control of Behavior. https://doi.org/10.1037/0022-3514.53.6.1024",
  deci2006:
    "Deci et al. (2006). On the Benefits of Giving as Well as Receiving Autonomy Support. https://doi.org/10.1177/0146167205282148",
  gottman:
    "The Gottman Institute. Love Maps and Understanding Your Partner's Inner World. https://www.gottman.com/blog/how-to-build-love-maps/",
} as const;

/* ─────────────────────────── Wording revisions (v4 §5.2) ─────────────────────────── */

export type Revision = {
  status: Exclude<WordingStatus, "original">;
  text: string;
  source: string;
  reasoning: string;
};

const V4_APPROVED = "v4.0 spec §5.2 — approved editorial revision";
const V4_PROPOSED = "v4.0 spec §5.2 — suggested alternative, apply only after review";

export const REVISIONS: Readonly<Record<string, Revision>> = {
  "together-001": {
    status: "approved_revision",
    source: V4_APPROVED,
    text: "What's a harmless little thing that gives you an irrationally strong opinion?",
    reasoning: "Keeps the playful 'irrational opinion' without inviting judgement of other people (neutrality).",
  },
  "together-004": {
    status: "approved_revision",
    source: V4_APPROVED,
    text: "What's one of my little quirks that you've come to find funny or endearing?",
    reasoning: "Original assumed the couple lives together and could read as mocking a habit; revision is inclusive and invites affection rather than ridicule.",
  },
  "together-010": {
    status: "approved_revision",
    source: V4_APPROVED,
    text: "What's the funniest misunderstanding you've ever managed to get yourself into?",
    reasoning: "Avoids framing lying as entertainment while keeping the self-deprecating humour.",
  },
  "together-039": {
    status: "approved_revision",
    source: V4_APPROVED,
    text: "What's something small about you that you think might surprise me?",
    reasoning: "'A secret you haven't told me' can pressure disclosure; revision invites a small surprise instead (safety).",
  },
  "together-057": {
    status: "approved_revision",
    source: V4_APPROVED,
    text: "What would financial security look and feel like in your everyday life?",
    reasoning: "Asking for a sum can expose income or debt; revision explores what security means rather than a number.",
  },
  "together-067": {
    status: "approved_revision",
    source: V4_APPROVED,
    text: "How do you think partners can support each other's happiness while remaining responsible for their own wellbeing?",
    reasoning: "Original implied partners are responsible for each other's happiness; revision balances support with individual autonomy.",
  },
  "together-081": {
    status: "approved_revision",
    source: V4_APPROVED,
    text: "When do you feel especially loved by me?",
    reasoning: "Original paired feeling loved with feeling least understood, inviting criticism; revision keeps the positive, responsive half.",
  },
  "together-082": {
    status: "approved_revision",
    source: V4_APPROVED,
    text: "What's a small gesture you'd love us to make more often?",
    reasoning: "'Without you having to ask' implied an unmet request; revision frames it as a shared, positive gesture.",
  },
  "together-088": {
    status: "approved_revision",
    source: V4_APPROVED,
    text: "How do you feel about the compromises we've each made in our relationship?",
    reasoning: "Original asked whether one person had compromised too much, inviting blame; revision is mutual and open.",
  },
  "together-099": {
    status: "approved_revision",
    source: V4_APPROVED,
    text: "What's one thing we could try differently that might make everyday life better for both of us?",
    reasoning: "Original invited a list of changes to the couple; revision frames it as a shared experiment.",
  },
  "discover-004": {
    status: "approved_revision",
    source: V4_APPROVED,
    text: "What would your ideal balance of adventure, comfort and stability look like?",
    reasoning: "A forced binary on a first date; revision allows nuance and no longer near-duplicates Together #59.",
  },
  "discover-010": {
    status: "approved_revision",
    source: V4_APPROVED,
    text: "What's something that makes you leave a date smiling?",
    reasoning: "Asking what earns a second date can feel evaluative mid-date; revision keeps it warm and non-judgemental.",
  },
  "together-059": {
    status: "proposed_revision",
    source: V4_PROPOSED,
    text: "How do you balance your need for stability with your appetite for new experiences?",
    reasoning: "Flagged for a final editorial pass in v4.0. Not applied.",
  },
  "together-091": {
    status: "proposed_revision",
    source: V4_PROPOSED,
    text: "What's something about your needs that you'd like me to understand better?",
    reasoning: "Flagged for a final editorial pass in v4.0. Not applied.",
  },
  "together-092": {
    status: "proposed_revision",
    source: V4_PROPOSED,
    text: "What's something about my needs that you'd like to understand better?",
    reasoning: "Flagged for a final editorial pass in v4.0. Not applied.",
  },
};

/** Editorial notes raised during implementation, for the next review pass. */
export const NOTES: Readonly<Record<string, string>> = {
  "together-010": "Revised wording is now close to #022 ('the funniest misunderstanding you've ever had with someone'). Consider differentiating.",
  "together-022": "Close to the revised #010. Consider differentiating.",
};

/* ─────────────────────────── Sensitive controls (v4 §5.3) ─────────────────────────── */

const t = (n: number) => `together-${String(n).padStart(3, "0")}`;

/** Questions that "require additional care". */
export const SENSITIVE_IDS: ReadonlySet<string> = new Set(
  [39, 57, 61, 62, 63, 72, 80, 81, 83, 85, 87, 88, 89, 91, 92, 95, 96, 99].map(t),
);

/** Questions that need an explicit opt-in before they're shown. */
export const OPT_IN_IDS: ReadonlySet<string> = new Set([62, 63, 72, 80, 83, 89, 95, 96].map(t));

/** Plain-language names for the opt-in topics, used when asking for consent. */
export const OPT_IN_TOPIC_NAMES: Readonly<Record<string, string>> = {
  [t(62)]: "whether to have children",
  [t(63)]: "parenting values",
  [t(72)]: "how to share money",
  [t(80)]: "non-negotiables",
  [t(83)]: "an unresolved disagreement",
  [t(89)]: "your sex life",
  [t(95)]: "fears about the future",
  [t(96)]: "potential dealbreakers",
};

/* ─────────────────────────── Draft classification ─────────────────────────── */

type TopicDefaults = {
  evidence: EvidenceClass;
  constructs: string[];
  refs: string[];
  intimacy: IntimacyLevel;
  risks: string[];
};

/** Defaults by topic. A reference is attached only where it supports the construct (v4 §5.4). */
const TOPIC_DEFAULTS: Record<TopicId, TopicDefaults> = {
  "humour-quirks": { evidence: "entertainment", constructs: ["Humour", "Playful self-disclosure"], refs: [], intimacy: "light", risks: [] },
  "memories-personality": {
    evidence: "theory_informed",
    constructs: ["Partner knowledge (Love Maps)", "Reciprocal self-disclosure"],
    refs: [REFERENCES.gottman, REFERENCES.aron1997],
    intimacy: "light",
    risks: ["Could bring up a difficult memory"],
  },
  "everyday-life": { evidence: "theory_informed", constructs: ["Partner knowledge (Love Maps)", "Everyday preferences"], refs: [REFERENCES.gottman], intimacy: "light", risks: [] },
  "money-independence": {
    evidence: "theory_informed",
    constructs: ["Autonomy", "Financial values"],
    refs: [REFERENCES.deciRyan1987],
    intimacy: "personal",
    risks: ["Money can carry stress, shame or unequal circumstances"],
  },
  "ambition-future": {
    evidence: "theory_informed",
    constructs: ["Aspirations and goals", "Partner knowledge (Love Maps)"],
    refs: [REFERENCES.gottman],
    intimacy: "personal",
    risks: ["Different long-term plans can feel unsettling"],
  },
  "family-children": {
    evidence: "theory_informed",
    constructs: ["Family values", "Future expectations"],
    refs: [],
    intimacy: "personal",
    risks: ["Family history or estrangement can be painful"],
  },
  "values-responsibilities": {
    evidence: "theory_informed",
    constructs: ["Fairness and equity", "Shared values"],
    refs: [],
    intimacy: "personal",
    risks: ["Can surface disagreement about fairness"],
  },
  "love-affection": {
    evidence: "theory_informed",
    constructs: ["Perceived partner responsiveness", "Emotional support"],
    refs: [REFERENCES.laurenceau1998],
    intimacy: "personal",
    risks: ["Talking about needs can feel vulnerable"],
  },
  intimacy: {
    evidence: "theory_informed",
    constructs: ["Physical intimacy", "Perceived partner responsiveness"],
    refs: [REFERENCES.laurenceau1998],
    intimacy: "sensitive",
    risks: [],
  },
  "conflict-communication": {
    evidence: "theory_informed",
    constructs: ["Constructive communication", "Conflict style"],
    refs: [],
    intimacy: "personal",
    risks: ["Can reopen tension; no need to resolve anything tonight"],
  },
  "boundaries-dealbreakers": {
    evidence: "theory_informed",
    constructs: ["Autonomy", "Personal boundaries"],
    refs: [REFERENCES.deci2006],
    intimacy: "personal",
    risks: ["Can feel like a test or an ultimatum"],
  },
};

/** Per-question overrides on top of topic defaults. */
type Override = Partial<TopicDefaults> & { stage?: RelationshipStage };

const OVERRIDES: Record<string, Override> = {
  // Light questions that live in heavier topics (from Chapter One / Two)
  [t(19)]: { evidence: "entertainment", constructs: ["Everyday preferences"], refs: [], intimacy: "light", risks: [] },
  [t(28)]: { evidence: "entertainment", constructs: ["Imagination", "Humour"], refs: [], intimacy: "light", risks: [] },
  [t(33)]: { evidence: "entertainment", constructs: ["Imagination"], refs: [], intimacy: "light", risks: [] },
  [t(35)]: { evidence: "entertainment", constructs: ["Imagination", "Humour"], refs: [], intimacy: "light", risks: [] },
  [t(45)]: { intimacy: "light" },
  [t(48)]: { evidence: "entertainment", constructs: ["Everyday preferences"], refs: [], intimacy: "light", risks: [] },
  [t(50)]: { evidence: "entertainment", constructs: ["Shared novel activities"], refs: [], intimacy: "light", risks: [] },
  [t(1)]: { risks: ["Keep it about things, not people"] },
  [t(30)]: { intimacy: "personal" },
  [t(49)]: { intimacy: "personal" },
  // Sensitive questions (v4 §5.3) — specific risks
  [t(39)]: { risks: ["Can feel like pressure to reveal something; passing is fine"] },
  [t(57)]: { risks: ["Financial insecurity or debt can cause shame or stress"] },
  [t(61)]: { risks: ["Different views on marriage can feel like a verdict on the relationship"] },
  [t(62)]: { risks: ["Reproductive intentions, infertility or pregnancy loss can be painful"] },
  [t(63)]: { risks: ["Can touch on difficult childhood or parenting experiences"] },
  [t(72)]: { risks: ["Can expose financial dependency or power imbalances"] },
  [t(80)]: { risks: ["Naming non-negotiables can feel like an ultimatum"] },
  [t(81)]: { risks: ["Can surface feeling unloved"] },
  [t(83)]: { risks: ["Can reopen an unresolved conflict; don't push for resolution tonight"] },
  [t(85)]: { risks: ["Naming unmet needs can feel exposing"] },
  [t(87)]: { risks: ["Can surface resentment about imbalance"] },
  [t(88)]: { risks: ["Can surface resentment about compromise"] },
  [t(89)]: { risks: ["Sexual preferences are private; can create pressure or discomfort"] },
  [t(91)]: { risks: ["Can tip into criticism ('you don't understand me')"] },
  [t(92)]: { risks: ["Can feel exposing"] },
  [t(95)]: { risks: ["Can surface fear or anxiety about the relationship's future"] },
  [t(96)]: { risks: ["Can feel like a hypothetical dealbreaker test"] },
  [t(99)]: { risks: ["Can drift into a list of complaints"] },
  // Discover (first dates): keep it light
  "discover-001": { evidence: "entertainment", constructs: ["Attraction", "Playful self-disclosure"], refs: [], intimacy: "light", risks: [], stage: "first_date" },
  "discover-002": { evidence: "entertainment", constructs: ["Everyday preferences"], refs: [], intimacy: "light", risks: [], stage: "first_date" },
  "discover-003": { evidence: "theory_informed", constructs: ["Aspirations and goals", "Reciprocal self-disclosure"], refs: [REFERENCES.aron1997], intimacy: "light", risks: [], stage: "first_date" },
  "discover-004": { evidence: "theory_informed", constructs: ["Lifestyle values"], refs: [], intimacy: "light", risks: [], stage: "first_date" },
  "discover-005": { evidence: "entertainment", constructs: ["Humour", "Playful self-disclosure"], refs: [], intimacy: "light", risks: [], stage: "first_date" },
  "discover-006": { evidence: "theory_informed", constructs: ["Autonomy"], refs: [REFERENCES.deci2006], intimacy: "light", risks: ["Can feel like setting rules too early"], stage: "early_dating" },
  "discover-007": { evidence: "theory_informed", constructs: ["Aspirations and goals"], refs: [REFERENCES.aron1997], intimacy: "light", risks: [], stage: "early_dating" },
  "discover-008": { evidence: "theory_informed", constructs: ["Relationship expectations"], refs: [], intimacy: "personal", risks: ["Can feel like an interview on a first date"], stage: "early_dating" },
  "discover-009": { evidence: "theory_informed", constructs: ["Perceived partner responsiveness"], refs: [REFERENCES.laurenceau1998], intimacy: "light", risks: [], stage: "early_dating" },
  "discover-010": { evidence: "entertainment", constructs: ["Positive affect"], refs: [], intimacy: "light", risks: [], stage: "first_date" },
};

/** Non-leading follow-ups, after Laurenceau et al.'s responsiveness model (v4 §3.2 B). */
export const FOLLOW_UPS_BY_INTIMACY: Record<IntimacyLevel, string> = {
  light: "What's the story behind that?",
  personal: "What do you think matters most to your partner about this?",
  sensitive: "Is there something you'd like to understand better?",
};

export type DraftClassification = {
  evidenceClass: EvidenceClass;
  constructs: string[];
  researchReferences: string[];
  intimacyLevel: IntimacyLevel;
  relationshipStage: RelationshipStage;
  potentialRisks: string[];
};

/**
 * Draft classification for one question. Stage rule (draft): Discover is set
 * per question; Together questions that address the partner directly
 * ("we", "us", "me"…) or sit in Chapters Three–Four are "established";
 * the rest are "early_dating".
 */
export function draftClassification(id: string, order: number, topicId: TopicId, text: string): DraftClassification {
  const d = TOPIC_DEFAULTS[topicId];
  const o = OVERRIDES[id] ?? {};
  const sensitive = SENSITIVE_IDS.has(id);
  const addressesPartner = /\b(we|we'd|we've|we're|us|our|me|my|i)\b/i.test(text);
  const stage: RelationshipStage =
    o.stage ?? (id.startsWith("discover") ? "first_date" : order > 50 || addressesPartner ? "established" : "early_dating");
  return {
    evidenceClass: o.evidence ?? d.evidence,
    constructs: o.constructs ?? d.constructs,
    researchReferences: o.refs ?? d.refs,
    intimacyLevel: sensitive ? "sensitive" : (o.intimacy ?? d.intimacy),
    relationshipStage: stage,
    potentialRisks: o.risks ?? d.risks,
  };
}
