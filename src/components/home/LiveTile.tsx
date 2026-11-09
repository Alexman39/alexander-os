"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, Pause, Play } from "lucide-react";
import { useOs } from "@/components/shell/OsProvider";

/**
 * Live tile body — cycles through faces with a vertical flip, the way a
 * live surface "breathes". Pauses on hover/focus, never auto-rotates under
 * reduced motion, and always offers manual next/pause controls so no
 * information is locked behind animation.
 */
export function LiveFaces({ faces, interval = 6500, label }: { faces: ReactNode[]; interval?: number; label: string }) {
  const { reducedMotion } = useOs();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const auto = !reducedMotion && !paused && !hovering;

  useEffect(() => {
    if (!auto || faces.length < 2) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % faces.length), interval);
    return () => window.clearInterval(t);
  }, [auto, faces.length, interval]);

  return (
    <div
      className="relative flex h-full flex-col"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
    >
      <div className="relative flex-1 [perspective:800px]" aria-live={auto ? "off" : "polite"} aria-roledescription="live tile" aria-label={label}>
        <div key={i} className="live-face-enter h-full">
          {faces[i]}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex gap-1" aria-hidden>
          {faces.map((_, n) => (
            <span
              key={n}
              className={`h-1 rounded-full transition-all duration-300 ${n === i ? "w-5 bg-(--tile-tone)" : "w-1.5 bg-white/20"}`}
            />
          ))}
        </div>
        <span className="sr-only">
          Item {i + 1} of {faces.length}
        </span>
        <div className="ml-auto flex gap-1">
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Resume rotation" : "Pause rotation"}
              className="grid size-8 place-items-center rounded-md text-ink-faint hover:bg-white/[0.08] hover:text-ink"
            >
              {paused ? <Play aria-hidden className="size-3.5" /> : <Pause aria-hidden className="size-3.5" />}
            </button>
          )}
          <button
            type="button"
            onClick={() => setI((x) => (x + 1) % faces.length)}
            aria-label="Next item"
            className="grid size-8 place-items-center rounded-md text-ink-faint hover:bg-white/[0.08] hover:text-ink"
          >
            <ChevronDown aria-hidden className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
