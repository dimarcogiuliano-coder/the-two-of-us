import { CATEGORY_BY_ID } from "@/data/categories";
import { getQuestion } from "@/lib/metadata";

/** Two overlapping rings — the mark used in the header and icons. */
export function Mark({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden fill="none">
      <circle cx="12.5" cy="16" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="19.5" cy="16" r="8.5" stroke="#753F4C" strokeWidth="1.8" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-serif text-[17px] tracking-tight text-ink ${className}`}>
      <Mark className="size-6" />
      <span>
        The Two <em className="font-normal">of</em> Us
      </span>
    </span>
  );
}

const FAN_IDS = ["discover-001", "together-046", "together-082"];

/** Decorative fan of three cards: one Discover, two Together. */
export function CardFan() {
  const transforms = [
    "translate(-62%, 4%) rotate(-9deg)",
    "translate(-50%, -2%) rotate(0deg)",
    "translate(-38%, 4%) rotate(9deg)",
  ];
  return (
    <div className="relative mx-auto h-[220px] w-full max-w-[340px] select-none sm:h-[260px]" aria-hidden>
      {FAN_IDS.map((id, i) => {
        const q = getQuestion(id);
        const accent = CATEGORY_BY_ID[q.categoryId].accentColor;
        return (
          <div
            key={id}
            className="absolute left-1/2 top-2 flex h-[190px] w-[150px] flex-col justify-between rounded-[22px] border-2 border-ink/[0.06] bg-card p-4 shadow-[0_12px_30px_-14px_rgb(38_38_37_/_0.35)] sm:h-[226px] sm:w-[172px]"
            style={{ transform: transforms[i], zIndex: i === 1 ? 3 : 2 - i }}
          >
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: accent }} />
              <span className="h-px flex-1" style={{ background: `${accent}55` }} />
            </span>
            <span className="font-serif text-[15px] leading-snug text-ink sm:text-[17px]">{q.text}</span>
            <span className="font-serif text-xs italic text-ink-faint">
              {q.gameId === "discover" ? "Discover" : `Together · No. ${q.order}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
