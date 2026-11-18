"use client";

import { Star } from "lucide-react";
import { Sheet } from "@/components/shell/Sheet";
import { Chip, DemoBadge, Eyebrow } from "@/components/ui/primitives";
import { Cover } from "./Cover";
import { cn } from "@/lib/cn";
import { STATUS_LABEL, TYPE_LABEL, type LibraryEntry, type Ownership, type ProgressStatus } from "@/lib/demo/library";

/**
 * Detail blade. Ownership and progress are deliberately separate controls —
 * owning something is not the same as finishing it (library.md).
 */
export function EntryDetail({
  entry,
  onClose,
  onChange,
}: {
  entry: LibraryEntry | null;
  onClose: () => void;
  onChange: (patch: Partial<LibraryEntry>) => void;
}) {
  return (
    <Sheet open={!!entry} onClose={onClose} title={entry ? entry.title : "Details"} side="right">
      {entry && (
        <div className="flex flex-col gap-6 p-5">
          <div className="relative -mx-5 -mt-5 overflow-hidden px-5 pt-6 pb-2">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{ background: `linear-gradient(180deg, ${entry.palette[1]}, transparent)` }}
            />
            <div className="relative flex gap-4">
              <Cover entry={entry} className="w-28 shrink-0 shadow-[0_20px_40px_-16px_rgb(0_0_0/0.9)]" />
              <div className="min-w-0">
                <Eyebrow>
                  {TYPE_LABEL[entry.type]} · {entry.year}
                </Eyebrow>
                <p className="mt-1 text-display text-xl leading-tight font-semibold">{entry.title}</p>
                <p className="text-sm text-ink-muted">{entry.creator}</p>
                <p className="mt-2 text-xs text-ink-faint">Updated {entry.updated}</p>
              </div>
            </div>
          </div>

          <DemoBadge label="Edits stay in this tab — not saved" className="self-start" />

          <fieldset>
            <legend className="mb-2 text-meta text-ink-faint">Ownership</legend>
            <div className="flex gap-1.5">
              {(["owned", "wishlist"] as Ownership[]).map((o) => (
                <Chip key={o} pressed={entry.ownership === o} onClick={() => onChange({ ownership: o })}>
                  {o === "owned" ? "Owned" : "Wishlist"}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-meta text-ink-faint">Status</legend>
            <div className="flex flex-wrap gap-1.5">
              {(["backlog", "in_progress", "completed"] as ProgressStatus[]).map((s) => (
                <Chip
                  key={s}
                  pressed={entry.status === s}
                  onClick={() =>
                    onChange({
                      status: s,
                      progress: s === "completed" ? 100 : s === "backlog" ? 0 : Math.max(entry.progress, 1),
                      progressLabel:
                        s === "completed" ? "Completed" : s === "backlog" ? "Not started" : entry.progressLabel,
                    })
                  }
                >
                  {STATUS_LABEL[s]}
                </Chip>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="progress" className="mb-2 flex justify-between text-meta text-ink-faint">
              <span>Progress</span>
              <span className="text-ink tabular-nums">{entry.progress}%</span>
            </label>
            <input
              id="progress"
              type="range"
              min={0}
              max={100}
              step={1}
              value={entry.progress}
              onChange={(e) => {
                const p = Number(e.target.value);
                onChange({
                  progress: p,
                  status:
                    p >= 100
                      ? "completed"
                      : p > 0
                        ? "in_progress"
                        : entry.status === "completed"
                          ? "backlog"
                          : entry.status,
                  progressLabel: `${p}%`,
                });
              }}
              className="w-full accent-lime"
            />
          </div>

          <fieldset>
            <legend className="mb-2 text-meta text-ink-faint">Rating</legend>
            <div role="radiogroup" aria-label="Rating" className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={entry.rating === n}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  onClick={() => onChange({ rating: entry.rating === n ? null : n })}
                  className="grid size-9 place-items-center rounded-md hover:bg-white/[0.06]"
                >
                  <Star
                    aria-hidden
                    className={cn(
                      "size-5 transition-transform",
                      entry.rating !== null && n <= entry.rating
                        ? "scale-110 fill-personal text-personal"
                        : "text-ink-ghost",
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs text-ink-faint">
                {entry.rating === null ? "Not rated" : `${entry.rating}/5`}
              </span>
            </div>
          </fieldset>

          <div>
            <label htmlFor="notes" className="mb-2 block text-meta text-ink-faint">
              Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              value={entry.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              placeholder="Thoughts, quotes, where you left off…"
              className="w-full resize-none rounded-md bg-white/[0.04] p-3 text-sm text-ink shadow-[inset_0_0_0_1px_var(--edge-strong)] placeholder:text-ink-faint focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-lime)]"
            />
          </div>

          <dl className="grid grid-cols-2 gap-3 border-t border-white/[0.08] pt-4 text-sm">
            {entry.meta.map(([k, v]) => (
              <div key={k}>
                <dt className="text-meta text-ink-faint">{k}</dt>
                <dd className="text-ink">{v}</dd>
              </div>
            ))}
            <div className="col-span-2">
              <dt className="text-meta text-ink-faint">Metadata source</dt>
              <dd className="text-ink-muted">Manual demo entry — no provider attribution required</dd>
            </div>
          </dl>
        </div>
      )}
    </Sheet>
  );
}
