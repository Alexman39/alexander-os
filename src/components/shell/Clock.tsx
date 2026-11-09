"use client";

import { useNow } from "@/lib/client-stores";

export const TZ = "Europe/Athens";

function format(d: Date) {
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(d);
  const date = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: TZ }).format(d);
  return { time, date };
}

/** Real clock (not demo). Server renders a placeholder; client fills in. */
export function Clock({ className }: { className?: string }) {
  const now = useNow(10_000);
  const f = now !== null ? format(new Date(now)) : null;
  return (
    <div className={className} aria-label={f ? `${f.date}, ${f.time} Athens time` : undefined}>
      <span className="text-display block text-right text-lg font-medium leading-none tabular-nums text-ink">{f?.time ?? "--:--"}</span>
      <span className="text-meta block text-right text-ink-faint">{f?.date ?? " "}</span>
    </div>
  );
}

/** Minutes since midnight in Athens, or null before hydration. */
export function useAthensMinutes(): number | null {
  const now = useNow(60_000);
  if (now === null) return null;
  const [h, m] = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ })
    .format(new Date(now))
    .split(":")
    .map(Number);
  return (h % 24) * 60 + m;
}

export function useGreeting(): string {
  const mins = useAthensMinutes();
  if (mins === null) return "Welcome back";
  const h = Math.floor(mins / 60);
  return h < 5 ? "Late night" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
