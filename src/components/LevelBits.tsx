import { Check } from "lucide-react";
import type { Level } from "@/types/game";
import type { LevelStatus } from "@/lib/engine";
import { LevelIcon } from "./Icons";

/** Thin progress bar with numeric label alongside (spec §5.2). */
export function ProgressBar({
  value,
  max,
  color,
  label,
  className = "",
}: {
  value: number;
  max: number;
  color: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value} of ${max}`}
        className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/[0.08]"
      >
        <span
          className="block h-full rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${max ? (value / max) * 100 : 0}%`, background: color }}
        />
      </div>
      <span className="shrink-0 text-[13px] font-bold tabular-nums text-ink-soft">
        {value} / {max}
      </span>
    </div>
  );
}

const STATUS_LABEL: Record<LevelStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  completed: "Completed",
};

/** The round level medallion used on the journey map and level cards. */
export function LevelMedallion({
  level,
  status,
  explored,
  size = 72,
  recommended = false,
}: {
  level: Level;
  status: LevelStatus;
  explored: number;
  size?: number;
  recommended?: boolean;
}) {
  const pct = (explored / level.questionIds.length) * 100;
  const done = status === "completed";
  return (
    <span
      className={`relative grid shrink-0 place-items-center rounded-full ${recommended ? "pulse-ring" : ""}`}
      style={{
        width: size,
        height: size,
        color: level.accentColor,
        background: done ? level.accentColor : `conic-gradient(${level.accentColor} ${pct}%, rgb(38 38 37 / 0.09) 0)`,
        boxShadow: `0 5px 0 0 ${done ? "rgb(38 38 37 / 0.25)" : "rgb(38 38 37 / 0.12)"}`,
      }}
    >
      <span
        className="grid place-items-center rounded-full"
        style={{
          width: size - 10,
          height: size - 10,
          background: done ? level.accentColor : "#FFFCF7",
          color: done ? onAccent(level.accentColor) : inkFor(level.accentColor),
        }}
      >
        <LevelIcon icon={level.icon} className={size > 60 ? "size-7" : "size-6"} />
      </span>
      {done && (
        <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full border-2 border-card bg-ink text-white">
          <Check className="size-3.5" strokeWidth={3} aria-hidden />
        </span>
      )}
    </span>
  );
}

export function statusLabel(s: LevelStatus) {
  return STATUS_LABEL[s];
}

/** Readable foreground on a solid accent fill. */
export function onAccent(accent: string): string {
  return accent === "#753F4C" || accent === "#BC7762" ? "#FFFFFF" : "#262625";
}

/** A darker, text-safe version of an accent for use on light backgrounds. */
export function inkFor(accent: string): string {
  const map: Record<string, string> = {
    "#8D9B82": "#4F5C46",
    "#C6A26B": "#7A5D2C",
    "#BC7762": "#8F4F3B",
    "#8698A8": "#4F6272",
    "#753F4C": "#753F4C",
  };
  return map[accent] ?? "#262625";
}
