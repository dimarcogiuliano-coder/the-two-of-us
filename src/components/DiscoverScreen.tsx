"use client";

import Link from "next/link";
import { ArrowRight, Shuffle } from "lucide-react";
import { levelExplored, levelStatus, recommendedLevel } from "@/lib/engine";
import { levelsFor } from "@/lib/metadata";
import { useProgress } from "@/hooks/useProgress";
import { useStartSession } from "@/hooks/useStartSession";
import { AppShell, Loading, PageTitle } from "./AppShell";
import { LevelMedallion, ProgressBar, inkFor, statusLabel } from "./LevelBits";

export function DiscoverScreen() {
  const p = useProgress();
  const start = useStartSession();
  const levels = levelsFor("discover");

  return (
    <AppShell title="Discover" back="/start">
      <PageTitle eyebrow="First dates & new sparks" title="Discover" intro="Less small talk. More spark. Two short levels, five questions each." />
      {!p ? (
        <Loading />
      ) : (
        <>
          <ol className="mt-6 flex flex-col gap-4" aria-label="Discover levels">
            {levels.map((l) => {
              const status = levelStatus(p, l.id);
              const explored = levelExplored(p, l.id);
              const isNext = recommendedLevel(p, "discover") === l.id;
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => start({ gameId: "discover", mode: "level", levelId: l.id })}
                    className={`panel flex w-full items-center gap-4 p-4 text-left transition hover:border-ink/20 active:translate-y-[2px] ${isNext ? "border-terracotta/50" : ""}`}
                    aria-label={`Level ${l.label}: ${l.title}. ${statusLabel(status)}, ${explored} of 5 explored.${isNext ? " Recommended next." : ""}`}
                  >
                    <LevelMedallion level={l} status={status} explored={explored} size={68} recommended={isNext} />
                    <span className="min-w-0 flex-1">
                      <span className="eyebrow block" style={{ color: inkFor(l.accentColor) }}>
                        Level {l.label}
                        {isNext && " · Up next"}
                      </span>
                      <span className="block font-serif text-xl leading-tight text-ink">{l.title}</span>
                      <span className="mt-0.5 block text-[13px] text-ink-soft">{l.description}</span>
                      <ProgressBar className="mt-2" value={explored} max={5} color={l.accentColor} label={`Level ${l.label} progress`} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <button
            type="button"
            onClick={() => start({ gameId: "discover", mode: "shuffle" })}
            className="panel mt-4 flex w-full items-center gap-3 p-4 text-left transition hover:border-ink/20 active:translate-y-[2px]"
          >
            <span className="grid size-11 place-items-center rounded-2xl bg-dusty/25 text-dusty-ink">
              <Shuffle className="size-5" aria-hidden />
            </span>
            <span className="flex-1">
              <span className="block font-bold text-ink">Shuffle all ten</span>
              <span className="block text-[13px] text-ink-soft">Same questions, random order.</span>
            </span>
            <ArrowRight className="size-5 text-ink-soft" aria-hidden />
          </button>

          <Link href="/together" className="mt-8 block rounded-[24px] border-2 border-dashed border-ink/15 p-5 text-center transition hover:border-ink/30">
            <span className="block font-serif text-lg text-ink">Already past the first date?</span>
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-burgundy">
              Try Together — 100 questions <ArrowRight className="size-4" aria-hidden />
            </span>
          </Link>
        </>
      )}
    </AppShell>
  );
}
