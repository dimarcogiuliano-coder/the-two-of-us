"use client";

import { useMemo } from "react";

/** Deterministic pseudo-random number in [0, 1). */
function rand(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const COLORS = ["#C6A26B", "#753F4C", "#8D9B82", "#BC7762", "#8698A8"];

/** Restrained, one-shot CSS confetti. Hidden entirely when reduced motion is on. */
export function Confetti({ pieces = 28, seed = 1 }: { pieces?: number; seed?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => {
        const r = (k: number) => rand(seed * 1000 + i * 7 + k);
        return {
          left: r(1) * 100,
          delay: r(2) * 350,
          drift: `${(r(3) - 0.5) * 120}px`,
          spin: `${(r(4) - 0.5) * 900}deg`,
          color: COLORS[i % COLORS.length],
          w: 6 + r(5) * 6,
          round: r(6) > 0.6,
        };
      }),
    [pieces, seed],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {items.map((p, i) => (
        <span
          key={i}
          className="confetti-piece absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.w,
            height: p.round ? p.w : p.w * 1.8,
            background: p.color,
            borderRadius: p.round ? 999 : 2,
            animationDelay: `${p.delay}ms`,
            ["--drift" as string]: p.drift,
            ["--spin" as string]: p.spin,
          }}
        />
      ))}
    </div>
  );
}
