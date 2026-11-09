"use client";

import { useState, type FormEvent } from "react";
import { CheckSquare, Lightbulb, StickyNote } from "lucide-react";
import { cn } from "@/lib/cn";
import { useOs, type CaptureKind } from "./OsProvider";
import { Sheet } from "./Sheet";
import { DemoBadge, Kbd } from "@/components/ui/primitives";

const KINDS: Array<{ id: CaptureKind; label: string; icon: typeof CheckSquare }> = [
  { id: "task", label: "Task", icon: CheckSquare },
  { id: "note", label: "Note", icon: StickyNote },
  { id: "idea", label: "Idea", icon: Lightbulb },
];

/** Global quick capture — target: capture in under 15 seconds (PRODUCT.md). */
export function QuickCapture() {
  const { captureOpen, setCaptureOpen, capture } = useOs();
  const [kind, setKind] = useState<CaptureKind>("task");
  const [text, setText] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    capture(kind, t);
    setText("");
    setCaptureOpen(false);
  }

  return (
    <Sheet open={captureOpen} onClose={() => setCaptureOpen(false)} title="Quick capture" side="top">
      <form onSubmit={submit} className="flex flex-col gap-3 p-4">
        <div role="radiogroup" aria-label="Capture type" className="flex gap-1.5">
          {KINDS.map((k) => {
            const Icon = k.icon;
            const on = k.id === kind;
            return (
              <button
                key={k.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setKind(k.id)}
                className={cn(
                  "inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
                  on ? "bg-lime text-void" : "bg-white/[0.05] text-ink-muted hover:text-ink",
                )}
              >
                <Icon aria-hidden className="size-4" /> {k.label}
              </button>
            );
          })}
          <DemoBadge className="ml-auto self-center" label="Session only" />
        </div>
        <label className="sr-only" htmlFor="capture-text">
          What do you want to capture?
        </label>
        <input
          id="capture-text"
          data-autofocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={kind === "task" ? "e.g. Email landlord about the deposit" : "Type and press Enter"}
          className="h-12 rounded-md bg-white/[0.04] px-3 text-base text-ink shadow-[inset_0_0_0_1px_var(--edge-strong)] placeholder:text-ink-faint focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-lime)]"
        />
        <div className="flex items-center justify-between text-xs text-ink-faint">
          <span>
            <Kbd>Enter</Kbd> save · <Kbd>Esc</Kbd> cancel
          </span>
          <button
            type="submit"
            disabled={!text.trim()}
            className="rounded-md bg-lime px-4 py-2 text-sm font-semibold text-void transition-opacity disabled:opacity-40"
          >
            Capture
          </button>
        </div>
      </form>
    </Sheet>
  );
}
