import type { Chapter } from "../types/game";

export const CHAPTERS: readonly Chapter[] = [
  { id: "together-ch1", gameId: "together", number: 1, title: "The Fun Begins", accentColor: "#8D9B82" },
  { id: "together-ch2", gameId: "together", number: 2, title: "Getting Personal", accentColor: "#BC7762" },
  { id: "together-ch3", gameId: "together", number: 3, title: "The Life We Want", accentColor: "#C6A26B" },
  { id: "together-ch4", gameId: "together", number: 4, title: "The Real Stuff", accentColor: "#753F4C" },
];

export const CHAPTER_BY_ID: Record<string, Chapter> = Object.fromEntries(CHAPTERS.map((c) => [c.id, c]));
