"use client";

import type { DiscussionMarker } from "@/types/game";

export const MARKER_LABELS: Record<DiscussionMarker, string> = {
  agree: "We agree",
  difference: "Interesting difference",
  revisit: "Let’s revisit",
};

const ORDER: DiscussionMarker[] = ["agree", "difference", "revisit"];

/** Optional, private conversation notes. Never a score. */
export function DiscussionMarkers({
  value,
  onChange,
}: {
  value: DiscussionMarker | undefined;
  onChange: (m: DiscussionMarker) => void;
}) {
  return (
    <fieldset className="mt-5">
      <legend className="eyebrow mb-2.5 w-full text-center text-ink-faint">Notes on this phone · optional</legend>
      <div className="flex flex-wrap justify-center gap-2">
        {ORDER.map((m) => {
          const on = value === m;
          return (
            <button
              key={m}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(m)}
              className={`min-h-10 rounded-full border px-3.5 text-[13px] font-medium transition duration-200 ${
                on
                  ? "border-ink bg-ink text-ivory"
                  : "border-ink/12 bg-card/60 text-ink-soft hover:border-ink/30 hover:text-ink"
              }`}
            >
              {MARKER_LABELS[m]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
