import type { Category, CategoryId } from "../types/game";

/** The original Together taxonomy (browsing/filtering metadata), plus Discover. */
export const CATEGORIES: readonly Category[] = [
  {
    id: "fun",
    gameId: "together",
    name: "Fun & Ridiculous",
    description: "Humour, quirks, memories and everyday surprises.",
    accentColor: "#8D9B82",
    startQuestion: 1,
    endQuestion: 50,
    intensity: 1,
  },
  {
    id: "values",
    gameId: "together",
    name: "Values & The Life We Want",
    description: "Money, ambitions, independence, family and the future.",
    accentColor: "#C6A26B",
    startQuestion: 51,
    endQuestion: 80,
    intensity: 2,
  },
  {
    id: "relationship",
    gameId: "together",
    name: "Love, Conflict & Uncomfortable Truths",
    description: "Affection, intimacy, expectations and difficult conversations.",
    accentColor: "#753F4C",
    startQuestion: 81,
    endQuestion: 100,
    intensity: 3,
  },
  {
    id: "discover",
    gameId: "discover",
    name: "Discover: Express",
    description: "Ten questions for first dates and new sparks.",
    accentColor: "#BC7762",
    startQuestion: 1,
    endQuestion: 10,
    intensity: 1,
  },
];

export const CATEGORY_BY_ID: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

export const TOGETHER_CATEGORIES = CATEGORIES.filter((c) => c.gameId === "together");
