"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { ChevronRight } from "lucide-react";
import { clearBookmarks, resetJourney, updateSettings } from "@/lib/engine";
import { nowIso, resetVisit, update, useProgress, wipeEverything } from "@/hooks/useProgress";
import { AppShell, Loading, PageTitle } from "./AppShell";
import { ConfirmDialog } from "./Dialog";
import { ShareButton } from "./ShareButton";
import { showToast } from "./Toast";

type Confirm = "journey" | "bookmarks" | "all" | null;

export function SettingsScreen() {
  const p = useProgress();
  const router = useRouter();
  const [confirm, setConfirm] = useState<Confirm>(null);

  return (
    <AppShell title="Settings">
      <PageTitle title="Settings" />
      {!p ? (
        <Loading />
      ) : (
        <>
          <Group title="How it feels">
            <Toggle
              label="Quiet Mode"
              hint="Hides Sparks, badges, confetti and non-essential animation. Every question and feature still works."
              checked={p.settings.quiet}
              onChange={(v) => update((pp) => updateSettings(pp, { quiet: v }))}
            />
            <Toggle
              label="Reduce motion"
              hint="Calmer transitions. Your device's reduced-motion setting is always respected too."
              checked={p.settings.motion === "reduce"}
              onChange={(v) => update((pp) => updateSettings(pp, { motion: v ? "reduce" : "system" }))}
            />
          </Group>

          <Group title="Sensitive topics">
            <fieldset className="px-4 py-4">
              <legend className="sr-only">Sensitive topics</legend>
              <p className="text-[14px] leading-relaxed text-ink-soft">
                A few Together questions touch on children, money, sex, unresolved disagreements and dealbreakers. They&rsquo;re
                never shown without asking first.
              </p>
              {(
                [
                  ["ask", "Ask before each deck", "You'll both choose whether to include them."],
                  ["never", "Always leave them out", "They won't appear anywhere. Levels still count as complete."],
                ] as const
              ).map(([value, label, hint]) => (
                <label key={value} className="mt-3 flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-ink/[0.07] p-3 has-[:checked]:border-burgundy/50">
                  <input
                    type="radio"
                    name="sensitive"
                    value={value}
                    checked={p.settings.sensitive === value}
                    onChange={() => update((pp) => updateSettings(pp, { sensitive: value }))}
                    className="mt-1 size-4 accent-[#753F4C]"
                  />
                  <span>
                    <span className="block font-bold text-ink">{label}</span>
                    <span className="block text-[13px] text-ink-soft">{hint}</span>
                  </span>
                </label>
              ))}
            </fieldset>
          </Group>

          <Group title="Your data">
            <Action label="Reset journey" hint="Start fresh: progress, Sparks and badges. Bookmarks stay." onClick={() => setConfirm("journey")} />
            <Action label="Clear bookmarks" hint="Remove every saved question." onClick={() => setConfirm("bookmarks")} />
            <Action label="Clear all local data" hint="Remove everything this game has stored on this device." danger onClick={() => setConfirm("all")} />
          </Group>

          <Group title="About">
            <LinkRow href="/about" label="How it works" />
            <LinkRow href="/about#privacy" label="Privacy" />
            <LinkRow href="/about#psychology" label="The thinking behind it" />
          </Group>

          <p className="mt-6 rounded-2xl bg-ink/[0.04] p-4 text-[13px] leading-relaxed text-ink-soft" id="privacy-note">
            Your game progress and bookmarks are stored on this device. We don&rsquo;t collect your answers — the game
            never asks you to type them. No accounts, no analytics, no ads.
          </p>
          <div className="mt-6 flex justify-center">
            <ShareButton variant="secondary" />
          </div>

          <ConfirmDialog
            open={confirm === "journey"}
            title="Reset your journey?"
            body="Progress, Sparks and badges start again from zero. Bookmarks, notes and settings are kept."
            confirmLabel="Reset journey"
            onCancel={() => setConfirm(null)}
            onConfirm={() => {
              setConfirm(null);
              update((pp) => resetJourney(pp, nowIso()));
              resetVisit();
              showToast("Fresh start");
            }}
          />
          <ConfirmDialog
            open={confirm === "bookmarks"}
            title="Clear all bookmarks?"
            body="This removes every saved question on this device."
            confirmLabel="Clear bookmarks"
            onCancel={() => setConfirm(null)}
            onConfirm={() => {
              setConfirm(null);
              update(clearBookmarks);
              showToast("Bookmarks cleared");
            }}
          />
          <ConfirmDialog
            open={confirm === "all"}
            title="Clear all local data?"
            body="Everything The Two of Us has stored on this device is deleted: progress, Sparks, badges, bookmarks, notes and settings. This can't be undone."
            confirmLabel="Delete everything"
            onCancel={() => setConfirm(null)}
            onConfirm={() => {
              setConfirm(null);
              wipeEverything();
              router.push("/");
            }}
          />
        </>
      )}
    </AppShell>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="eyebrow mb-2 px-1 text-ink-faint">{title}</h2>
      <div className="panel divide-y-2 divide-ink/[0.05] overflow-hidden">{children}</div>
    </section>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <div className="flex items-center gap-4 px-4 py-4">
      <div className="flex-1">
        <label htmlFor={id} className="block font-bold text-ink">
          {label}
        </label>
        <p className="mt-0.5 text-[13px] leading-snug text-ink-soft" id={`${id}-hint`}>
          {hint}
        </p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={`${id}-hint`}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition ${checked ? "bg-burgundy" : "bg-ink/20"}`}
      >
        <span className={`absolute top-1 size-6 rounded-full bg-white shadow transition-[left] duration-200 ${checked ? "left-7" : "left-1"}`} />
      </button>
    </div>
  );
}

function Action({ label, hint, onClick, danger }: { label: string; hint: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-ivory/60">
      <span className="flex-1">
        <span className={`block font-bold ${danger ? "text-burgundy" : "text-ink"}`}>{label}</span>
        <span className="block text-[13px] text-ink-soft">{hint}</span>
      </span>
      <ChevronRight className="size-5 text-ink-faint" aria-hidden />
    </button>
  );
}

function LinkRow({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="flex min-h-12 items-center gap-3 px-4 py-3.5 font-bold text-ink transition hover:bg-ivory/60">
      <span className="flex-1">{label}</span>
      <ChevronRight className="size-5 text-ink-faint" aria-hidden />
    </Link>
  );
}
