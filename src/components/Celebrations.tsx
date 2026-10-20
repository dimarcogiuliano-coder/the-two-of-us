"use client";

import Link from "next/link";
import { ArrowRight, Moon, Share2 } from "lucide-react";
import type { GameProgress, GameSession } from "@/types/game";
import { ACHIEVEMENTS } from "@/data/achievements";
import { DISCOVER_FINALE, DISCOVER_INVITE, ROUND_MESSAGES, STOPPING_MESSAGE } from "@/data/levels";
import { recommendedLevel } from "@/lib/engine";
import { getLevel, levelsFor } from "@/lib/metadata";
import { sessionHome } from "@/lib/labels";
import { shareApp } from "@/lib/share";
import { AchievementIcon, SparkIcon } from "./Icons";
import { Confetti } from "./Confetti";
import { LevelMedallion } from "./LevelBits";
import { showToast } from "./Toast";

function FinishButton() {
  return (
    <Link href="/recap" className="btn-primary w-full text-base">
      <Moon className="size-5" aria-hidden /> Finish for tonight
    </Link>
  );
}

function SparksLine({ sparks, quiet }: { sparks: number; quiet: boolean }) {
  if (quiet || sparks <= 0) return null;
  return (
    <p className="badge-in mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3.5 py-1.5 text-sm font-bold text-gold-ink">
      <SparkIcon className="size-4" /> {sparks} Sparks from this round
    </p>
  );
}

function NewBadges({ ids, quiet }: { ids: string[]; quiet: boolean }) {
  if (quiet || ids.length === 0) return null;
  return (
    <ul className="mt-5 flex flex-wrap justify-center gap-2" aria-label="Badges unlocked">
      {ids.map((id) => {
        const a = ACHIEVEMENTS.find((x) => x.id === id);
        if (!a) return null;
        return (
          <li key={id} className="badge-in flex items-center gap-2 rounded-2xl border-2 border-gold/40 bg-card px-3 py-2">
            <AchievementIcon icon={a.icon} className="size-5 text-gold-ink" />
            <span className="text-sm font-bold text-ink">{a.title}</span>
          </li>
        );
      })}
    </ul>
  );
}

function StopNote() {
  return <p className="mx-auto mt-5 max-w-sm font-serif text-lg italic leading-snug text-ink-soft">{STOPPING_MESSAGE}</p>;
}

/** End of a five-question round (v4 §8.2): stopping is the primary action. */
export function RoundComplete({
  round,
  total,
  sparks,
  messageIndex,
  badges,
  quiet,
  onAnother,
}: {
  round: number;
  total: number;
  sparks: number;
  messageIndex: number;
  badges: string[];
  quiet: boolean;
  onAnother: () => void;
}) {
  return (
    <section className="fade-up flex flex-col items-center pt-10 text-center" aria-labelledby="round-done">
      <p className="eyebrow text-burgundy">
        Round {round} of {total} complete
      </p>
      <h1 id="round-done" className="serif-soft mt-3 font-serif text-[2.3rem] leading-[1.08] text-ink">
        {ROUND_MESSAGES[messageIndex % ROUND_MESSAGES.length]}
      </h1>
      <SparksLine sparks={sparks} quiet={quiet} />
      <NewBadges ids={badges} quiet={quiet} />
      <StopNote />
      <div className="mt-8 flex w-full max-w-sm flex-col gap-2">
        <FinishButton />
        <button type="button" className="btn-ghost" onClick={onAnother}>
          Another round
        </button>
      </div>
    </section>
  );
}

/** Level complete (v3 §5.3 / v4 Screen 6): summary, optional badges, suggested next level, natural exit. */
export function LevelComplete({
  p,
  s,
  badges,
  sparks,
  quiet,
  onPlayLevel,
  onReplay,
}: {
  p: GameProgress;
  s: GameSession;
  badges: string[];
  sparks: number;
  quiet: boolean;
  onPlayLevel: (levelId: string) => void;
  onReplay: () => void;
}) {
  const level = getLevel(s.levelId!);
  const done = p.completedLevelIds.includes(level.id);
  const next = recommendedLevel(p, level.gameId);
  const nextLevel = next ? getLevel(next) : null;
  const total = levelsFor(level.gameId).length;
  const completedCount = levelsFor(level.gameId).filter((l) => p.completedLevelIds.includes(l.id)).length;
  return (
    <section className="fade-up flex flex-col items-center pt-8 text-center" aria-labelledby="level-done">
      {!quiet && <Confetti seed={level.number} />}
      <span className={quiet ? "" : "badge-in"}>
        <LevelMedallion level={level} status={done ? "completed" : "in-progress"} explored={10} size={96} />
      </span>
      <p className="eyebrow mt-5 text-burgundy">{level.gameId === "discover" ? `Discover · Level ${level.label}` : `Level ${level.number}`}</p>
      <h1 id="level-done" className="serif-soft mt-1 font-serif text-[2.4rem] leading-[1.05] text-ink">
        {level.title}, done.
      </h1>
      <dl className="mt-6 grid w-full grid-cols-3 gap-2 text-left">
        <Stat label="Answered" value={s.completedIds.length} />
        <Stat label="Skipped" value={s.skippedIds.length} />
        <Stat label="Saved" value={p.bookmarkedQuestionIds.length} />
      </dl>
      <p className="mt-3 text-sm text-ink-soft">
        {completedCount} of {total} {level.gameId === "discover" ? "Discover" : "Together"} levels explored
      </p>
      {!quiet && sparks > 0 && (
        <p className="badge-in mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3.5 py-1.5 text-sm font-bold text-gold-ink">
          <SparkIcon className="size-4" /> {sparks} Sparks from this level
        </p>
      )}
      <NewBadges ids={badges} quiet={quiet} />
      <StopNote />
      <div className="mt-7 flex w-full max-w-sm flex-col gap-2">
        <FinishButton />
        {nextLevel && nextLevel.id !== level.id && (
          <button type="button" className="btn-secondary" onClick={() => onPlayLevel(nextLevel.id)}>
            Next time: Level {nextLevel.label} · {nextLevel.title} <ArrowRight className="size-4" aria-hidden />
          </button>
        )}
        <Link href={sessionHome(s)} className="btn-ghost">
          Back to the {level.gameId === "discover" ? "levels" : "map"}
        </Link>
        <button type="button" className="btn-ghost" onClick={onReplay}>
          Replay this level
        </button>
      </div>
    </section>
  );
}

/** End of a shuffled or themed deck. */
export function DeckFinished({ s, onRestart }: { s: GameSession; onRestart: () => void }) {
  return (
    <section className="fade-up flex flex-col items-center pt-10 text-center" aria-labelledby="deck-done">
      <p className="eyebrow text-burgundy">The end of the deck</p>
      <h1 id="deck-done" className="serif-soft mt-3 font-serif text-[2.3rem] leading-[1.08] text-ink">
        You&rsquo;ve reached the end of the deck.
      </h1>
      <p className="mt-2 font-serif text-xl italic text-ink-soft">Hopefully not the end of the conversation.</p>
      <StopNote />
      <div className="mt-8 flex w-full max-w-sm flex-col gap-2">
        <FinishButton />
        <button type="button" className="btn-ghost" onClick={onRestart}>
          {s.mode === "shuffle" ? "Shuffle again" : "Play this theme again"}
        </button>
        <Link href={sessionHome(s)} className="btn-ghost">
          Choose something else
        </Link>
      </div>
    </section>
  );
}

/** The whole Discover deck explored (v3 §3.1). */
export function DiscoverFinale({ badges, quiet }: { badges: string[]; quiet: boolean }) {
  return (
    <section className="fade-up flex flex-col items-center pt-10 text-center" aria-labelledby="finale">
      {!quiet && <Confetti seed={7} />}
      <p className="eyebrow text-terracotta-ink">Discover · all ten</p>
      <h1 id="finale" className="serif-soft mt-3 font-serif text-[2.3rem] leading-[1.08] text-ink">
        {DISCOVER_FINALE}
      </h1>
      <NewBadges ids={badges} quiet={quiet} />
      <StopNote />
      <div className="mt-8 flex w-full max-w-sm flex-col gap-2">
        <FinishButton />
        <Link href="/discover" className="btn-secondary">
          Play another round
        </Link>
        <Link href="/together" className="btn-secondary">
          Try Together
        </Link>
        <button
          type="button"
          className="btn-ghost"
          onClick={async () => {
            const r = await shareApp(DISCOVER_INVITE);
            if (r === "copied") showToast("Link copied");
          }}
        >
          <Share2 className="size-4" aria-hidden /> Share this game
        </button>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel px-3 py-3">
      <dt className="text-[12px] font-semibold text-ink-soft">{label}</dt>
      <dd className="font-serif text-2xl tabular-nums text-ink">{value}</dd>
    </div>
  );
}
