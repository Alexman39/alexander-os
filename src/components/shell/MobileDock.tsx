"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { NAV, moduleForPath } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { Sheet } from "./Sheet";
import { useState } from "react";

/** Compact bottom navigation for small screens: 4 primary modules + More. */
export function MobileDock() {
  const pathname = usePathname();
  const active = moduleForPath(pathname);
  const [moreOpen, setMoreOpen] = useState(false);
  const dock = NAV.filter((m) => m.dock);
  const activeInDock = dock.some((m) => m.id === active.id);

  return (
    <>
      <nav
        aria-label="Modules"
        className="surface-3 fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 rounded-[14px] lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {dock.map((m) => {
            const isActive = m.id === active.id;
            const Icon = m.icon;
            return (
              <li key={m.id}>
                <Link
                  href={m.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                    isActive ? "text-ink" : "text-ink-faint",
                  )}
                >
                  <Icon aria-hidden className={cn("size-5", isActive && "text-lime")} strokeWidth={isActive ? 2.3 : 1.8} />
                  {m.label}
                  {isActive && (
                    <span aria-hidden className="absolute top-0 h-[3px] w-8 rounded-b-full bg-lime shadow-[0_0_12px_var(--color-lime)]" />
                  )}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              className={cn(
                "relative flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium",
                !activeInDock ? "text-ink" : "text-ink-faint",
              )}
            >
              <LayoutGrid aria-hidden className={cn("size-5", !activeInDock && "text-lime")} />
              More
              {!activeInDock && (
                <span aria-hidden className="absolute top-0 h-[3px] w-8 rounded-b-full bg-lime shadow-[0_0_12px_var(--color-lime)]" />
              )}
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onClose={() => setMoreOpen(false)} title="All modules" side="bottom">
        <ul className="grid grid-cols-3 gap-2 p-4">
          {NAV.map((m) => {
            const Icon = m.icon;
            const isActive = m.id === active.id;
            return (
              <li key={m.id}>
                <Link
                  href={m.href}
                  onClick={() => setMoreOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  style={{ "--item-accent": m.accent } as React.CSSProperties}
                  className={cn(
                    "flex aspect-square flex-col justify-between rounded-(--radius-tile) p-3 text-sm font-semibold",
                    isActive ? "bg-lime text-void" : "bg-white/[0.05] text-ink shadow-[inset_0_0_0_1px_var(--edge)]",
                  )}
                >
                  <Icon aria-hidden className={cn("size-5", !isActive && "text-(--item-accent)")} />
                  <span className="text-display">{m.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Sheet>
    </>
  );
}
