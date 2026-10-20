"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Coffee, MessageCircle, SkipForward, Sparkles } from "lucide-react";
import type { Challenge, DiscussionMarker } from "@/types/game";
import {
  type Celebration,
  completeChallenge,
  goBack,
  isFreshCard,
  markIntroSeen,
  openSession,
  recordTwist,
  resolveCurrent,
  restartSession,
  roundCount,
  roundOf,
  setMarker,
  setSensitiveChoice,
  toggleBookmark,
} from "@/lib/engine";
import { getQuestion } from "@/lib/metadata";
import { rewardKey } from "@/lib/rewards";
import { sessionHome, sessionTitle } from "@/lib/labels";
import { act, nowIso, update, useProgress } from "@/hooks/useProgress";
import { Loading, SparksCounter, TopBar } from "./AppShell";
import { DeckFinished, DiscoverFinale, LevelComplete, RoundComplete } from "./Celebrations";
import { DiscussionMarkers } from "./DiscussionMarkers";
import { GuessButton, GuessReveal, type GuessStage } from "./GuessReveal";
import { LevelBadgeColor } from "./LevelBadgeColor";
import { ProgressBar } from "./LevelBits";
import { SessionIntro } from "./SessionIntro";
import { TwistDialog, pickTwist } from "./TwistDialog";

type Shown = { celebration: Celebration; badges: string[] } | null;

export function PlayScreen() {
  const p = useProgress();
  const router = useRouter();
  const [shown, setShown] = useState<Shown>(null);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const [guess, setGuess] = useState<GuessStage>("idle");
  const [twist, setTwist] = useState<Challenge | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);

  const s = p?.activeSessionId ? p.sessions[p.activeSessionId] : undefined;
  const sid = s?.id ?? null;
  const qid = s && s.questionIds.length ? s.questionIds[s.currentIndex] : null;

  // Reset per-card UI whenever the card changes (adjusting state during render).
  const [cardId, setCardId] = useState(qid);
  if (cardId !== qid) {
    setCardId(qid);
    setGuess("idle");
    setTwist(null);
    setNoteOpen(false);
  }

  // Keyboard: ← goes back (when not typing or in a dialog).
  useEffect(() => {
    if (!sid) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key !== "ArrowLeft" || e.altKey || e.metaKey || e.ctrlKey) return;
      if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;
      if (document.querySelector("dialog[open]")) return;
      setDir("prev");
      update((pp) => goBack(pp, sid, nowIso()));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sid]);

  if (!p)
    return (
      <Frame title="The Two of Us">
        <Loading />
      </Frame>
    );
  if (!s) {
    return (
      <Frame>
        <div className="pt-16 text-center">
        <p className="font-serif text-2xl text-ink">Nothing in progress.</p>
        <Link href="/start" className="btn-primary mt-6">
          Choose a game
        </Link>
        </div>
      </Frame>
    );
  }
  const quiet = p.settings.quiet;

  /* ── Celebrations and endings ── */
  if (shown) {
    const c = shown.celebration;
    if (c.kind === "round") {
      return (
        <Frame title={sessionTitle(s)} back={sessionHome(s)}>
        <RoundComplete
          round={c.roundNumber}
          total={c.totalRounds}
          sparks={c.sparks}
          messageIndex={c.messageIndex}
          badges={shown.badges}
          quiet={quiet}
          onAnother={() => setShown(null)}
        />
        </Frame>
      );
    }
    if (c.kind === "discover-finale")
      return (
        <Frame title="Discover" back="/discover">
          <DiscoverFinale badges={shown.badges} quiet={quiet} />
        </Frame>
      );
  }
  if (s.finishedAt) {
    if (s.mode === "level") {
      return (
        <Frame title={sessionTitle(s)} back={sessionHome(s)}>
        <LevelComplete
          p={p}
          s={s}
          badges={shown?.badges ?? []}
          sparks={shown?.celebration.sparks ?? 0}
          quiet={quiet}
          onPlayLevel={(levelId) => {
            setShown(null);
            update((pp) => openSession(pp, { gameId: s.gameId, mode: "level", levelId }, nowIso()));
          }}
          onReplay={() => {
            setShown(null);
            update((pp) => restartSession(pp, s.id, nowIso()));
          }}
        />
        </Frame>
      );
    }
    return (
      <Frame title={sessionTitle(s)} back={sessionHome(s)}>
        {s.gameId === "discover" ? (
          <DiscoverFinale badges={shown?.badges ?? []} quiet={quiet} />
        ) : (
          <DeckFinished s={s} onRestart={() => update((pp) => restartSession(pp, s.id, nowIso()))} />
        )}
      </Frame>
    );
  }

  /* ── Intro / consent ── */
  const fresh = s.completedIds.length + s.skippedIds.length === 0 && s.currentIndex === 0;
  if (!s.introSeen && fresh) {
    return (
      <Frame title={sessionTitle(s)} back={sessionHome(s)}>
        <SessionIntro
          p={p}
          s={s}
          onStart={(include) => update((pp) => (include ? setSensitiveChoice(pp, s.id, true, nowIso()) : markIntroSeen(pp, s.id, nowIso())))}
        />
      </Frame>
    );
  }
  if (!qid) {
    return (
      <Frame title={sessionTitle(s)} back={sessionHome(s)}>
      <div className="pt-16 text-center">
        <p className="font-serif text-2xl text-ink">This deck is empty.</p>
        <p className="mt-2 text-ink-soft">Everything in it is a topic you&rsquo;ve chosen to leave out.</p>
        <Link href={sessionHome(s)} className="btn-primary mt-6">
          Choose something else
        </Link>
      </div>
      </Frame>
    );
  }

  /* ── The card ── */
  const q = getQuestion(qid);
  const round = roundOf(s.currentIndex);
  const rounds = roundCount(s);
  const explored = s.completedIds.length + s.skippedIds.length;
  const guessed = rewardKey.guess(qid) in p.ledger;
  const twistDone = rewardKey.twist(qid) in p.ledger;

  const resolve = (outcome: "done" | "skipped") => {
    setDir("next");
    const ev = act((pp) => resolveCurrent(pp, s.id, outcome, nowIso()));
    if (ev.celebration) setShown({ celebration: ev.celebration, badges: ev.achievements });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openTwist = (avoid?: string) => {
    const t = pickTwist(s.twistsUsed, avoid);
    update((pp) => recordTwist(pp, s.id, t.id));
    setTwist(t);
  };

  return (
    <>
      <header className="pt-safe sticky top-0 z-30 bg-ivory/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-xl items-center gap-2 px-3 py-1.5 sm:px-6">
          <Link href={sessionHome(s)} className="icon-btn" aria-label="Leave this game (progress is saved)">
            <ArrowLeft className="size-5" aria-hidden />
          </Link>
          <p className="min-w-0 flex-1 truncate text-center text-[15px] font-bold text-ink">{sessionTitle(s)}</p>
          {!quiet && <SparksCounter />}
        </div>
      </header>

      <main id="main" className="relative mx-auto w-full max-w-xl overflow-x-clip px-4 pb-40 sm:px-6">
        <div className="pt-1">
          <div className="mb-1.5 flex items-center justify-between text-[13px] font-semibold text-ink-soft">
            <span>
              Round {round + 1} of {rounds}
            </span>
            <span>
              Question {s.currentIndex + 1} of {s.questionIds.length}
            </span>
          </div>
          <LevelBadgeColor session={s}>
            {(color) => <ProgressBar value={explored} max={s.questionIds.length} color={color} label="Questions explored" />}
          </LevelBadgeColor>
        </div>
        <p className="sr-only" aria-live="polite">
          Question {s.currentIndex + 1} of {s.questionIds.length}
        </p>

        <div key={qid} className={`mt-4 ${quiet ? "" : dir === "prev" ? "card-enter-prev" : "card-enter-next"}`}>
          <GuessReveal
            question={q}
            bookmarked={p.bookmarkedQuestionIds.includes(qid)}
            onToggleBookmark={() => act((pp) => toggleBookmark(pp, qid))}
            explored={!isFreshCard(p, s, qid)}
            guessed={guessed}
            quiet={quiet}
            stage={guess}
            setStage={setGuess}
            onComplete={() => act((pp) => completeChallenge(pp, s.id, qid, "guess", nowIso()))}
          />

          {guess === "idle" && (
            <div className="mt-4 flex gap-2">
              {q.guessEnabled && <GuessButton onClick={() => setGuess("predict")} done={guessed} />}
              {q.twistEnabled && (
                <button type="button" onClick={() => openTwist()} className="btn-secondary px-4" aria-label="Add a twist">
                  <Sparkles className="size-5 text-terracotta-ink" aria-hidden />
                  <span>{q.guessEnabled ? "Twist" : "Add a twist"}</span>
                </button>
              )}
            </div>
          )}

          {guess === "idle" && (
            <div className="mt-5">
              {noteOpen || p.discussionMarkers[qid] ? (
                <DiscussionMarkers
                  value={p.discussionMarkers[qid]}
                  onChange={(m: DiscussionMarker) => update((pp) => setMarker(pp, qid, m))}
                />
              ) : (
                <button type="button" className="btn-ghost w-full" onClick={() => setNoteOpen(true)}>
                  <MessageCircle className="size-4" aria-hidden /> Add a note for later
                </button>
              )}
              <button type="button" className="btn-ghost mt-1 w-full" onClick={() => router.push("/recap")}>
                <Coffee className="size-4" aria-hidden /> Take a break
              </button>
            </div>
          )}
        </div>
      </main>

      <nav aria-label="Question controls" className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t-2 border-ink/[0.06] bg-ivory/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-xl items-center gap-2 px-4 pt-3 sm:px-6">
          <button
            type="button"
            onClick={() => {
              setDir("prev");
              update((pp) => goBack(pp, s.id, nowIso()));
            }}
            disabled={s.currentIndex === 0}
            className="btn-secondary h-14 w-12 shrink-0 px-0"
            aria-label="Previous question"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </button>
          <button type="button" onClick={() => resolve("skipped")} className="btn-secondary h-14 shrink-0 gap-1.5 px-3.5">
            <SkipForward className="size-4" aria-hidden /> Skip
          </button>
          <button type="button" onClick={() => resolve("done")} className="btn-primary h-14 min-w-0 flex-1 whitespace-nowrap px-2 text-[15px]">
            <Check className="size-5" aria-hidden /> We&rsquo;ve answered
          </button>
        </div>
      </nav>

      <TwistDialog
        twist={twist}
        quiet={quiet}
        alreadyDone={twistDone}
        onClose={() => setTwist(null)}
        onAnother={() => openTwist(twist?.id)}
        onComplete={() => {
          setTwist(null);
          act((pp) => completeChallenge(pp, s.id, qid, "twist", nowIso()));
        }}
      />
    </>
  );
}

/** Frame for non-card play states: top bar + padded content, no tab bar. */
function Frame({ title, back, children }: { title?: string; back?: string; children: React.ReactNode }) {
  return (
    <>
      <TopBar title={title} back={back ?? "/start"} />
      <main id="main" className="mx-auto w-full max-w-xl px-5 pb-14 sm:px-8">
        {children}
      </main>
    </>
  );
}
