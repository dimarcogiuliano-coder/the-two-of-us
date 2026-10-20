"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import type { GameProgress, GameSession } from "@/types/game";
import { OPT_IN_TOPIC_NAMES } from "@/data/review";
import { levelExplored, levelStatus, optInQuestionsIn, parseSessionId } from "@/lib/engine";
import { getLevel, getQuestion } from "@/lib/metadata";
import { sessionHome, sessionTitle } from "@/lib/labels";
import { LevelMedallion, inkFor } from "./LevelBits";

/**
 * Shown before a fresh pass through a deck: the level introduction (v3 §4.2),
 * signposting for personal topics, and — where the deck contains them — an
 * explicit, two-person opt-in for sensitive questions (v4 §5.3, §11.2).
 */
export function SessionIntro({
  p,
  s,
  onStart,
}: {
  p: GameProgress;
  s: GameSession;
  onStart: (includeSensitive: boolean) => void;
}) {
  const spec = parseSessionId(s.id)!;
  const optIn = p.settings.sensitive === "ask" ? optInQuestionsIn(spec) : [];
  const level = s.levelId ? getLevel(s.levelId) : null;
  const hasSensitive = (level?.questionIds ?? s.questionIds).some((id) => getQuestion(id).sensitive) || optIn.length > 0;
  const topics = [...new Set(optIn.map((id) => OPT_IN_TOPIC_NAMES[id]))];

  return (
    <div className="fade-up flex flex-col items-center pt-8 text-center">
      {level ? (
        <>
          <LevelMedallion level={level} status={levelStatus(p, level.id)} explored={levelExplored(p, level.id)} size={96} />
          <p className="eyebrow mt-5" style={{ color: inkFor(level.accentColor) }}>
            {level.gameId === "discover" ? `Discover · Level ${level.label}` : `Level ${level.number}`}
          </p>
          <h1 className="serif-soft mt-1 font-serif text-[2.4rem] leading-[1.05] text-ink">{level.title}</h1>
          <p className="mx-auto mt-3 max-w-sm font-serif text-xl italic leading-snug text-ink-soft">&ldquo;{level.intro}&rdquo;</p>
        </>
      ) : (
        <>
          <p className="eyebrow text-burgundy">Before you start</p>
          <h1 className="serif-soft mt-1 font-serif text-[2.2rem] leading-[1.05] text-ink">{sessionTitle(s)}</h1>
        </>
      )}

      <p className="mt-4 text-sm text-ink-soft">
        {s.questionIds.length} questions · {Math.ceil(s.questionIds.length / 5)} round{s.questionIds.length > 5 ? "s" : ""} of five
      </p>

      {hasSensitive && (
        <div className="panel mt-6 w-full p-5 text-left">
          <p className="flex items-center gap-2 font-bold text-ink">
            <ShieldCheck className="size-5 text-dusty-ink" aria-hidden /> A few personal topics ahead
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            Either of you can skip any question, no explanation needed. Stop whenever you like — you don&rsquo;t
            have to resolve anything tonight.
          </p>
          {topics.length > 0 && (
            <>
              <p className="mt-3 text-[14px] leading-relaxed text-ink">
                {optIn.length === 1 ? "One question touches" : `${optIn.length} questions touch`} on {listify(topics)}. They&rsquo;re
                left out unless you <em>both</em> want them.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <button type="button" className="btn-primary" onClick={() => onStart(false)}>
                  Play without them <ArrowRight className="size-4" aria-hidden />
                </button>
                <button type="button" className="btn-secondary" onClick={() => onStart(true)}>
                  We both want them
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {topics.length === 0 &&
        (s.questionIds.length === 0 ? (
          <p className="panel mt-6 w-full p-5 text-[15px] text-ink-soft">
            Everything in this theme is a topic you&rsquo;ve chosen to leave out. You can change that in Settings.
          </p>
        ) : (
          <button type="button" className="btn-burgundy mt-8 w-full max-w-sm text-base" onClick={() => onStart(false)}>
            Let&rsquo;s go <ArrowRight className="size-5" aria-hidden />
          </button>
        ))}

      <Link href={sessionHome(s)} className="btn-ghost mt-3">
        Not now
      </Link>
    </div>
  );
}

function listify(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
