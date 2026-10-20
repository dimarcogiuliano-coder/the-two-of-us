"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, Bookmark, Settings, Sparkles, Trophy } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { totalSparks } from "@/lib/rewards";
import { Mark } from "./Brand";
import { SparkIcon } from "./Icons";

export function SparksCounter() {
  const p = useProgress();
  const n = p ? totalSparks(p) : null;
  if (p?.settings.quiet) return null; // Quiet Mode hides Sparks entirely
  return (
    <Link
      href="/progress"
      className="inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-gold/40 bg-card px-3 text-sm font-bold tabular-nums text-ink transition hover:border-gold"
      aria-label={n === null ? "Sparks" : `${n} Sparks — Our Progress`}
    >
      <SparkIcon className="size-[18px]" />
      <span>{n ?? "–"}</span>
    </Link>
  );
}

export function TopBar({ title, back }: { title?: string; back?: string }) {
  return (
    <header className="pt-safe sticky top-0 z-30 bg-ivory/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-xl items-center gap-2 px-3 py-1.5 sm:px-6">
        {back ? (
          <Link href={back} className="icon-btn" aria-label="Back">
            <ArrowLeft className="size-5" aria-hidden />
          </Link>
        ) : (
          <Link href="/" className="icon-btn" aria-label="The Two of Us — home">
            <Mark className="size-6" />
          </Link>
        )}
        <p className="min-w-0 flex-1 truncate text-center text-[15px] font-bold text-ink">{title}</p>
        <SparksCounter />
      </div>
    </header>
  );
}

const TABS = [
  { href: "/start", label: "Play", icon: Sparkles, match: ["/start", "/discover", "/together"] },
  { href: "/saved", label: "Saved", icon: Bookmark, match: ["/saved"] },
  { href: "/progress", label: "Our Progress", icon: Trophy, match: ["/progress"] },
  { href: "/settings", label: "Settings", icon: Settings, match: ["/settings", "/about"] },
];

export function TabBar() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t-2 border-ink/[0.06] bg-card/95 backdrop-blur-md">
      <ul className="mx-auto grid max-w-xl grid-cols-4 px-2 pt-1.5">
        {TABS.map((t) => {
          const active = t.match.some((m) => path === m || path.startsWith(`${m}/`));
          const Icon = t.icon;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-bold transition ${
                  active ? "text-burgundy" : "text-ink-faint hover:text-ink"
                }`}
              >
                <Icon className="size-[22px]" strokeWidth={active ? 2.3 : 1.9} aria-hidden />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Standard page frame: top bar, content, tab bar. */
export function AppShell({
  title,
  back,
  children,
  tabs = true,
}: {
  title?: string;
  back?: string;
  children: ReactNode;
  tabs?: boolean;
}) {
  return (
    <>
      <TopBar title={title} back={back} />
      <main id="main" className={`mx-auto w-full max-w-xl px-4 sm:px-6 ${tabs ? "pb-28" : "pb-10"}`}>
        {children}
      </main>
      {tabs && <TabBar />}
    </>
  );
}

export function PageTitle({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: ReactNode }) {
  return (
    <div className="fade-up pt-4">
      {eyebrow && <p className="eyebrow text-burgundy">{eyebrow}</p>}
      <h1 className="serif-soft mt-1.5 font-serif text-[2.3rem] font-[420] leading-[1.05] tracking-[-0.015em] text-ink">{title}</h1>
      {intro && <div className="mt-2 text-[15px] leading-relaxed text-ink-soft">{intro}</div>}
    </div>
  );
}

export function Loading() {
  return <div className="min-h-[60vh]" aria-busy="true" aria-label="Loading" />;
}
