"use client";

import { useState } from "react";
import { ArrowRight, Map as MapIcon, Shuffle, Tags } from "lucide-react";
import type { GameProgress } from "@/types/game";
import { levelExplored, levelStatus, recommendedLevel, sessionIdFor } from "@/lib/engine";
import { getLevel } from "@/lib/metadata";
import { CATEGORY_THEME_OPTIONS, TOPIC_THEME_OPTIONS, type ThemeOption } from "@/lib/themes";
import { useProgress } from "@/hooks/useProgress";
import { useStartSession } from "@/hooks/useStartSession";
import { AppShell, Loading, PageTitle } from "./AppShell";
import { ConfirmDialog } from "./Dialog";
import { JourneyMap } from "./JourneyMap";
import { LevelMedallion, ProgressBar, inkFor } from "./LevelBits";

type Tab = "journey" | "shuffle" | "themes";

export function TogetherScreen() {
  const p = useProgress();
  const start = useStartSession();
  const [tab, setTab] = useState<Tab>("journey");

  return (
    <AppShell title="Together" back="/start">
      <PageTitle
        eyebrow="For the two of you"
        title="Together"
        intro="A little closer, one question at a time. Ten levels, played five questions at a time."
      />
      {!p ? (
        <Loading />
      ) : (
        <>
          <ContinueCard p={p} onGo={(levelId) => start({ gameId: "together", mode: "level", levelId })} />

          <div role="tablist" aria-label="How to play Together" className="mt-6 grid grid-cols-3 gap-1 rounded-2xl bg-ink/[0.06] p-1">
            {(
              [
                ["journey", "Journey", MapIcon],
                ["shuffle", "Shuffle", Shuffle],
                ["themes", "Themes", Tags],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                role="tab"
                id={`tab-${id}`}
                aria-selected={tab === id}
                aria-controls={`panel-${id}`}
                onClick={() => setTab(id)}
                className={`flex min-h-11 items-center justify-center gap-1.5 rounded-xl text-sm font-bold transition ${
                  tab === id ? "bg-card text-ink shadow-[0_2px_0_0_rgb(38_38_37_/_0.1)]" : "text-ink-soft hover:text-ink"
                }`}
              >
                <Icon className="size-4" aria-hidden /> {label}
              </button>
            ))}
          </div>

          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-6">
            {tab === "journey" && (
              <>
                <p className="mb-4 text-center text-[13px] text-ink-soft">Every level is open — follow the path, or tap any level to explore freely.</p>
                <JourneyMap progress={p} onOpen={(levelId) => start({ gameId: "together", mode: "level", levelId })} />
              </>
            )}
            {tab === "shuffle" && <ShufflePanel p={p} />}
            {tab === "themes" && <ThemesPanel p={p} onPick={(themeId) => start({ gameId: "together", mode: "theme", themeId })} />}
          </div>
        </>
      )}
    </AppShell>
  );
}

function ContinueCard({ p, onGo }: { p: GameProgress; onGo: (levelId: string) => void }) {
  const next = recommendedLevel(p, "together");
  if (!next) {
    return (
      <div className="panel mt-6 p-5 text-center">
        <p className="font-serif text-xl text-ink">All ten levels explored.</p>
        <p className="mt-1 text-sm text-ink-soft">Replay any level, shuffle the deck, or revisit what you saved.</p>
      </div>
    );
  }
  const level = getLevel(next);
  const status = levelStatus(p, next);
  const explored = levelExplored(p, next);
  return (
    <section aria-label="Recommended next level" className="panel mt-6 flex items-center gap-4 p-4">
      <LevelMedallion level={level} status={status} explored={explored} size={64} />
      <div className="min-w-0 flex-1">
        <p className="eyebrow" style={{ color: inkFor(level.accentColor) }}>
          {status === "in-progress" ? "Continue" : "Up next"} · Level {level.number}
        </p>
        <p className="truncate font-serif text-xl leading-tight text-ink">{level.title}</p>
        <ProgressBar className="mt-2" value={explored} max={10} color={level.accentColor} label={`Level ${level.number} progress`} />
      </div>
      <button type="button" onClick={() => onGo(next)} className="btn-burgundy size-12 shrink-0 px-0" aria-label={`Play level ${level.number}: ${level.title}`}>
        <ArrowRight className="size-5" aria-hidden />
      </button>
    </section>
  );
}

function ShufflePanel({ p }: { p: GameProgress }) {
  const start = useStartSession();
  const [confirm, setConfirm] = useState(false);
  const s = p.sessions[sessionIdFor({ gameId: "together", mode: "shuffle" })];
  const resolved = s ? s.completedIds.length + s.skippedIds.length : 0;
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-gold/25 text-gold-ink">
          <Shuffle className="size-6" aria-hidden />
        </span>
        <div>
          <h2 className="font-serif text-xl text-ink">Shuffle all 100</h2>
          <p className="text-sm text-ink-soft">Random order, no repeats until the deck runs out. Still five at a time.</p>
        </div>
      </div>
      {s && <ProgressBar className="mt-4" value={resolved} max={s.questionIds.length} color="#C6A26B" label="Shuffle progress" />}
      <div className="mt-4 flex flex-col gap-2">
        <button type="button" className="btn-primary" onClick={() => start({ gameId: "together", mode: "shuffle" })}>
          {s && !s.finishedAt ? "Resume shuffle" : "Shuffle the deck"}
        </button>
        {s && (
          <button type="button" className="btn-ghost" onClick={() => setConfirm(true)}>
            Start a fresh shuffle
          </button>
        )}
      </div>
      <ConfirmDialog
        open={confirm}
        title="Start a fresh shuffle?"
        body="You'll get a new random order and start from the top. Sparks you've already earned stay yours."
        confirmLabel="Reshuffle"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          start({ gameId: "together", mode: "shuffle" }, { fresh: true });
        }}
      />
    </div>
  );
}

function themeExplored(p: GameProgress, t: ThemeOption) {
  return t.questionIds.filter((id) => p.questionStatus[id] !== undefined).length;
}

function ThemesPanel({ p, onPick }: { p: GameProgress; onPick: (themeId: string) => void }) {
  return (
    <div>
      <h2 className="eyebrow text-ink-faint">By category</h2>
      <ul className="mt-3 flex flex-col gap-2.5">
        {CATEGORY_THEME_OPTIONS.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onPick(t.id)}
              className="panel flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:border-ink/20 active:translate-y-[2px]"
            >
              <span className="size-3 shrink-0 rounded-full" style={{ background: t.accentColor }} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block font-serif text-[17px] leading-snug text-ink">{t.label}</span>
                <span className="block text-[13px] text-ink-soft">{t.description}</span>
              </span>
              <span className="shrink-0 text-xs font-bold tabular-nums text-ink-soft">
                {themeExplored(p, t)}/{t.questionIds.length}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <h2 className="eyebrow mt-7 text-ink-faint">By topic</h2>
      <p className="mt-1 text-[13px] text-ink-soft">Each question belongs to exactly one topic.</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {TOPIC_THEME_OPTIONS.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onPick(t.id)}
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl border-2 border-ink/[0.08] bg-card px-3.5 text-sm font-semibold text-ink shadow-[0_2px_0_0_rgb(38_38_37_/_0.08)] transition hover:border-ink/25 active:translate-y-[2px]"
            >
              <span className="size-2 rounded-full" style={{ background: t.accentColor }} aria-hidden />
              {t.label}
              <span className="text-xs font-bold tabular-nums text-ink-faint">
                <span className="sr-only">, explored </span>
                {themeExplored(p, t)}/{t.questionIds.length}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
