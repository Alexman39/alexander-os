"use client";

import { createContext, useContext, useId, type ReactNode } from "react";
import { AlertTriangle, Inbox, RotateCw } from "lucide-react";
import { cn } from "@/lib/cn";
import { DemoBadge, Eyebrow } from "./primitives";

/**
 * Every widget must support real, loading, empty, error and demo states
 * (docs/modules/dashboard.md). The prototype only has demo data, so the
 * Home "state preview" switch forces the other states for design review.
 */
export type TileState = "demo" | "loading" | "empty" | "error";
export const TileStateContext = createContext<TileState>("demo");

interface TileProps {
  title: string;
  eyebrow?: string;
  tone?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
  emptyText?: string;
  /** Hero tiles get the chamfer cut and a stronger surface. */
  variant?: "standard" | "hero" | "flat";
  /** Hide the inline demo badge when the parent surface already shows one. */
  hideDemoBadge?: boolean;
  /** Override global preview state for this tile. */
  state?: TileState;
}

export function Tile({
  title,
  eyebrow,
  tone = "var(--color-lime)",
  icon,
  action,
  className,
  bodyClassName,
  children,
  emptyText = "Nothing here yet.",
  variant = "standard",
  hideDemoBadge,
  state: stateOverride,
}: TileProps) {
  const ctxState = useContext(TileStateContext);
  const state = stateOverride ?? ctxState;
  const id = useId();

  return (
    <section
      aria-labelledby={id}
      aria-busy={state === "loading" || undefined}
      style={{ "--tile-tone": tone } as React.CSSProperties}
      className={cn(
        "group/tile relative flex min-w-0 flex-col overflow-hidden rounded-(--radius-tile)",
        "transition-[transform,box-shadow] duration-(--duration-spatial) ease-(--ease-glide)",
        "focus-within:-translate-y-0.5 hover:-translate-y-0.5",
        variant === "hero" ? "surface-3 chamfer" : variant === "flat" ? "bg-white/[0.025]" : "surface-1",
        className,
      )}
    >
      {/* edge illumination on hover/focus — tactile selection */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-(--duration-spatial) group-focus-within/tile:opacity-100 group-hover/tile:opacity-100"
        style={{
          boxShadow:
            "inset 0 0 0 1px color-mix(in oklab, var(--tile-tone) 45%, transparent), 0 0 36px -10px color-mix(in oklab, var(--tile-tone) 60%, transparent)",
        }}
      />
      {/* tone stripe */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: "var(--tile-tone)", opacity: 0.85 }}
      />

      <header className="relative flex items-start justify-between gap-3 px-4 pt-3.5 pb-2 sm:px-5">
        <div className="min-w-0">
          {eyebrow && <Eyebrow tone="var(--tile-tone)">{eyebrow}</Eyebrow>}
          <h2 id={id} className="mt-0.5 flex items-center gap-2 truncate text-display text-base font-semibold text-ink">
            {icon}
            {title}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {state === "demo" && !hideDemoBadge && <DemoBadge label="Demo" />}
          {state === "demo" && action}
        </div>
      </header>

      <div className={cn("relative flex-1 px-4 pb-4 sm:px-5", bodyClassName)}>
        {state === "demo" && children}
        {state === "loading" && <TileSkeleton />}
        {state === "empty" && (
          <div className="flex h-full min-h-20 flex-col items-start justify-center gap-1.5 text-sm text-ink-muted">
            <Inbox aria-hidden className="size-5 text-ink-faint" />
            {emptyText}
          </div>
        )}
        {state === "error" && (
          <div role="alert" className="flex h-full min-h-20 flex-col items-start justify-center gap-2 text-sm">
            <span className="flex items-center gap-2 text-danger">
              <AlertTriangle aria-hidden className="size-4" /> Couldn&apos;t load {title.toLowerCase()}.
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-[4px] bg-white/[0.06] px-2.5 py-1.5 text-xs text-ink hover:bg-white/[0.1]"
            >
              <RotateCw aria-hidden className="size-3.5" /> Retry
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function TileSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 py-1" aria-label="Loading">
      <div className="skeleton h-3 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-3 w-2/3" />
    </div>
  );
}
