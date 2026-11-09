"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Command, Plus } from "lucide-react";
import { NAV, moduleForPath } from "@/lib/nav";
import { AmbientBackground } from "./AmbientBackground";
import { Crossbar } from "./Crossbar";
import { MobileDock } from "./MobileDock";
import { CommandPalette } from "./CommandPalette";
import { QuickCapture } from "./QuickCapture";
import { Clock } from "./Clock";
import { Wordmark } from "./Wordmark";
import { useOs } from "./OsProvider";
import { DemoBadge, Kbd } from "@/components/ui/primitives";

function isTypingTarget(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const mod = moduleForPath(pathname);
  const { setPaletteOpen, setCaptureOpen, paletteOpen, captureOpen, toasts, tint } = useOs();

  // Spatial transition direction: moving right along the crossbar slides
  // content in from the right, and vice versa (state derived during render).
  const idx = NAV.indexOf(mod);
  const [nav, setNav] = useState({ idx, direction: "right" as "right" | "left" });
  if (nav.idx !== idx) setNav({ idx, direction: idx >= nav.idx ? "right" : "left" });
  const direction = nav.direction;

  // Global shortcuts. Standard Tab/Enter/Escape always work regardless.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      if (paletteOpen || captureOpen || isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.querySelector("dialog[open]")) return;
      if (e.key === "c") {
        e.preventDefault();
        setCaptureOpen(true);
      } else if (e.key === "[" || e.key === "]") {
        const next = (idx + (e.key === "]" ? 1 : -1) + NAV.length) % NAV.length;
        router.push(NAV[next].href);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, router, setPaletteOpen, setCaptureOpen, paletteOpen, captureOpen]);

  const [a, b, c] = mod.aurora;
  const vars = {
    "--module-accent": mod.accent,
    "--aurora-a": tint ?? a,
    "--aurora-b": b,
    "--aurora-c": c,
  } as React.CSSProperties;

  return (
    <div style={vars} className="relative isolate flex min-h-dvh flex-col overflow-x-clip">
      <a
        href="#main"
        className="fixed left-3 top-3 z-50 -translate-y-20 rounded-md bg-lime px-3 py-2 text-sm font-semibold text-void focus:translate-y-0"
      >
        Skip to content
      </a>
      <AmbientBackground />

      {/* Top chrome */}
      <header className="sticky top-0 z-30">
        <div className="flex items-center gap-4 bg-abyss/70 px-4 pb-3 pt-3 shadow-[0_1px_0_rgb(255_255_255/0.05),0_12px_30px_-18px_rgb(0_0_0/0.9)] backdrop-blur-xl backdrop-saturate-150 sm:px-6 lg:px-10 lg:pt-4">
          <Wordmark />
          <div className="hidden min-w-0 flex-1 justify-center lg:flex">
            <Crossbar />
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3 lg:ml-0">
            <DemoBadge className="hidden sm:inline-flex" label="Demo mode" />
            <button
              type="button"
              onClick={() => setCaptureOpen(true)}
              aria-label="Quick capture (C)"
              title="Quick capture (C)"
              className="grid size-10 place-items-center rounded-md bg-lime text-void shadow-[0_0_20px_-6px_var(--color-lime)] transition-transform duration-(--duration-quick) hover:scale-105 active:scale-95"
            >
              <Plus aria-hidden className="size-5" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Open command palette (Ctrl+K)"
              className="hidden h-10 items-center gap-2 rounded-md bg-white/[0.05] px-3 text-sm text-ink-muted shadow-[inset_0_0_0_1px_var(--edge)] hover:text-ink sm:flex"
            >
              <Command aria-hidden className="size-4" />
              <Kbd>Ctrl K</Kbd>
            </button>
            <Clock className="hidden xl:block" />
          </div>
        </div>
      </header>

      <main
        id="main"
        tabIndex={-1}
        key={pathname}
        className={`relative flex-1 px-4 pb-28 pt-2 outline-none sm:px-6 lg:px-10 lg:pb-12 ${
          direction === "right" ? "animate-enter-right" : "animate-enter-left"
        }`}
      >
        {children}
      </main>

      <MobileDock />
      <CommandPalette />
      <QuickCapture />

      {/* Toasts */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6"
      >
        {toasts.map((t) => (
          <div key={t.id} className="surface-3 animate-rise rounded-md px-4 py-2.5 text-sm text-ink">
            <span className="mr-2 inline-block size-1.5 rounded-full bg-lime align-middle shadow-[0_0_8px_var(--color-lime)]" />
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}
