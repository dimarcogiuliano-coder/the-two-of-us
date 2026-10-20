import {
  BookOpen, DoorOpen, Bookmark, Clapperboard, Compass, Dices, Eye, Flame, Footprints, House, KeyRound,
  Map as MapIcon, MessageCircle, Mountain, MoonStar, Orbit, Repeat, PartyPopper, Snowflake, Theater, WandSparkles, Zap,
  type LucideProps,
} from "lucide-react";
import type { Achievement, ChallengeId, LevelIcon as LevelIconId } from "@/types/game";

/** The brand Spark: a soft four-point star. */
export function SparkIcon({ className = "size-5", title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden={title ? undefined : true} role={title ? "img" : undefined}>
      {title && <title>{title}</title>}
      <path
        d="M12 1.8c.5 4.9 2.6 7.6 9.4 10.2-6.8 2.6-8.9 5.3-9.4 10.2-.5-4.9-2.6-7.6-9.4-10.2C9.4 9.4 11.5 6.7 12 1.8Z"
        fill="#C6A26B"
        stroke="#9a7b49"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const LEVEL_ICONS: Record<LevelIconId, React.ComponentType<LucideProps>> = {
  smile: PartyPopper,
  dices: Dices,
  clapperboard: Clapperboard,
  orbit: Orbit,
  "moon-star": MoonStar,
  mountain: Mountain,
  house: House,
  compass: Compass,
  flame: Flame,
  key: KeyRound,
  snowflake: Snowflake,
  wand: WandSparkles,
};

export function LevelIcon({ icon, className = "size-6", strokeWidth = 1.9 }: { icon: LevelIconId; className?: string; strokeWidth?: number }) {
  const C = LEVEL_ICONS[icon];
  return <C className={className} strokeWidth={strokeWidth} aria-hidden />;
}

export function AchievementIcon({ icon, className = "size-6" }: { icon: Achievement["icon"]; className?: string }) {
  if (icon === "spark") return <SparkIcon className={className} />;
  const map = { snowflake: Snowflake, eye: Eye, footprints: Footprints, book: BookOpen, bookmark: Bookmark, door: DoorOpen, map: MapIcon } as const;
  const C = map[icon];
  return <C className={className} strokeWidth={1.9} aria-hidden />;
}

export function TwistIcon({ id, className = "size-6" }: { id: ChallengeId; className?: string }) {
  const map = { "plot-twist": Theater, "rapid-fire": Zap, "role-reversal": Repeat, "one-more-thing": MessageCircle } as const;
  const C = map[id];
  return <C className={className} strokeWidth={1.9} aria-hidden />;
}
