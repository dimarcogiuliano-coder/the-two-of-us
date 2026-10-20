"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Eye, Undo2 } from "lucide-react";
import type { Question } from "@/types/game";
import { GUESS_COPY } from "@/data/challenges";
import { prefersReducedMotion } from "./MotionPreference";
import { QuestionCard } from "./QuestionCard";

export type GuessStage = "idle" | "predict" | "counting" | "revealed";

type Props = {
  question: Question;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  explored: boolean;
  guessed: boolean;
  quiet: boolean;
  stage: GuessStage;
  setStage: (s: GuessStage) => void;
  onComplete: () => void;
};

/**
 * Guess & Reveal — the signature mechanic (v4 §9).
 * Shared screen: both players privately predict, tap ready, a short count-in
 * builds suspense, the card flips, they answer in their own words and compare.
 * Nothing is typed or stored, and neither accuracy nor similarity affects anything.
 */
export function GuessReveal(props: Props) {
  const { question, stage, setStage } = props;
  const [ready, setReady] = useState<[boolean, boolean]>([false, false]);
  const [count, setCount] = useState(3);
  const flipped = stage === "revealed";
  const backRef = useRef<HTMLDivElement>(null);

  // Count-in: 3 · 2 · 1, then flip. Skipped entirely with reduced motion or Quiet Mode.
  useEffect(() => {
    if (stage !== "counting") return;
    const instant = props.quiet || prefersReducedMotion();
    if (instant || count <= 0) {
      const t = setTimeout(() => setStage("revealed"), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount((c) => c - 1), 480);
    return () => clearTimeout(t);
  }, [stage, count, props.quiet, setStage]);

  useEffect(() => {
    if (flipped) backRef.current?.focus();
  }, [flipped]);

  const reset = () => {
    setReady([false, false]);
    setCount(3);
    setStage("idle");
  };

  return (
    <div>
      <div className="flip-scene relative">
        <div className={`flip-inner ${flipped ? "is-flipped" : ""}`}>
          <div className="flip-front" aria-hidden={flipped} inert={flipped}>
            <QuestionCard
              className="h-full"
              question={question}
              bookmarked={props.bookmarked}
              onToggleBookmark={props.onToggleBookmark}
              explored={props.explored}
              guessed={props.guessed}
            />
          </div>
          <div className="flip-back" aria-hidden={!flipped} inert={!flipped}>
            <article
              ref={backRef}
              tabIndex={-1}
              aria-label="The reveal"
              className="relative flex h-full min-h-[20rem] flex-col overflow-hidden rounded-[30px] bg-ink p-6 text-ivory shadow-[0_6px_0_0_#0d0d0c] outline-none sm:min-h-[24rem] sm:p-9"
            >
              <svg className="pointer-events-none absolute -right-10 -top-10 size-44 opacity-20" viewBox="0 0 100 100" aria-hidden>
                <circle cx="38" cy="50" r="28" fill="none" stroke="#C6A26B" strokeWidth="4" />
                <circle cx="62" cy="50" r="28" fill="none" stroke="#C6A26B" strokeWidth="4" />
              </svg>
              <p className="eyebrow text-gold">The reveal</p>
              <p className="mt-2 line-clamp-2 font-serif text-[14px] italic leading-snug text-ivory/70">&ldquo;{question.text}&rdquo;</p>
              <p className="serif-soft mt-4 font-serif text-[1.65rem] leading-[1.12] sm:text-[2.1rem]">{GUESS_COPY.reveal}</p>
              <ol className="mt-3 space-y-1.5 text-[15px] leading-snug text-ivory/90">
                <li className="flex gap-3"><span className="font-serif italic text-gold">i.</span> Each of you answers, in your own words.</li>
                <li className="flex gap-3"><span className="font-serif italic text-gold">ii.</span> Then say what you predicted.</li>
              </ol>
              <div className="mt-auto pt-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ivory/60">If you like</p>
                <p className="mt-1 font-serif text-lg leading-snug">{GUESS_COPY.followUp}</p>
              </div>
            </article>
          </div>
        </div>

        {stage === "counting" && (
          <div className="absolute inset-0 grid place-items-center rounded-[30px] bg-ink/80" aria-live="assertive">
            <span key={count} className="countdown font-serif text-[6rem] leading-none text-gold">{count > 0 ? count : ""}</span>
            <span className="sr-only">Revealing</span>
          </div>
        )}
      </div>

      {stage === "predict" && (
        <section aria-label={GUESS_COPY.title} className="panel fade-up mt-4 p-4 sm:p-5">
          <p className="font-serif text-xl text-ink">{GUESS_COPY.title}</p>
          <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">{GUESS_COPY.prompt}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(["Player one", "Player two"] as const).map((label, i) => {
              const on = ready[i];
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setReady((r) => (i === 0 ? [!r[0], r[1]] : [r[0], !r[1]]))}
                  className={`flex min-h-14 flex-col items-center justify-center rounded-2xl border-2 px-2 text-sm font-bold transition active:translate-y-[2px] ${
                    on ? "border-sage-ink/50 bg-sage/25 text-sage-ink" : "border-ink/10 bg-ivory text-ink hover:border-ink/30"
                  }`}
                >
                  <span className="flex items-center gap-1">{on && <Check className="size-4" aria-hidden />}{label}</span>
                  <span className="text-[12px] font-semibold opacity-80">{on ? "Locked in" : "Tap when ready"}</span>
                </button>
              );
            })}
          </div>
          <button type="button" className="btn-gold mt-3 w-full" disabled={!ready[0] || !ready[1]} onClick={() => setStage("counting")}>
            Reveal
          </button>
          <button type="button" className="btn-ghost mt-1 w-full" onClick={reset}>
            Never mind
          </button>
        </section>
      )}

      {stage === "revealed" && (
        <div className="fade-up mt-4 flex flex-col gap-2">
          <button
            type="button"
            className="btn-gold w-full"
            onClick={() => {
              props.onComplete();
              reset();
            }}
          >
            <Check className="size-5" aria-hidden /> Challenge complete
          </button>
          <p className="text-center text-[12px] text-ink-soft">No points for being right. The wrong guesses are usually the best part.</p>
          <button type="button" className="btn-ghost w-full" onClick={reset}>
            <Undo2 className="size-4" aria-hidden /> Back to the question
          </button>
        </div>
      )}
    </div>
  );
}

export function GuessButton({ onClick, done }: { onClick: () => void; done: boolean }) {
  return (
    <button type="button" onClick={onClick} className="btn-gold flex-1 px-3">
      <Eye className="size-5" aria-hidden /> {done ? "Guess again" : "Guess their answer"}
    </button>
  );
}
