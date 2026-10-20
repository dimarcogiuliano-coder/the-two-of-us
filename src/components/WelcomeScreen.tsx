"use client";

import Link from "next/link";
import { ArrowRight, Eye, Layers, Lock, RotateCcw } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { sessionTitle } from "@/lib/labels";
import { totalSparks } from "@/lib/rewards";
import { SUPPORTING, TAGLINE } from "@/lib/site";
import { CardFan } from "./Brand";
import { SparkIcon } from "./Icons";
import { ShareButton } from "./ShareButton";

export function WelcomeScreen() {
  const p = useProgress();
  const active = p?.activeSessionId ? p.sessions[p.activeSessionId] : undefined;
  const resumable = active && !active.finishedAt ? active : undefined;
  const sparks = p ? totalSparks(p) : 0;

  return (
    <main id="main" className="mx-auto flex w-full max-w-xl flex-col px-5 pb-12 sm:px-8">
      <section className="fade-up pt-9 text-center sm:pt-14">
        <p className="eyebrow text-burgundy">A conversation game for two</p>
        <h1 className="serif-soft mt-4 font-serif text-[3.4rem] font-[380] leading-[0.95] tracking-[-0.02em] text-ink sm:text-[4.6rem]">
          The Two <em className="font-[300]">of</em> Us
        </h1>
        <p className="mt-4 font-serif text-xl italic text-ink-soft sm:text-2xl">{TAGLINE}</p>
      </section>

      <div className="mt-7">
        <CardFan />
      </div>

      <section className="mt-5 text-center">
        <p className="font-serif text-lg text-ink">{SUPPORTING}</p>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft">
          Play five questions at a time — on a first date, after dinner, on a lazy Sunday. Guess
          each other&rsquo;s answers, get it gloriously wrong, and end up talking about the things
          that actually matter.
        </p>
      </section>

      {resumable && p && (
        <section aria-label="Resume your game" className="panel fade-up mt-8 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="eyebrow text-ink-faint">Welcome back</p>
            <span className="inline-flex items-center gap-1 text-sm font-bold tabular-nums text-ink">
              <SparkIcon className="size-4" /> {sparks}
            </span>
          </div>
          <p className="mt-2 font-serif text-lg leading-snug text-ink">
            Pick up <em>{sessionTitle(resumable)}</em> at question {resumable.currentIndex + 1} of {resumable.questionIds.length}.
          </p>
          <Link href="/play" className="btn-primary mt-4 w-full">
            <RotateCcw className="size-4" aria-hidden /> Resume
          </Link>
        </section>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <Link href="/start" className={resumable ? "btn-secondary" : "btn-primary"}>
          Let&rsquo;s play <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link href="/about" className="btn-ghost">
          How it works
        </Link>
      </div>

      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-5 border-t-2 border-ink/[0.07] pt-8 text-sm text-ink-soft">
        <Feature icon={<Layers className="size-4" aria-hidden />} title="Rounds of five">
          110 questions, played five at a time.
        </Feature>
        <Feature icon={<Eye className="size-4" aria-hidden />} title="Guess & Reveal">
          Predict their answer. Be wrong. Laugh.
        </Feature>
        <Feature icon={<SparkIcon className="size-4" />} title="Sparks, not scores">
          Earned for showing up — never for agreeing.
        </Feature>
        <Feature icon={<Lock className="size-4" aria-hidden />} title="No accounts">
          Progress stays on this device.
        </Feature>
      </ul>

      <footer className="mt-12 flex flex-col items-center gap-4 text-center">
        <ShareButton variant="secondary" />
        <p className="max-w-xs text-xs leading-relaxed text-ink-faint">
          Your game progress and bookmarks are stored on this device. We don&rsquo;t collect your answers.
        </p>
      </footer>
    </main>
  );
}

function Feature({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 shrink-0 text-burgundy">{icon}</span>
      <span>
        <strong className="block font-bold text-ink">{title}</strong>
        {children}
      </span>
    </li>
  );
}
