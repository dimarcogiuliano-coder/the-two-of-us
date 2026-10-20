import { CATEGORIES, CATEGORY_BY_ID } from "../data/categories";
import { CHAPTER_BY_ID } from "../data/chapters";
import { DISCOVER_QUESTION_TEXTS } from "../data/discover";
import { LEVEL_DEFS, ROUND_SIZE } from "../data/levels";
import { QUESTION_TEXTS } from "../data/questions";
import { OPT_IN_IDS, REVISIONS, SENSITIVE_IDS } from "../data/review";
import { DISCOVER_TOPICS, TOPICS, TOPIC_BY_ID, TOPIC_FALLBACKS } from "../data/topics";
import type { GameId, Level, Question, Topic, TopicId } from "../types/game";

export const TOGETHER_COUNT = 100;
export const DISCOVER_COUNT = 10;

export function questionId(gameId: GameId, order: number): string {
  return `${gameId}-${String(order).padStart(3, "0")}`;
}

function inRanges(n: number, ranges: Topic["ranges"]): boolean {
  return ranges.some(([from, to]) => n >= from && n <= to);
}

/** All topics whose human-readable ranges include this Together question number. */
export function matchingTopics(order: number): Topic[] {
  return TOPICS.filter((t) => inRanges(order, t.ranges));
}

/** Resolve exactly one primary topic for a Together question using precedence. */
export function resolveTopic(order: number): TopicId | null {
  const matches = matchingTopics(order).sort((a, b) => a.precedence - b.precedence);
  if (matches.length > 0) return matches[0].id;
  return TOPIC_FALLBACKS[order] ?? null;
}

function levelDefFor(gameId: GameId, order: number) {
  return LEVEL_DEFS.find((l) => l.gameId === gameId && order >= l.from && order <= l.to);
}

/**
 * The wording shown to players: the original, unless the content-review
 * register holds an *approved* revision. Proposed revisions are never applied.
 */
export function currentWording(id: string, original: string): string {
  const r = REVISIONS[id];
  return r && r.status === "approved_revision" ? r.text : original;
}

function safety(id: string) {
  const sensitive = SENSITIVE_IDS.has(id);
  const requiresOptIn = OPT_IN_IDS.has(id);
  return { sensitive, requiresOptIn, twistEnabled: !sensitive, guessEnabled: !requiresOptIn };
}

export function buildQuestions(
  together: readonly string[] = QUESTION_TEXTS,
  discover: readonly string[] = DISCOVER_QUESTION_TEXTS,
): Question[] {
  const out: Question[] = [];
  together.forEach((text, i) => {
    const order = i + 1;
    const category = CATEGORIES.find((c) => c.gameId === "together" && order >= c.startQuestion && order <= c.endQuestion);
    const level = levelDefFor("together", order);
    const topicId = resolveTopic(order);
    if (!category || !level || !topicId) throw new Error(`Together question ${order} is missing metadata.`);
    const id = questionId("together", order);
    out.push({
      id,
      gameId: "together",
      order,
      text: currentWording(id, text),
      categoryId: category.id,
      categoryName: category.name,
      topic: TOPIC_BY_ID[topicId].label,
      topicId,
      levelId: level.id,
      chapterId: level.chapterId,
      format: "open",
      intensity: category.intensity,
      ...safety(id),
    });
  });
  discover.forEach((text, i) => {
    const order = i + 1;
    const level = levelDefFor("discover", order);
    const topicId = DISCOVER_TOPICS[order];
    if (!level || !topicId) throw new Error(`Discover question ${order} is missing metadata.`);
    const id = questionId("discover", order);
    out.push({
      id,
      gameId: "discover",
      order,
      text: currentWording(id, text),
      categoryId: "discover",
      categoryName: CATEGORY_BY_ID.discover.name,
      topic: TOPIC_BY_ID[topicId].label,
      topicId,
      levelId: level.id,
      format: "open",
      intensity: level.number === 1 ? 1 : 2,
      ...safety(id),
    });
  });
  return out;
}

export function buildLevels(questions: readonly Question[]): Level[] {
  return LEVEL_DEFS.map(({ from, to, ...def }) => {
    void from;
    void to;
    return {
      ...def,
      questionIds: questions.filter((q) => q.levelId === def.id).sort((a, b) => a.order - b.order).map((q) => q.id),
    };
  });
}

/**
 * Integrity assertion for the content library (spec §11). Throws listing every
 * problem. Run by the test suite, which runs before every production build.
 */
export function assertDataset(questions: readonly Question[], levels: readonly Level[]): void {
  const problems: string[] = [];
  const together = questions.filter((q) => q.gameId === "together");
  const discover = questions.filter((q) => q.gameId === "discover");
  const validTopics = new Set(TOPICS.map((t) => t.label));
  const validCategories = new Set(CATEGORIES.map((c) => c.id));
  const levelIds = new Set(levels.map((l) => l.id));

  if (together.length !== TOGETHER_COUNT) problems.push(`Expected ${TOGETHER_COUNT} Together questions, found ${together.length}.`);
  if (discover.length !== DISCOVER_COUNT) problems.push(`Expected ${DISCOVER_COUNT} Discover questions, found ${discover.length}.`);

  const ids = questions.map((q) => q.id);
  if (new Set(ids).size !== ids.length) problems.push("Duplicate question IDs.");
  const texts = questions.map((q) => q.text.trim().toLowerCase());
  if (new Set(texts).size !== texts.length) problems.push("Duplicate question text.");

  together.forEach((q, i) => {
    if (q.order !== i + 1) problems.push(`Together sequence broken at position ${i + 1} (order ${q.order}).`);
  });

  for (const q of questions) {
    if (!q.text.trim()) problems.push(`${q.id} has empty text.`);
    if (!validTopics.has(q.topic)) problems.push(`${q.id} has invalid topic.`);
    if (!validCategories.has(q.categoryId)) problems.push(`${q.id} has invalid category.`);
    if (!levelIds.has(q.levelId)) problems.push(`${q.id} has unknown level ${q.levelId}.`);
    const memberOf = levels.filter((l) => l.questionIds.includes(q.id)).length;
    if (memberOf !== 1) problems.push(`${q.id} belongs to ${memberOf} levels (expected exactly 1).`);
    if (q.chapterId && !CHAPTER_BY_ID[q.chapterId]) problems.push(`${q.id} has unknown chapter.`);
  }

  const tLevels = levels.filter((l) => l.gameId === "together");
  const dLevels = levels.filter((l) => l.gameId === "discover");
  if (tLevels.length !== 10 || tLevels.some((l) => l.questionIds.length !== 10)) problems.push("Together must have ten levels of ten.");
  if (dLevels.length !== 2 || dLevels.some((l) => l.questionIds.length !== 5)) problems.push("Discover must have two levels of five.");
  if (levels.some((l) => l.questionIds.length % ROUND_SIZE !== 0)) problems.push("Every level must split into five-question rounds.");

  const counts: Record<string, number> = { fun: 50, values: 30, relationship: 20 };
  for (const [cat, n] of Object.entries(counts)) {
    const got = together.filter((q) => q.categoryId === cat).length;
    if (got !== n) problems.push(`Category ${cat} has ${got} questions, expected ${n}.`);
  }

  if (problems.length) throw new Error(`Content integrity checks failed:\n- ${problems.join("\n- ")}`);
}

export const QUESTIONS: readonly Question[] = buildQuestions();
export const LEVELS: readonly Level[] = buildLevels(QUESTIONS);

export const QUESTION_BY_ID: ReadonlyMap<string, Question> = new Map(QUESTIONS.map((q) => [q.id, q]));
export const LEVEL_BY_ID: ReadonlyMap<string, Level> = new Map(LEVELS.map((l) => [l.id, l]));

export function getQuestion(id: string): Question {
  const q = QUESTION_BY_ID.get(id);
  if (!q) throw new Error(`Unknown question ${id}`);
  return q;
}

export function getLevel(id: string): Level {
  const l = LEVEL_BY_ID.get(id);
  if (!l) throw new Error(`Unknown level ${id}`);
  return l;
}

export function questionsFor(gameId: GameId): Question[] {
  return QUESTIONS.filter((q) => q.gameId === gameId);
}

export function levelsFor(gameId: GameId): Level[] {
  return LEVELS.filter((l) => l.gameId === gameId);
}
