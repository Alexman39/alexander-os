"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface BladeItem<T extends string> {
  id: T;
  label: string;
  count?: number;
  icon?: ReactNode;
  tone?: string;
}

/**
 * Blades — stacked, slanted tabs used for in-module sections. Selected blade
 * slides forward with an accent edge; others recede. Implements the ARIA
 * tabs pattern (vertical on desktop, horizontal on mobile) with roving focus.
 */
export function Blades<T extends string>({
  items,
  value,
  onChange,
  label,
  className,
  controls,
}: {
  items: BladeItem<T>[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  className?: string;
  controls?: string;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  function onKeyDown(e: KeyboardEvent, i: number) {
    const keys: Record<string, number> = {
      ArrowDown: 1,
      ArrowRight: 1,
      ArrowUp: -1,
      ArrowLeft: -1,
    };
    let next: number | null = null;
    if (e.key in keys) next = (i + keys[e.key] + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next === null) return;
    e.preventDefault();
    refs.current[next]?.focus();
    onChange(items[next].id);
  }
  return (
    <div
      role="tablist"
      aria-label={label}
      aria-orientation="vertical"
      className={cn("flex gap-1.5 lg:flex-col", className)}
    >
      {items.map((it, i) => {
        const on = it.id === value;
        return (
          <button
            key={it.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`blade-${it.id}`}
            aria-selected={on}
            aria-controls={controls}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(it.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            style={{ "--blade": it.tone ?? "var(--color-lime)" } as React.CSSProperties}
            className={cn(
              "group/blade relative flex min-h-11 shrink-0 items-center gap-2.5 overflow-hidden px-3.5 text-left text-sm font-semibold",
              "transition-[transform,background,color,box-shadow] duration-(--duration-spatial) ease-(--ease-glide)",
              "lg:min-h-14 lg:[clip-path:polygon(0_0,100%_0,calc(100%-14px)_100%,0_100%)]",
              "rounded-[4px] lg:rounded-none",
              on
                ? "bg-[linear-gradient(100deg,color-mix(in_oklab,var(--blade)_28%,#16204a),#121a3a_80%)] text-ink shadow-[inset_3px_0_0_var(--blade)] lg:translate-x-2"
                : "bg-white/[0.035] text-ink-faint hover:bg-white/[0.07] hover:text-ink",
            )}
          >
            {it.icon && <span className={cn("shrink-0", on ? "text-(--blade)" : "")}>{it.icon}</span>}
            <span className="text-display whitespace-nowrap">{it.label}</span>
            {it.count !== undefined && (
              <span
                className={cn("ml-auto pr-3 font-mono text-xs tabular-nums", on ? "text-(--blade)" : "text-ink-ghost")}
              >
                {it.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
