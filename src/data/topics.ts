import type { Topic, TopicId } from "../types/game";

/**
 * Topic mappings from the brief (Section 8), listed in precedence order.
 * Where ranges overlap, the topic with the lower `precedence` wins, so every
 * question ends up with exactly one primary topic.
 */
export const TOPICS: readonly Topic[] = [
  {
    id: "boundaries-dealbreakers",
    label: "Boundaries & Dealbreakers",
    precedence: 1,
    ranges: [[60, 60], [90, 90], [95, 97]],
  },
  {
    id: "conflict-communication",
    label: "Conflict & Communication",
    precedence: 2,
    ranges: [[83, 83], [86, 86], [88, 88], [99, 99]],
  },
  {
    id: "intimacy",
    label: "Intimacy",
    precedence: 3,
    ranges: [[89, 89]],
  },
  {
    id: "love-affection",
    label: "Love & Affection",
    precedence: 4,
    ranges: [[81, 82], [84, 85], [91, 92], [94, 94]],
  },
  {
    id: "family-children",
    label: "Family & Children",
    precedence: 5,
    ranges: [[61, 64]],
  },
  {
    id: "money-independence",
    label: "Money & Independence",
    precedence: 6,
    ranges: [[19, 19], [35, 35], [52, 53], [57, 58], [65, 65], [71, 72], [98, 98]],
  },
  {
    id: "values-responsibilities",
    label: "Values & Responsibilities",
    precedence: 7,
    ranges: [[56, 56], [66, 68], [74, 76], [87, 87], [93, 93]],
  },
  {
    id: "everyday-life",
    label: "Everyday Life",
    precedence: 8,
    ranges: [[11, 11], [16, 16], [23, 24], [37, 37], [41, 41], [69, 69], [79, 79]],
  },
  {
    id: "ambition-future",
    label: "Ambition & The Future",
    precedence: 9,
    ranges: [
      [28, 28], [33, 33], [45, 45], [48, 48], [50, 51], [54, 55], [59, 59],
      [70, 70], [73, 73], [77, 78], [80, 80], [100, 100],
    ],
  },
  {
    id: "memories-personality",
    label: "Memories & Personality",
    precedence: 10,
    ranges: [
      [8, 9], [14, 14], [20, 21], [25, 25], [30, 30], [32, 32], [36, 36],
      [38, 39], [43, 44], [49, 49],
    ],
  },
  {
    id: "humour-quirks",
    label: "Humour & Quirks",
    precedence: 11,
    ranges: [
      [1, 7], [10, 10], [12, 13], [15, 18], [22, 22], [26, 27], [29, 29],
      [31, 31], [34, 34], [40, 42], [46, 47],
    ],
  },
];

/**
 * Fallback for any question not covered by a range above. The brief asks for
 * "the most semantically appropriate existing topic"; this map is checked
 * before a generic category default. Currently every question is covered, so
 * this is empty — the integrity test will fail loudly if that ever changes
 * without an explicit choice here.
 */
export const TOPIC_FALLBACKS: Readonly<Record<number, TopicId>> = {};

export const TOPIC_BY_ID: Record<TopicId, Topic> = Object.fromEntries(
  TOPICS.map((t) => [t.id, t]),
) as Record<TopicId, Topic>;

/** Display order for topic navigation: roughly the order they appear in the deck. */
export const TOPIC_DISPLAY_ORDER: readonly TopicId[] = [
  "humour-quirks",
  "memories-personality",
  "everyday-life",
  "money-independence",
  "ambition-future",
  "family-children",
  "values-responsibilities",
  "love-affection",
  "intimacy",
  "conflict-communication",
  "boundaries-dealbreakers",
];

/**
 * Topics for the ten Discover questions (not covered by the original brief).
 * Assigned to the closest existing topic, mirroring similar Together questions
 * (e.g. adventurous-vs-comfortable follows Together #59; independence follows #98).
 */
export const DISCOVER_TOPICS: Readonly<Record<number, TopicId>> = {
  1: "love-affection",
  2: "everyday-life",
  3: "ambition-future",
  4: "ambition-future",
  5: "humour-quirks",
  6: "money-independence",
  7: "ambition-future",
  8: "values-responsibilities",
  9: "love-affection",
  10: "love-affection",
};
