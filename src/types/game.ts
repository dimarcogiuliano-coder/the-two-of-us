export type GameId = "discover" | "together";

export type QuestionFormat = "open" | "would_you_rather" | "prediction" | "scenario";

/** Original Together taxonomy, plus a category for the Discover deck. */
export type CategoryId = "fun" | "values" | "relationship" | "discover";

export type Intensity = 1 | 2 | 3;

export type TopicId =
  | "humour-quirks"
  | "memories-personality"
  | "everyday-life"
  | "money-independence"
  | "ambition-future"
  | "family-children"
  | "values-responsibilities"
  | "love-affection"
  | "intimacy"
  | "conflict-communication"
  | "boundaries-dealbreakers";

export type Question = {
  /** Globally unique: "together-001" … "together-100", "discover-001" … "discover-010". */
  id: string;
  gameId: GameId;
  /** Original question number within its game (1-based). */
  order: number;
  text: string;
  categoryId: CategoryId;
  categoryName: string;
  topic: string;
  topicId: TopicId;
  levelId: string;
  chapterId?: string;
  format: QuestionFormat;
  intensity: Intensity;
  /** Guess & Reveal offered. Off for opt-in sensitive questions (no "testing" a partner on them). */
  guessEnabled: boolean;
  /** Add a Twist offered. Off for every sensitive question (v4 §8.5). */
  twistEnabled: boolean;
  /** Flagged as needing additional care (v4 §5.3). */
  sensitive: boolean;
  /** Only shown after players opt in to sensitive topics for the deck. */
  requiresOptIn: boolean;
};

export type Category = {
  id: CategoryId;
  gameId: GameId;
  name: string;
  description: string;
  accentColor: string;
  startQuestion: number;
  endQuestion: number;
  intensity: Intensity;
};

export type Topic = {
  id: TopicId;
  label: string;
  /** Lower number = higher precedence when ranges overlap. */
  precedence: number;
  /** Together question numbers, from the original brief. */
  ranges: ReadonlyArray<readonly [number, number]>;
};

export type Chapter = {
  id: string;
  gameId: GameId;
  number: number;
  title: string;
  accentColor: string;
};

export type LevelIcon =
  | "smile" | "dices" | "clapperboard" | "orbit" | "moon-star" | "mountain" | "house"
  | "compass" | "flame" | "key" | "snowflake" | "wand";

export type Level = {
  id: string;
  gameId: GameId;
  number: number;
  /** Short label used on nodes, e.g. "1" or "D1". */
  label: string;
  title: string;
  description: string;
  intro: string;
  icon: LevelIcon;
  accentColor: string;
  questionIds: string[];
  chapterId?: string;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: "spark" | "snowflake" | "eye" | "footprints" | "book" | "bookmark" | "door" | "map";
  trigger: string;
};

export type ChallengeId = "plot-twist" | "rapid-fire" | "role-reversal" | "one-more-thing";

export type Challenge = {
  id: ChallengeId;
  title: string;
  instruction: string;
};

export type DiscussionMarker = "agree" | "difference" | "revisit";

export type QuestionStatus = "done" | "skipped";

export type SessionMode = "level" | "shuffle" | "theme";

/** A playthrough of a deck: a level, a shuffled deck or a theme. */
export type GameSession = {
  id: string;
  gameId: GameId;
  mode: SessionMode;
  levelId?: string;
  themeId?: string;
  /** The ordered deck. For shuffle this is the persisted shuffled order. */
  questionIds: string[];
  currentIndex: number;
  /** Questions answered ("We've answered") in this pass through the deck. */
  completedIds: string[];
  /** Questions skipped in this pass. Skipping is always allowed and never penalised. */
  skippedIds: string[];
  /** Twists already used in this pass, so they don't repeat too often. */
  twistsUsed: string[];
  /** Whether the players opted in to the opt-in sensitive questions for this deck (v4 §5.3). */
  includeSensitive: boolean;
  introSeen: boolean;
  startedAt: string;
  updatedAt: string;
  finishedAt?: string;
};

export type Settings = {
  motion: "system" | "reduce";
  /** Quiet Mode hides Sparks, badges, confetti and non-essential animation (v4 §10). */
  quiet: boolean;
  /** "ask" offers opt-in sensitive questions per deck; "never" leaves them out everywhere. */
  sensitive: "ask" | "never";
};

export type GameProgress = {
  version: number;
  journeyId: string;
  journeyStartedAt: string;
  /** Reward ledger: reward key → Sparks granted. Sparks = sum of values. */
  ledger: Record<string, number>;
  unlockedAchievementIds: string[];
  /** Lifetime status of each question in this journey. "done" is never downgraded. */
  questionStatus: Record<string, QuestionStatus>;
  completedLevelIds: string[];
  bookmarkedQuestionIds: string[];
  discussionMarkers: Record<string, DiscussionMarker>;
  sessions: Record<string, GameSession>;
  activeSessionId: string | null;
  settings: Settings;
};

/* ─────────────────────────── Content review (v4 §4–5) ─────────────────────────── */

export type EvidenceClass = "entertainment" | "theory_informed" | "validated";
export type IntimacyLevel = "light" | "personal" | "sensitive";
export type RelationshipStage = "first_date" | "early_dating" | "established";
export type ReviewStatus = "draft" | "editorial_reviewed" | "expert_reviewed";
/** Status of the question's wording, separate from the psychological review. */
export type WordingStatus = "original" | "approved_revision" | "proposed_revision";

/** v4 §5.4 — psychological metadata for one question. */
export type PsychologicalReview = {
  questionId: string;
  evidenceClass: EvidenceClass;
  constructs: string[];
  researchReferences: string[];
  intimacyLevel: IntimacyLevel;
  relationshipStage: RelationshipStage;
  requiresExplicitOptIn: boolean;
  optionalFollowUp?: string;
  potentialRisks: string[];
  reviewStatus: ReviewStatus;
};

/** One row of the content-review register: wording history + review. */
export type ContentRecord = PsychologicalReview & {
  /** v4 §4 content class: E (entertainment), T (theory-informed), S (sensitive designation). */
  contentClass: "E" | "T" | "S";
  /** Wording in the authoritative source dataset (original brief / v3 Discover deck). */
  originalWording: string;
  /** The wording shown in the app (equals originalWording unless an approved revision exists). */
  currentWording: string;
  wordingStatus: WordingStatus;
  /** An approved revision (applied) or a proposed one (not applied). */
  revisedWording?: string;
  revisionSource?: string;
  revisionReasoning?: string;
  notes?: string;
};
