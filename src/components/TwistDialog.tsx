"use client";

import { Check, Shuffle } from "lucide-react";
import type { Challenge } from "@/types/game";
import { TWISTS } from "@/data/challenges";
import { Dialog } from "./Dialog";
import { TwistIcon } from "./Icons";

/** Pick the twist least recently used in this pass, so they don't repeat too often. */
export function pickTwist(used: string[], avoid?: string): Challenge {
  const lastUse = (id: string) => used.lastIndexOf(id);
  const options = TWISTS.filter((t) => t.id !== avoid);
  return [...options].sort((a, b) => lastUse(a.id) - lastUse(b.id))[0];
}

/** An optional twist on the current question. Dismissable; Sparks only on explicit completion. */
export function TwistDialog({
  twist,
  onClose,
  onComplete,
  onAnother,
  alreadyDone,
  quiet,
}: {
  twist: Challenge | null;
  onClose: () => void;
  onComplete: () => void;
  onAnother: () => void;
  alreadyDone: boolean;
  quiet: boolean;
}) {
  return (
    <Dialog open={twist !== null} onClose={onClose} title={twist ? `Twist: ${twist.title}` : "Twist"} hideTitle>
      {twist && (
        <div className="pt-2 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-terracotta/15 text-terracotta-ink">
            <TwistIcon id={twist.id} className="size-8" />
          </span>
          <p className="eyebrow mt-4 text-terracotta-ink">Add a twist</p>
          <p className="serif-soft mt-1 font-serif text-[1.9rem] leading-tight text-ink">{twist.title}</p>
          <p className="mx-auto mt-3 max-w-xs text-[16px] leading-relaxed text-ink-soft">{twist.instruction}</p>
          <p className="mt-2 text-[12px] text-ink-faint">Optional. Either of you can say no.</p>
          <div className="mt-6 flex flex-col gap-2">
            <button type="button" className="btn-primary" onClick={onComplete}>
              <Check className="size-5" aria-hidden /> {alreadyDone ? "Done again" : quiet ? "We did it" : "We did it · challenge complete"}
            </button>
            <button type="button" className="btn-secondary" onClick={onAnother}>
              <Shuffle className="size-4" aria-hidden /> Another twist
            </button>
            <button type="button" className="btn-ghost" onClick={onClose}>
              Not this time
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
