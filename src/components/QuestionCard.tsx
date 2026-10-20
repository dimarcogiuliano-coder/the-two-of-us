"use client";

import { Bookmark, Check, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { Question } from "@/types/game";
import { CATEGORY_BY_ID } from "@/data/categories";
import { LEVEL_BY_ID } from "@/lib/metadata";

export function questionSizeClass(text: string): string {
  if (text.length <= 60) return "text-[1.95rem] sm:text-[2.45rem]";
  if (text.length <= 90) return "text-[1.72rem] sm:text-[2.15rem]";
  return "text-[1.5rem] sm:text-[1.9rem]";
}

export function BookmarkButton({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  const [bump, setBump] = useState(0);
  return (
    <button
      type="button"
      onClick={() => {
        setBump((b) => b + 1);
        onToggle();
      }}
      aria-pressed={active}
      aria-label={active ? "Remove bookmark" : "Bookmark this question"}
      className={`icon-btn ${active ? "text-burgundy hover:text-burgundy" : ""}`}
    >
      <Bookmark key={bump} className={`size-[22px] ${bump ? "pop" : ""}`} fill={active ? "currentColor" : "none"} strokeWidth={1.8} aria-hidden />
    </button>
  );
}

type Props = {
  question: Question;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  /** Show "Explored before" for a question answered in an earlier pass. */
  explored?: boolean;
  guessed?: boolean;
  headingLevel?: "h2" | "p";
  className?: string;
};

export function QuestionCard({ question, bookmarked, onToggleBookmark, explored, guessed, headingLevel = "h2", className = "" }: Props) {
  const level = LEVEL_BY_ID.get(question.levelId);
  const accent = level?.accentColor ?? CATEGORY_BY_ID[question.categoryId].accentColor;
  const Heading = headingLevel;
  const label = question.gameId === "discover" ? `Discover · Level ${level?.label}` : `Level ${level?.number} · ${level?.title}`;
  return (
    <article
      aria-label={`Question: ${question.text}`}
      data-question-id={question.id}
      className={`relative flex min-h-[20rem] flex-col rounded-[30px] border-2 border-ink/[0.07] bg-card p-6 shadow-[0_6px_0_0_rgb(38_38_37_/_0.08)] sm:min-h-[24rem] sm:p-9 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] [contain:paint]" aria-hidden>
        <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: accent }} />
        <span className="absolute -right-20 -top-20 size-64 rounded-full opacity-[0.16]" style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 68%)` }} />
        <svg className="absolute -bottom-8 -left-6 size-36 opacity-[0.07]" viewBox="0 0 100 100">
          <circle cx="38" cy="50" r="28" fill="none" stroke="#262625" strokeWidth="5" />
          <circle cx="62" cy="50" r="28" fill="none" stroke="#262625" strokeWidth="5" />
        </svg>
      </div>

      <div className="relative flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          <span className="size-2 shrink-0 rounded-full" style={{ background: accent }} aria-hidden />
          <span className="eyebrow truncate text-ink-soft">{label}</span>
        </span>
        <span className="shrink-0 font-serif text-sm italic text-ink-soft">No. {question.order}</span>
      </div>

      <div className="relative flex flex-1 items-center py-7">
        <Heading className={`serif-soft font-serif font-[400] leading-[1.17] tracking-[-0.01em] text-ink [overflow-wrap:anywhere] [text-wrap:pretty] ${questionSizeClass(question.text)}`}>
          {question.text}
        </Heading>
      </div>

      <div className="relative flex items-end justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 pb-2.5">
          <span className="text-[13px] text-ink-soft">{question.topic}</span>
          {question.sensitive && (
            <span className="inline-flex items-center gap-1 rounded-full bg-dusty/20 px-2 py-0.5 text-[11px] font-bold text-dusty-ink">
              <ShieldCheck className="size-3" aria-hidden /> Personal · skip anytime
            </span>
          )}
          {explored && <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[11px] font-bold text-ink-soft">Explored before</span>}
          {guessed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold/25 px-2 py-0.5 text-[11px] font-bold text-gold-ink">
              <Check className="size-3" aria-hidden /> Guessed
            </span>
          )}
        </div>
        <BookmarkButton active={bookmarked} onToggle={onToggleBookmark} />
      </div>
    </article>
  );
}
