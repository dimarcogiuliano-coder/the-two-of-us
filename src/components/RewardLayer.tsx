"use client";

import { ACHIEVEMENTS } from "@/data/achievements";
import { useFeedback } from "@/hooks/useProgress";
import { AchievementIcon, SparkIcon } from "./Icons";

/** Spark floats (top right, under the counter) and badge-unlock toasts. */
export function RewardLayer() {
  const items = useFeedback();
  const sparks = items.filter((i) => i.kind === "sparks");
  const badges = items.filter((i) => i.kind === "badge");
  return (
    <>
      <div className="pointer-events-none fixed right-3 top-14 z-[60] flex flex-col items-end sm:right-[max(1rem,calc(50%-17rem))]" aria-hidden>
        {sparks.map((s) =>
          s.kind === "sparks" ? (
            <span key={s.id} className="spark-rise flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-sm font-bold text-ink shadow-md">
              +{s.amount} <SparkIcon className="size-4" />
            </span>
          ) : null,
        )}
      </div>
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4">
        {badges.map((b) => {
          if (b.kind !== "badge") return null;
          const a = ACHIEVEMENTS.find((x) => x.id === b.achievementId);
          if (!a) return null;
          return (
            <div key={b.id} className="badge-in flex items-center gap-3 rounded-2xl bg-ink py-2.5 pl-2.5 pr-5 text-ivory shadow-xl">
              <span className="grid size-10 place-items-center rounded-xl bg-gold/20 text-gold">
                <AchievementIcon icon={a.icon} className="size-5" />
              </span>
              <span>
                <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-gold">Badge unlocked</span>
                <span className="block font-serif text-lg leading-tight">{a.title}</span>
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
