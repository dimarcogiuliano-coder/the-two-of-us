"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { ACHIEVEMENTS } from "@/data/achievements";
import { recommendedLevel } from "@/lib/engine";
import { QUESTIONS, getLevel, levelsFor } from "@/lib/metadata";
import { totalSparks } from "@/lib/rewards";
import { useProgress } from "@/hooks/useProgress";
import { AppShell, Loading, PageTitle } from "./AppShell";
import { AchievementIcon, SparkIcon } from "./Icons";
import { ProgressBar } from "./LevelBits";

export function ProgressScreen() {
  const p = useProgress();
  return (
    <AppShell title="Our Progress">
      <PageTitle
        eyebrow="On this device"
        title="Our Progress"
        intro="Saved on this phone only — not an account, and not a measure of your relationship."
      />
      {!p ? (
        <Loading />
      ) : (
        <Body />
      )}
    </AppShell>
  );
}

function Body() {
  const p = useProgress()!;
  const quiet = p.settings.quiet;
  const answered = Object.values(p.questionStatus).filter((s) => s === "done").length;
  const explored = Object.keys(p.questionStatus).length;
  const tLevels = levelsFor("together");
  const dLevels = levelsFor("discover");
  const tDone = tLevels.filter((l) => p.completedLevelIds.includes(l.id)).length;
  const dDone = dLevels.filter((l) => p.completedLevelIds.includes(l.id)).length;
  const next = recommendedLevel(p, "together");

  return (
    <>
      {!quiet && (
        <section className="mt-6 flex items-center gap-4 rounded-[24px] bg-ink p-5 text-ivory" aria-label="Sparks">
          <SparkIcon className="size-12" />
          <div>
            <p className="font-serif text-4xl tabular-nums leading-none">{totalSparks(p)}</p>
            <p className="mt-1 text-sm text-ivory/75">Sparks — for showing up and exploring. They don&rsquo;t expire and can&rsquo;t be bought.</p>
          </div>
        </section>
      )}

      <section className="panel mt-4 p-5" aria-label="Questions">
        <h2 className="font-serif text-xl text-ink">Questions explored</h2>
        <ProgressBar className="mt-3" value={explored} max={QUESTIONS.length} color="#753F4C" label="Questions explored" />
        <p className="mt-2 text-[13px] text-ink-soft">
          {answered} answered · {explored - answered} skipped (skipping is always fine)
        </p>
      </section>

      <section className="panel mt-4 p-5" aria-label="Levels">
        <h2 className="font-serif text-xl text-ink">Levels</h2>
        <p className="mt-3 text-sm font-bold text-ink">Together</p>
        <ProgressBar className="mt-1.5" value={tDone} max={tLevels.length} color="#C6A26B" label="Together levels completed" />
        <p className="mt-3 text-sm font-bold text-ink">Discover</p>
        <ProgressBar className="mt-1.5" value={dDone} max={dLevels.length} color="#BC7762" label="Discover levels completed" />
        <p className="mt-4 text-[13px] text-ink-soft">
          {next ? (
            <>
              Where you are: <Link href="/together" className="font-bold text-burgundy underline-offset-2 hover:underline">Level {getLevel(next).number} · {getLevel(next).title}</Link>
            </>
          ) : (
            "Every Together level explored."
          )}
        </p>
      </section>

      {!quiet && (
        <section className="mt-6" aria-labelledby="badges">
          <h2 id="badges" className="font-serif text-2xl text-ink">
            Badges
          </h2>
          <p className="mt-1 text-[13px] text-ink-soft">For exploring — never for agreeing, guessing right or sharing more than you want to.</p>
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {ACHIEVEMENTS.map((a) => {
              const got = p.unlockedAchievementIds.includes(a.id);
              return (
                <li key={a.id} className={`panel flex flex-col items-center p-4 text-center ${got ? "" : "opacity-70"}`}>
                  <span className={`grid size-14 place-items-center rounded-2xl ${got ? "bg-gold/25 text-gold-ink" : "bg-ink/[0.05] text-ink-faint"}`}>
                    {got ? <AchievementIcon icon={a.icon} className="size-7" /> : <Lock className="size-6" aria-hidden />}
                  </span>
                  <span className="mt-2 font-serif text-[17px] leading-tight text-ink">{a.title}</span>
                  <span className="mt-1 text-[12px] leading-snug text-ink-soft">{a.description}</span>
                  <span className="sr-only">{got ? "Unlocked" : "Not yet unlocked"}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {quiet && <p className="mt-6 text-center text-[13px] text-ink-soft">Quiet Mode is on, so Sparks and badges are hidden. Turn it off in Settings any time.</p>}
    </>
  );
}
