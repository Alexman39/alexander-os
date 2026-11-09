"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type KeyboardEvent } from "react";
import { NAV, moduleForPath } from "@/lib/nav";
import { cn } from "@/lib/cn";

/**
 * Crossbar — horizontal spatial navigation.
 * The active module is "lit": large icon, lime underglow, visible label.
 * Neighbours recede (smaller, dimmer). Keyboard: one tab stop (roving
 * tabindex); ←/→ move, Home/End jump, Enter/Space follow the link.
 */
export function Crossbar() {
  const pathname = usePathname();
  const active = moduleForPath(pathname);
  const activeIdx = NAV.findIndex((m) => m.id === active.id);
  const [focusIdx, setFocusIdx] = useState<number | null>(null);
  const refs = useRef<Array<HTMLAnchorElement | null>>([]);

  const rovingIdx = focusIdx ?? activeIdx;

  function onKeyDown(e: KeyboardEvent<HTMLAnchorElement>, i: number) {
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % NAV.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + NAV.length) % NAV.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = NAV.length - 1;
    else if (e.key === " ") {
      e.preventDefault();
      refs.current[i]?.click();
      return;
    } else return;
    e.preventDefault();
    setFocusIdx(next);
    refs.current[next]?.focus();
  }

  return (
    <nav aria-label="Modules" className="relative">
      <ul className="flex items-end gap-0.5">
        {NAV.map((m, i) => {
          const isActive = m.id === active.id;
          const distance = Math.abs(i - activeIdx);
          const Icon = m.icon;
          return (
            <li key={m.id} className="relative">
              <Link
                ref={(el) => {
                  refs.current[i] = el;
                }}
                href={m.href}
                tabIndex={i === rovingIdx ? 0 : -1}
                aria-current={isActive ? "page" : undefined}
                onKeyDown={(e) => onKeyDown(e, i)}
                onFocus={() => setFocusIdx(i)}
                onBlur={() => setFocusIdx(null)}
                style={{ "--item-accent": m.accent } as React.CSSProperties}
                className={cn(
                  "group/xb relative flex h-14 items-center gap-2 rounded-md px-2.5 outline-offset-0",
                  "transition-[color,opacity,transform] duration-(--duration-spatial) ease-(--ease-glide)",
                  isActive ? "text-ink" : "text-ink-faint hover:text-ink focus-visible:text-ink",
                  !isActive && distance > 2 && "opacity-70 hover:opacity-100 focus-visible:opacity-100",
                )}
              >
                <span
                  className={cn(
                    "grid place-items-center rounded-[5px] transition-all duration-(--duration-spatial) ease-(--ease-snap)",
                    isActive
                      ? "size-9 bg-[color-mix(in_oklab,var(--item-accent)_16%,transparent)] text-(--item-accent) shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--item-accent)_40%,transparent),0_0_22px_-4px_var(--item-accent)]"
                      : "size-8 group-hover/xb:scale-110 group-focus-visible/xb:scale-110",
                  )}
                >
                  <Icon aria-hidden className={isActive ? "size-[18px]" : "size-[17px]"} strokeWidth={isActive ? 2.2 : 1.8} />
                </span>
                {/* Label: always present for AT; visually expands when active/hovered/focused */}
                <span
                  className={cn(
                    "text-display overflow-hidden whitespace-nowrap text-sm font-semibold transition-[max-width,opacity] duration-(--duration-spatial) ease-(--ease-glide)",
                    isActive
                      ? "max-w-32 opacity-100"
                      : "max-w-0 opacity-0 group-hover/xb:max-w-32 group-hover/xb:opacity-100 group-focus-visible/xb:max-w-32 group-focus-visible/xb:opacity-100",
                  )}
                >
                  {m.label}
                </span>
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-x-2 -bottom-[3px] h-[3px] rounded-full bg-lime shadow-[0_0_14px_2px_var(--color-lime)]"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
