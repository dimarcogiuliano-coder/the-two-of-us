"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { levelsFor } from "@/lib/metadata";
import { AppShell, PageTitle } from "./AppShell";

export function ChooseAdventure() {
  const p = useProgress();
  const done = (g: "discover" | "together") =>
    p ? levelsFor(g).filter((l) => p.completedLevelIds.includes(l.id)).length : 0;

  return (
    <AppShell title="Choose your adventure">
      <PageTitle eyebrow="Let's play" title="Choose your adventure" />
      <div className="mt-6 flex flex-col gap-5">
        <AdventureCard
          href="/discover"
          tone="discover"
          kicker="First dates & new sparks"
          title="Discover"
          quote="Skip the small talk."
          body="Ten quick, slightly cheeky questions in two short levels. Perfect for a first date or a bar."
          cta="Play Discover"
          meta={`${done("discover")} of 2 levels complete`}
        />
        <AdventureCard
          href="/together"
          tone="together"
          kicker="For the two of you"
          title="Together"
          quote="How well do you really know each other?"
          body="A 100-question journey across ten levels — from the silly stuff to the real stuff."
          cta="Play Together"
          meta={`${done("together")} of 10 levels complete`}
        />
      </div>
    </AppShell>
  );
}

function AdventureCard(props: {
  href: string;
  tone: "discover" | "together";
  kicker: string;
  title: string;
  quote: string;
  body: string;
  cta: string;
  meta: string;
}) {
  const discover = props.tone === "discover";
  return (
    <Link
      href={props.href}
      className={`group relative block overflow-hidden rounded-[28px] p-6 transition active:translate-y-[3px] ${
        discover
          ? "bg-terracotta-ink text-white shadow-[0_5px_0_0_#62352a] active:shadow-[0_2px_0_0_#62352a]"
          : "bg-burgundy text-white shadow-[0_5px_0_0_#4a2730] active:shadow-[0_2px_0_0_#4a2730]"
      }`}
    >
      {/* Abstract motif: interlocking circles */}
      <svg className="absolute -right-10 -top-10 size-48 opacity-25 transition-transform duration-500 group-hover:rotate-12" viewBox="0 0 100 100" aria-hidden>
        <circle cx="40" cy="50" r="26" fill="none" stroke="white" strokeWidth="3" />
        <circle cx="60" cy="50" r="26" fill="none" stroke="white" strokeWidth="3" />
        {discover && <path d="M50 14 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3z" fill="white" />}
      </svg>
      <p className="eyebrow text-white/80">{props.kicker}</p>
      <h2 className="serif-soft mt-2 font-serif text-[2.4rem] leading-none">{props.title}</h2>
      <p className="mt-2 font-serif text-lg italic text-white/90">&ldquo;{props.quote}&rdquo;</p>
      <p className="mt-3 max-w-[30ch] text-[14px] leading-relaxed text-white/85">{props.body}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl bg-white px-4 text-[15px] font-bold text-ink">
          {props.cta} <ArrowRight className="size-4" aria-hidden />
        </span>
        <span className="text-right text-xs font-semibold text-white/80">{props.meta}</span>
      </div>
    </Link>
  );
}
