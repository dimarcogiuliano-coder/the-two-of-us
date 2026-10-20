import type { GameId, LevelIcon } from "../types/game";

/**
 * Level definitions. Question membership is by original question number and
 * is resolved to IDs in src/lib/metadata.ts. Together levels preserve the
 * authoritative 1–100 sequence: level n holds questions 10n-9 … 10n.
 */
export type LevelDef = {
  id: string;
  gameId: GameId;
  number: number;
  label: string;
  title: string;
  description: string;
  intro: string;
  icon: LevelIcon;
  accentColor: string;
  chapterId?: string;
  /** Inclusive range of original question numbers within the game. */
  from: number;
  to: number;
};

export const LEVEL_DEFS: readonly LevelDef[] = [
  // ── Together ───────────────────────────────────────────────────────────
  { id: "together-level-01", gameId: "together", number: 1, label: "1", chapterId: "together-ch1", from: 1, to: 10,
    title: "The Silly Stuff", description: "Lighthearted preferences, humour and quirks.",
    intro: "A gentle warm-up. Nothing here is serious, which is exactly the point.", icon: "smile", accentColor: "#8D9B82" },
  { id: "together-level-02", gameId: "together", number: 2, label: "2", chapterId: "together-ch1", from: 11, to: 20,
    title: "Plot Twists", description: "Unexpected opinions, imagination and spontaneity.",
    intro: "Hidden talents, strong food opinions and the odd surprise.", icon: "dices", accentColor: "#8D9B82" },
  { id: "together-level-03", gameId: "together", number: 3, label: "3", chapterId: "together-ch1", from: 21, to: 30,
    title: "Behind the Scenes", description: "Memories, formative experiences and personality.",
    intro: "Time for the stories behind the person — the strange ones included.", icon: "clapperboard", accentColor: "#8D9B82" },
  { id: "together-level-04", gameId: "together", number: 4, label: "4", chapterId: "together-ch2", from: 31, to: 40,
    title: "Our Weird Little World", description: "Shared humour, life experiences and discoveries.",
    intro: "Inside jokes, bad dates and what happens when you two go abroad.", icon: "orbit", accentColor: "#BC7762" },
  { id: "together-level-05", gameId: "together", number: 5, label: "5", chapterId: "together-ch2", from: 41, to: 50,
    title: "Dream a Little", description: "Hopes, shared adventures and changing perspectives.",
    intro: "Daydreams, changed minds and the next adventure.", icon: "moon-star", accentColor: "#BC7762" },
  { id: "together-level-06", gameId: "together", number: 6, label: "6", chapterId: "together-ch3", from: 51, to: 60,
    title: "The Big Picture", description: "Ambition, finances, independence and stability.",
    intro: "Time to find out what your dream lives actually look like.", icon: "mountain", accentColor: "#C6A26B" },
  { id: "together-level-07", gameId: "together", number: 7, label: "7", chapterId: "together-ch3", from: 61, to: 70,
    title: "Our Kind of Life", description: "Family, parenting, responsibilities and priorities.",
    intro: "Families, futures and who actually does the dishes.", icon: "house", accentColor: "#C6A26B" },
  { id: "together-level-08", gameId: "together", number: 8, label: "8", chapterId: "together-ch3", from: 71, to: 80,
    title: "What Really Matters", description: "Values, risks, personal freedom and long-term expectations.",
    intro: "Risk, priorities and the things neither of you would trade.", icon: "compass", accentColor: "#C6A26B" },
  { id: "together-level-09", gameId: "together", number: 9, label: "9", chapterId: "together-ch4", from: 81, to: 90,
    title: "Love & Everything Else", description: "Affection, emotional needs, conflict and intimacy.",
    intro: "The good bits, the tricky bits, and how you look after each other. Skip anything, any time.", icon: "flame", accentColor: "#753F4C" },
  { id: "together-level-10", gameId: "together", number: 10, label: "10", chapterId: "together-ch4", from: 91, to: 100,
    title: "The Next Chapter", description: "Boundaries, misunderstandings and future expectations.",
    intro: "Unspoken expectations, honest fears and where you're headed. Take your time.", icon: "key", accentColor: "#753F4C" },

  // ── Discover ───────────────────────────────────────────────────────────
  { id: "discover-level-d1", gameId: "discover", number: 1, label: "D1", from: 1, to: 5,
    title: "Break the Ice", description: "Five easy openers to get past the weather.",
    intro: "Easy openers. No wrong answers, and hopefully no awkward silences.", icon: "snowflake", accentColor: "#BC7762" },
  { id: "discover-level-d2", gameId: "discover", number: 2, label: "D2", from: 6, to: 10,
    title: "A Little More Interesting", description: "Still light, but you'll learn something real.",
    intro: "Still light. Slightly more revealing. Entirely optional to blush.", icon: "wand", accentColor: "#8698A8" },
];

export const ROUND_SIZE = 5;

/** Headlines for the end of a five-question round (v3 §5.3, v4 §8.2). */
export const ROUND_MESSAGES: readonly string[] = [
  "Five questions down. Plenty to talk about.",
  "Five questions. Several questionable revelations.",
  "You two are getting interesting.",
  "Well, now you know.",
  "Another layer unlocked.",
  "Some things are better discovered together.",
];

export const DISCOVER_FINALE = "Well, that was more interesting than talking about the weather.";

/** v4 §10 — the healthy stopping message shown under every round ending. */
export const STOPPING_MESSAGE = "That's a lovely place to stop. Put the phones away and enjoy each other's company.";

/** v4 §6.3 — voluntary invitation text for sharing Discover. */
export const DISCOVER_INVITE = "I'm terrible at small talk. Want to try ten questions instead?";
