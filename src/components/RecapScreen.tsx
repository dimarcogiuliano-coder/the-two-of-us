"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { readVisit, resetVisit, useProgress } from "@/hooks/useProgress";
import { AppShell } from "./AppShell";
import { SparkIcon } from "./Icons";

const noop = () => () => {};
const EMPTY = JSON.stringify({ answered: 0, sparks: 0, badges: [], bookmarks: 0 });

/** "Tonight's discoveries" (v3 §7.3): counts only — never a summary of what was said. */
export function RecapScreen() {
  const p = useProgress();
  const raw = useSyncExternalStore(noop, () => JSON.stringify(readVisit()), () => EMPTY);
  const v = JSON.parse(raw) as ReturnType<typeof readVisit>;
  const quiet = p?.settings.quiet ?? false;

  return (
    <AppShell title="Tonight" tabs={false}>
      <section className="fade-up flex flex-col items-center pt-10 text-center">
        <svg viewBox="0 0 120 60" className="h-16 w-32" aria-hidden>
          <circle cx="45" cy="30" r="24" fill="none" stroke="#262625" strokeWidth="3" />
          <circle cx="75" cy="30" r="24" fill="none" stroke="#753F4C" strokeWidth="3" />
        </svg>
        <p className="eyebrow mt-4 text-burgundy">Tonight&rsquo;s discoveries</p>
        <h1 className="serif-soft mt-2 font-serif text-[2.4rem] leading-[1.05] text-ink">That&rsquo;s a lovely place to stop.</h1>
        <ul className="mt-7 grid w-full grid-cols-2 gap-3 text-left">
          <Item value={v.answered} label={v.answered === 1 ? "question explored" : "questions explored"} />
          <Item value={v.bookmarks} label={v.bookmarks === 1 ? "conversation saved" : "conversations saved"} />
          {!quiet && <Item value={v.badges.length} label={v.badges.length === 1 ? "new badge" : "new badges"} />}
          {!quiet && <Item value={v.sparks} label="Sparks earned" spark />}
        </ul>
        <p className="mx-auto mt-8 max-w-sm font-serif text-xl italic leading-snug text-ink-soft">
          The best conversations don&rsquo;t always end with an answer.
        </p>
        <p className="mt-3 text-sm text-ink-soft">Put the phones away and enjoy each other&rsquo;s company. Your place is saved for next time.</p>
        <div className="mt-8 flex w-full max-w-sm flex-col gap-2">
          <Link href="/" className="btn-primary" onClick={() => resetVisit()}>
            Done for tonight
          </Link>
          <Link href="/play" className="btn-ghost">
            Actually, one more
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

function Item({ value, label, spark }: { value: number; label: string; spark?: boolean }) {
  return (
    <li className="panel px-4 py-3.5">
      <span className="flex items-center gap-1.5 font-serif text-3xl tabular-nums text-ink">
        {spark && <SparkIcon className="size-6" />}
        {value}
      </span>
      <span className="text-[13px] text-ink-soft">{label}</span>
    </li>
  );
}
