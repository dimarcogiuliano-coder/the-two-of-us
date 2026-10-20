"use client";

import { CHAPTERS } from "@/data/chapters";
import type { GameProgress } from "@/types/game";
import { levelExplored, levelStatus, recommendedLevel } from "@/lib/engine";
import { levelsFor } from "@/lib/metadata";
import { LevelMedallion, inkFor, statusLabel } from "./LevelBits";

const HEADER_H = 70;
const ROW_H = 150;
const X_PATTERN = [50, 74, 50, 26];

/**
 * The Together journey: ten level nodes on a winding path, grouped into four
 * chapters. Every node is a real button in an ordered list, so the map works
 * without the illustration (screen readers, keyboard, reduced motion).
 */
export function JourneyMap({ progress, onOpen }: { progress: GameProgress; onOpen: (levelId: string) => void }) {
  const levels = levelsFor("together");
  const next = recommendedLevel(progress, "together");

  type Item = { kind: "chapter"; id: string; y: number; title: string; number: number; color: string } | { kind: "level"; id: string; y: number; x: number; i: number };
  const items: Item[] = [];
  let y = 0;
  let i = 0;
  for (const ch of CHAPTERS) {
    items.push({ kind: "chapter", id: ch.id, y, title: ch.title, number: ch.number, color: ch.accentColor });
    y += HEADER_H;
    for (const l of levels.filter((lv) => lv.chapterId === ch.id)) {
      items.push({ kind: "level", id: l.id, y, x: X_PATTERN[i % X_PATTERN.length], i });
      y += ROW_H;
      i++;
    }
  }
  const height = y;
  const nodes = items.filter((it): it is Extract<Item, { kind: "level" }> => it.kind === "level");
  const NODE_CY = 46;
  let d = "";
  nodes.forEach((n, k) => {
    const cy = n.y + NODE_CY;
    if (k === 0) d += `M ${n.x} ${cy}`;
    else {
      const p = nodes[k - 1];
      const py = p.y + NODE_CY;
      const mid = (cy - py) / 2;
      d += ` C ${p.x} ${py + mid}, ${n.x} ${cy - mid}, ${n.x} ${cy}`;
    }
  });

  return (
    <div className="relative" style={{ height }}>
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden>
        <path d={d} fill="none" stroke="#262625" strokeOpacity="0.14" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 12" vectorEffect="non-scaling-stroke" />
      </svg>

      {items
        .filter((it) => it.kind === "chapter")
        .map((c) =>
          c.kind === "chapter" ? (
            <h3 key={c.id} className="absolute left-0 right-0 flex items-center gap-3" style={{ top: c.y + 14 }}>
              <span className="rounded-full border-2 border-ink/[0.07] bg-ivory px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-ink">
                <span style={{ color: inkFor(c.color) }}>Chapter {["One", "Two", "Three", "Four"][c.number - 1]}</span>
                <span className="text-ink-faint"> · </span>
                {c.title}
              </span>
            </h3>
          ) : null,
        )}

      <ol aria-label="Together journey: ten levels">
        {nodes.map((n) => {
          const level = levels.find((l) => l.id === n.id)!;
          const status = levelStatus(progress, level.id);
          const explored = levelExplored(progress, level.id);
          const isNext = level.id === next;
          return (
            <li key={level.id} className="absolute w-[168px] -translate-x-1/2" style={{ left: `${n.x}%`, top: n.y }}>
              <button
                type="button"
                onClick={() => onOpen(level.id)}
                className="group flex w-full flex-col items-center text-center"
                aria-label={`Level ${level.number}: ${level.title}. ${statusLabel(status)}, ${explored} of 10 explored.${isNext ? " Recommended next." : ""}`}
              >
                <span className="transition-transform duration-200 group-hover:-translate-y-0.5 group-active:translate-y-[3px]">
                  <LevelMedallion level={level} status={status} explored={explored} size={isNext ? 84 : 72} recommended={isNext} />
                </span>
                <span className="mt-2 rounded-md bg-ivory/90 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint">
                  Level {level.number}
                  {isNext && <span className="ml-1.5 rounded-full bg-burgundy px-1.5 py-0.5 text-[10px] tracking-[0.08em] text-white">Up next</span>}
                </span>
                <span className="rounded-md bg-ivory/90 px-1 font-serif text-[16px] leading-tight text-ink">{level.title}</span>
                <span className="mt-0.5 rounded-md bg-ivory/90 px-1 text-[12px] text-ink-soft">
                  {status === "completed" ? "Completed" : status === "in-progress" ? `${explored} / 10 explored` : "Not started"}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
