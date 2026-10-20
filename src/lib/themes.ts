import { CATEGORY_BY_ID, TOGETHER_CATEGORIES } from "../data/categories";
import { TOPIC_BY_ID, TOPIC_DISPLAY_ORDER } from "../data/topics";
import type { CategoryId } from "../types/game";
import { questionsFor } from "./metadata";

/** "Choose a Theme" for Together: the original categories and topics. */
export type ThemeOption = {
  id: string; // "cat:fun" | "topic:intimacy" …
  kind: "category" | "topic";
  label: string;
  description?: string;
  accentColor: string;
  questionIds: string[];
};

const together = questionsFor("together");

const CATEGORY_THEMES: ThemeOption[] = TOGETHER_CATEGORIES.map((c) => ({
  id: `cat:${c.id}`,
  kind: "category",
  label: c.name,
  description: c.description,
  accentColor: c.accentColor,
  questionIds: together.filter((q) => q.categoryId === c.id).map((q) => q.id),
}));

const TOPIC_THEMES: ThemeOption[] = TOPIC_DISPLAY_ORDER.map((topicId) => {
  const qs = together.filter((q) => q.topicId === topicId);
  const counts = new Map<CategoryId, number>();
  for (const q of qs) counts.set(q.categoryId, (counts.get(q.categoryId) ?? 0) + 1);
  const dominant = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "fun";
  return {
    id: `topic:${topicId}`,
    kind: "topic",
    label: TOPIC_BY_ID[topicId].label,
    accentColor: CATEGORY_BY_ID[dominant].accentColor,
    questionIds: qs.map((q) => q.id),
  };
});

export const CATEGORY_THEME_OPTIONS: readonly ThemeOption[] = CATEGORY_THEMES;
export const TOPIC_THEME_OPTIONS: readonly ThemeOption[] = TOPIC_THEMES;
export const THEME_OPTIONS: readonly ThemeOption[] = [...CATEGORY_THEMES, ...TOPIC_THEMES];

export function getTheme(id: string | null | undefined): ThemeOption | undefined {
  return THEME_OPTIONS.find((t) => t.id === id);
}
