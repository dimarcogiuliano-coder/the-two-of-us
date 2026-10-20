import type { Achievement } from "../types/game";

/**
 * Launch achievements (v4 §8.4). Triggers are evaluated in src/lib/rewards.ts
 * from recorded game interactions only. None depends on depth, sensitivity,
 * disclosure, agreement or which chapter was played. Levels count as complete
 * when every question is answered, skipped or deliberately left out as a
 * sensitive topic, so declining sensitive content never blocks a badge.
 */
export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: "first-spark", title: "First Spark", description: "Answer your first question.", icon: "spark", trigger: "questionsAnswered>=1" },
  { id: "ice-breakers", title: "Ice Breakers", description: "Complete a Discover level.", icon: "snowflake", trigger: "discoverLevels>=1" },
  { id: "getting-curious", title: "Getting Curious", description: "Answer ten questions.", icon: "footprints", trigger: "questionsAnswered>=10" },
  { id: "behind-the-scenes", title: "Behind the Scenes", description: "Complete your first Together level — any level.", icon: "door", trigger: "togetherLevels>=1" },
  { id: "worth-revisiting", title: "Worth Revisiting", description: "Save five questions for another conversation.", icon: "bookmark", trigger: "bookmarks>=5" },
  { id: "mind-reader", title: "Mind Reader?", description: "Play Guess & Reveal five times. Right or wrong doesn't matter.", icon: "eye", trigger: "guessChallenges>=5" },
  { id: "the-next-chapter", title: "The Next Chapter", description: "Complete five Together levels — in any order.", icon: "map", trigger: "togetherLevels>=5" },
  { id: "open-book", title: "Open Book", description: "Complete all ten Together levels. Skipped questions — and anything you chose to leave out — still count.", icon: "book", trigger: "togetherLevels>=10" },
];
