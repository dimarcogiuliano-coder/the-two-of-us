import type { Challenge } from "../types/game";

/** Spec §5.5. Mind Reader is the Guess & Reveal flow itself, so it isn't a twist. */
export const TWISTS: readonly Challenge[] = [
  { id: "plot-twist", title: "Plot Twist", instruction: "Now answer the question as you think your partner would." },
  { id: "rapid-fire", title: "Rapid Fire", instruction: "Give your first answer in five seconds. Then explain it." },
  { id: "role-reversal", title: "Role Reversal", instruction: "Answer from your partner's perspective." },
  { id: "one-more-thing", title: "One More Thing", instruction: "Ask a follow-up question you wouldn't normally ask." },
];

/** Guess & Reveal copy (spec §6). */
export const GUESS_COPY = {
  title: "How well do you know them?",
  prompt: "Before answering, each of you privately predict what the other will say. No hints, no peeking.",
  reveal: "Time to find out. What did you each choose?",
  followUp: "What surprised you about their answer? Ask each other why.",
};
