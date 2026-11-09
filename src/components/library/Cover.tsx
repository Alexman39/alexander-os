import { BookOpen, Clapperboard, Gamepad2 } from "lucide-react";
import type { LibraryEntry } from "@/lib/demo/library";
import { cn } from "@/lib/cn";

const TYPE_ICON = { BOOK: BookOpen, GAME: Gamepad2, MOVIE: Clapperboard } as const;

/**
 * Procedural cover art. Until a metadata provider is connected we don't
 * ship third-party artwork; each entry gets a generated, typographic cover
 * from its palette + pattern so shelves still feel like physical objects.
 */
export function Cover({ entry, className, size = "md" }: { entry: LibraryEntry; className?: string; size?: "sm" | "md" | "lg" }) {
  const [from, to, ink] = entry.palette;
  const Icon = TYPE_ICON[entry.type];
  const aspect = entry.type === "GAME" ? "aspect-[3/4]" : "aspect-[2/3]";
  // Typography scales with the cover's own width (container query units),
  // so the same cover reads correctly as a 72px thumbnail or a 170px hero.
  return (
    <div
      className={cn("@container relative overflow-hidden rounded-[4px]", aspect, className)}
      style={{ background: `linear-gradient(155deg, ${from} 0%, ${to} 100%)`, color: ink }}
    >
      <Pattern kind={entry.pattern} color={ink} />
      {/* spine light */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-[6%] bg-gradient-to-r from-black/35 to-transparent" />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/10" />
      <div className="absolute inset-0 flex flex-col justify-between p-[8cqw]">
        <Icon aria-hidden className="size-[clamp(10px,11cqw,20px)] opacity-80" />
        <div className="min-w-0">
          <p
            className="text-display font-bold leading-[1.02] [overflow-wrap:break-word] [text-wrap:balance]"
            style={{ fontSize: "clamp(7.5px, 11cqw, 28px)", hyphens: "auto" }}
            lang="en"
          >
            {entry.title}
          </p>
          {size !== "sm" && (
            <p className="mt-[3cqw] truncate font-mono uppercase tracking-wider opacity-75" style={{ fontSize: "clamp(7px, 6cqw, 11px)" }}>
              {entry.creator}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Pattern({ kind, color }: { kind: LibraryEntry["pattern"]; color: string }) {
  const common = { className: "absolute inset-0 h-full w-full", "aria-hidden": true, preserveAspectRatio: "xMidYMid slice" } as const;
  switch (kind) {
    case "rings":
      return (
        <svg viewBox="0 0 100 150" {...common}>
          {[14, 24, 34, 44, 54].map((r) => (
            <circle key={r} cx="70" cy="45" r={r} fill="none" stroke={color} strokeOpacity={0.18} strokeWidth="1" />
          ))}
        </svg>
      );
    case "bars":
      return (
        <svg viewBox="0 0 100 150" {...common}>
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={i * 12} y={20 + (i % 3) * 8} width="5" height="80" fill={color} fillOpacity={0.08 + (i % 4) * 0.03} />
          ))}
        </svg>
      );
    case "grid":
      return (
        <svg viewBox="0 0 100 150" {...common}>
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`h${i}`} x1="0" x2="100" y1={i * 10} y2={i * 10} stroke={color} strokeOpacity={0.1} />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`v${i}`} y1="0" y2="100" x1={i * 10} x2={i * 10} stroke={color} strokeOpacity={0.1} />
          ))}
          <rect x="50" y="30" width="20" height="20" fill={color} fillOpacity={0.25} />
        </svg>
      );
    case "sun":
      return (
        <svg viewBox="0 0 100 150" {...common}>
          <circle cx="50" cy="58" r="26" fill={color} fillOpacity={0.22} />
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x="0" y={62 + i * 6} width="100" height="2.2" fill="black" fillOpacity={0.25} />
          ))}
        </svg>
      );
    case "wave":
      return (
        <svg viewBox="0 0 100 150" {...common}>
          {Array.from({ length: 6 }, (_, i) => (
            <path
              key={i}
              d={`M0 ${40 + i * 9} Q 25 ${30 + i * 9}, 50 ${40 + i * 9} T 100 ${40 + i * 9}`}
              fill="none"
              stroke={color}
              strokeOpacity={0.2}
              strokeWidth="1.2"
            />
          ))}
        </svg>
      );
    case "split":
      return (
        <svg viewBox="0 0 100 150" {...common}>
          <polygon points="0,0 100,0 0,95" fill={color} fillOpacity={0.12} />
          <line x1="0" y1="95" x2="100" y2="0" stroke={color} strokeOpacity={0.35} strokeWidth="0.8" />
        </svg>
      );
  }
}
