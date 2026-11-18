"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { BookOpen, Clapperboard, Gamepad2, Layers, PanelRightOpen, Plus, Search, Star } from "lucide-react";
import { Blades, type BladeItem } from "@/components/ui/Blades";
import { Chip, DemoBadge, Eyebrow, Meter, PageHeading } from "@/components/ui/primitives";
import { Cover } from "./Cover";
import { EntryDetail } from "./EntryDetail";
import { useOs } from "@/components/shell/OsProvider";
import { cn } from "@/lib/cn";
import {
  DEMO_LIBRARY,
  STATUS_LABEL,
  TYPE_LABEL,
  type LibraryEntry,
  type MediaType,
  type Ownership,
  type ProgressStatus,
} from "@/lib/demo/library";

type TypeFilter = "ALL" | MediaType;
type SortKey = "recent" | "title" | "rating";

const SHELVES: Array<{ status: ProgressStatus; title: string; hint: string }> = [
  { status: "in_progress", title: "In progress", hint: "Pick up where you left off" },
  { status: "backlog", title: "Backlog", hint: "Owned or wished, not started" },
  { status: "completed", title: "Completed", hint: "Finished — with your ratings" },
];

export function LibraryView() {
  const params = useSearchParams();
  const { setTint } = useOs();
  const [entries, setEntries] = useState<LibraryEntry[]>(DEMO_LIBRARY);
  const [type, setType] = useState<TypeFilter>("ALL");
  const [ownership, setOwnership] = useState<"any" | Ownership>("any");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [focusId, setFocusId] = useState<string>(params.get("focus") ?? "L-1");
  const [detailId, setDetailId] = useState<string | null>(null);

  const focused = entries.find((e) => e.id === focusId) ?? entries[0];

  // Tint the ambient field with the focused item — the stage "takes over" the room.
  useEffect(() => {
    setTint(focused.palette[1]);
  }, [focused, setTint]);
  useEffect(() => () => setTint(null), [setTint]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = entries.filter(
      (e) =>
        (type === "ALL" || e.type === type) &&
        (ownership === "any" || e.ownership === ownership) &&
        (!q || `${e.title} ${e.creator} ${e.tags.join(" ")}`.toLowerCase().includes(q)),
    );
    if (sort === "title") list.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "rating") list.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    return list;
  }, [entries, type, ownership, query, sort]);

  const count = (t: TypeFilter) => entries.filter((e) => t === "ALL" || e.type === t).length;
  const blades: BladeItem<TypeFilter>[] = [
    {
      id: "ALL",
      label: "Everything",
      count: count("ALL"),
      icon: <Layers className="size-4" aria-hidden />,
      tone: "var(--color-lime)",
    },
    {
      id: "BOOK",
      label: "Books",
      count: count("BOOK"),
      icon: <BookOpen className="size-4" aria-hidden />,
      tone: "var(--color-system)",
    },
    {
      id: "GAME",
      label: "Games",
      count: count("GAME"),
      icon: <Gamepad2 className="size-4" aria-hidden />,
      tone: "var(--color-intel)",
    },
    {
      id: "MOVIE",
      label: "Films",
      count: count("MOVIE"),
      icon: <Clapperboard className="size-4" aria-hidden />,
      tone: "var(--color-personal)",
    },
  ];

  const update = (id: string, patch: Partial<LibraryEntry>) =>
    setEntries((es) => es.map((e) => (e.id === id ? { ...e, ...patch, updated: "just now" } : e)));

  /** 2-D roving focus across shelves: ←/→ within a shelf, ↑/↓ between shelves. */
  function onCoverKey(e: KeyboardEvent<HTMLButtonElement>) {
    const el = e.currentTarget;
    const shelf = Number(el.dataset.shelf);
    const idx = Number(el.dataset.index);
    let target: HTMLElement | null = null;
    const q = (s: number, i: number) => document.querySelector<HTMLElement>(`[data-shelf="${s}"][data-index="${i}"]`);
    const shelfLen = (s: number) => document.querySelectorAll(`[data-shelf="${s}"]`).length;
    if (e.key === "ArrowRight") target = q(shelf, idx + 1);
    else if (e.key === "ArrowLeft") target = q(shelf, idx - 1);
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const dir = e.key === "ArrowDown" ? 1 : -1;
      for (let s = shelf + dir; s >= 0 && s < SHELVES.length; s += dir) {
        const len = shelfLen(s);
        if (len) {
          target = q(s, Math.min(idx, len - 1));
          break;
        }
      }
    } else return;
    e.preventDefault();
    target?.focus();
  }

  return (
    <div className="mx-auto flex max-w-[1520px] flex-col gap-6 pt-2 lg:pt-4">
      <PageHeading index="06 · Library" title="Library" kicker={<DemoBadge />}>
        <button
          type="button"
          disabled
          title="Catalog search arrives in Stage 3 — no metadata provider connected"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-white/[0.05] px-3.5 text-sm text-ink-faint shadow-[inset_0_0_0_1px_var(--edge)] disabled:cursor-not-allowed"
        >
          <Plus aria-hidden className="size-4" /> Add from catalog <span className="text-xs">(Stage 3)</span>
        </button>
      </PageHeading>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-8">
        {/* Blades */}
        <div className="flex min-w-0 flex-col gap-4">
          <Blades
            items={blades}
            value={type}
            onChange={setType}
            label="Media type"
            controls="library-shelves"
            className="-mx-4 scrollbar-none overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0"
          />
          <div className="hidden lg:block">
            <Eyebrow className="mb-2">Ownership</Eyebrow>
            <OwnershipFilter value={ownership} onChange={setOwnership} vertical />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Stage entry={focused} onOpen={() => setDetailId(focused.id)} />

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <Search aria-hidden className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" />
              <label htmlFor="lib-search" className="sr-only">
                Search library
              </label>
              <input
                id="lib-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, creator, tag"
                className="h-10 w-full rounded-md bg-white/[0.04] pr-3 pl-9 text-sm text-ink shadow-[inset_0_0_0_1px_var(--edge)] placeholder:text-ink-faint focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-lime)]"
              />
            </div>
            <div className="lg:hidden">
              <OwnershipFilter value={ownership} onChange={setOwnership} />
            </div>
            <label className="ml-auto flex items-center gap-2 text-xs text-ink-faint">
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-10 rounded-md bg-white/[0.04] px-2 text-sm text-ink shadow-[inset_0_0_0_1px_var(--edge)]"
              >
                <option value="recent">Recently updated</option>
                <option value="title">Title</option>
                <option value="rating">Rating</option>
              </select>
            </label>
          </div>

          {/* Shelves */}
          <div id="library-shelves" role="tabpanel" aria-labelledby={`blade-${type}`} className="flex flex-col gap-7">
            {filtered.length === 0 && (
              <div className="flex flex-col items-start gap-2 rounded-(--radius-tile) p-6 surface-1">
                <p className="text-display text-lg font-semibold">No matches on these shelves.</p>
                <p className="text-sm text-ink-muted">
                  Try another type or clear the search. Manual entry will be available when no catalog match exists.
                </p>
              </div>
            )}
            {SHELVES.map((s, si) => {
              const items = filtered.filter((e) => e.status === s.status);
              if (!items.length) return null;
              return (
                <section key={s.status} aria-labelledby={`shelf-${s.status}`}>
                  <div className="mb-3 flex items-baseline gap-3">
                    <h2 id={`shelf-${s.status}`} className="text-display text-xl font-semibold">
                      {s.title}
                    </h2>
                    <span className="font-mono text-xs text-ink-faint">{items.length}</span>
                    <span className="hidden text-xs text-ink-faint sm:inline">— {s.hint}</span>
                  </div>
                  <div className="relative">
                    <ul className="-mx-4 scrollbar-none flex snap-x gap-4 overflow-x-auto px-4 pt-2 pb-5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
                      {items.map((e, i) => (
                        <li key={e.id} className="w-[108px] shrink-0 snap-start sm:w-[124px]">
                          <button
                            type="button"
                            data-shelf={si}
                            data-index={i}
                            onKeyDown={onCoverKey}
                            onFocus={() => setFocusId(e.id)}
                            onMouseEnter={() => setFocusId(e.id)}
                            onClick={() => {
                              setFocusId(e.id);
                              setDetailId(e.id);
                            }}
                            aria-label={`${e.title}, ${TYPE_LABEL[e.type]} by ${e.creator}. ${STATUS_LABEL[e.status]}, ${e.ownership}. Open details`}
                            className={cn(
                              "group/cover block w-full rounded-[5px] text-left outline-offset-4",
                              "transition-transform duration-(--duration-spatial) ease-(--ease-snap)",
                              e.id === focused.id ? "-translate-y-2 scale-[1.04]" : "hover:-translate-y-1",
                            )}
                          >
                            <Cover
                              entry={e}
                              size="sm"
                              className={cn(
                                "shadow-[0_18px_30px_-14px_rgb(0_0_0/0.9)] transition-shadow duration-(--duration-spatial)",
                                e.id === focused.id &&
                                  "shadow-[0_0_0_2px_var(--color-lime),0_0_28px_-4px_var(--color-lime),0_24px_40px_-16px_rgb(0_0_0/0.9)]",
                              )}
                            />
                            <span className="mt-2 block truncate text-xs font-medium text-ink-muted group-hover/cover:text-ink">
                              {e.title}
                            </span>
                            <span className="flex items-center gap-1.5 text-[11px] text-ink-faint">
                              {e.ownership === "wishlist" ? (
                                <span className="text-personal">Wishlist</span>
                              ) : (
                                <span>Owned</span>
                              )}
                              {e.status === "in_progress" && (
                                <span className="ml-auto text-lime tabular-nums">{e.progress}%</span>
                              )}
                              {e.rating !== null && (
                                <span className="ml-auto flex items-center gap-0.5 text-personal">
                                  <Star aria-hidden className="size-3 fill-current" />
                                  {e.rating}
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    {/* shelf ledge */}
                    <div
                      aria-hidden
                      className="absolute inset-x-0 bottom-12 -z-10 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent sm:block"
                    />
                  </div>
                </section>
              );
            })}
          </div>
          <p className="text-xs text-ink-faint">
            Covers are generated placeholders · metadata provider: none connected · edits apply to this tab only.
          </p>
        </div>
      </div>

      <EntryDetail
        entry={entries.find((e) => e.id === detailId) ?? null}
        onClose={() => setDetailId(null)}
        onChange={(patch) => detailId && update(detailId, patch)}
      />
    </div>
  );
}

function OwnershipFilter({
  value,
  onChange,
  vertical,
}: {
  value: "any" | Ownership;
  onChange: (v: "any" | Ownership) => void;
  vertical?: boolean;
}) {
  const opts: Array<["any" | Ownership, string]> = [
    ["any", "Any"],
    ["owned", "Owned"],
    ["wishlist", "Wishlist"],
  ];
  return (
    <div role="group" aria-label="Ownership" className={cn("flex gap-1.5", vertical && "flex-wrap")}>
      {opts.map(([v, l]) => (
        <Chip key={v} pressed={value === v} onClick={() => onChange(v)}>
          {l}
        </Chip>
      ))}
    </div>
  );
}

function Stage({ entry, onOpen }: { entry: LibraryEntry; onOpen: () => void }) {
  return (
    <section
      aria-label="Selected item"
      aria-live="polite"
      className="relative overflow-hidden rounded-(--radius-panel) p-4 surface-2 chamfer sm:p-6"
    >
      {/* colour wash from cover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 transition-[background] duration-700"
        style={{ background: `radial-gradient(80% 120% at 0% 0%, ${entry.palette[1]}, transparent 70%)` }}
      />
      <div
        key={entry.id}
        className="relative grid animate-rise grid-cols-[96px_1fr] gap-4 sm:grid-cols-[150px_1fr] sm:gap-7 xl:grid-cols-[170px_1fr_260px]"
      >
        <div className="[perspective:900px]">
          <Cover
            entry={entry}
            size="lg"
            className="origin-left [transform:rotateY(8deg)] shadow-[0_30px_50px_-20px_rgb(0_0_0/0.95)] transition-transform duration-500"
          />
        </div>
        <div className="flex min-w-0 flex-col">
          <Eyebrow tone={entry.palette[2] === "#1b1b1b" ? undefined : "var(--color-personal)"}>
            {TYPE_LABEL[entry.type]} · {entry.year}
          </Eyebrow>
          <h2 className="mt-1 text-display text-2xl leading-[1.05] font-semibold sm:text-4xl">{entry.title}</h2>
          <p className="mt-1 text-sm text-ink-muted">{entry.creator}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Chip tone={entry.ownership === "owned" ? "var(--color-positive)" : "var(--color-personal)"}>
              {entry.ownership === "owned" ? "Owned" : "Wishlist"}
            </Chip>
            <Chip
              tone={
                entry.status === "in_progress"
                  ? "var(--color-lime)"
                  : entry.status === "completed"
                    ? "var(--color-system)"
                    : undefined
              }
            >
              {STATUS_LABEL[entry.status]}
            </Chip>
            {entry.tags.map((t) => (
              <Chip key={t}>#{t}</Chip>
            ))}
          </div>
          <div className="mt-auto hidden pt-4 sm:block">
            <button
              type="button"
              onClick={onOpen}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-personal px-4 text-sm font-semibold text-void transition-transform hover:-translate-y-px"
            >
              <PanelRightOpen aria-hidden className="size-4" /> Details & progress
            </button>
          </div>
        </div>
        <dl className="col-span-2 grid grid-cols-2 gap-x-4 gap-y-3 text-sm xl:col-span-1 xl:grid-cols-1 xl:border-l xl:border-white/[0.08] xl:pl-6">
          <div className="col-span-2 xl:col-span-1">
            <dt className="text-meta text-ink-faint">Progress</dt>
            <dd className="mt-1.5">
              <span className="mb-1 flex justify-between text-xs text-ink-muted">
                <span>{entry.progressLabel}</span>
                <span className="tabular-nums">{entry.progress}%</span>
              </span>
              <Meter value={entry.progress} label={`${entry.title} progress`} />
            </dd>
          </div>
          <div>
            <dt className="text-meta text-ink-faint">Rating</dt>
            <dd className="mt-1 flex gap-0.5" aria-label={entry.rating === null ? "Not rated" : `${entry.rating} of 5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  aria-hidden
                  className={cn(
                    "size-4",
                    entry.rating !== null && i < entry.rating ? "fill-personal text-personal" : "text-ink-ghost",
                  )}
                />
              ))}
            </dd>
          </div>
          {entry.meta.map(([k, v]) => (
            <div key={k}>
              <dt className="text-meta text-ink-faint">{k}</dt>
              <dd className="mt-0.5 text-ink">{v}</dd>
            </div>
          ))}
          {entry.notes && (
            <div className="col-span-2 xl:col-span-1">
              <dt className="text-meta text-ink-faint">Note</dt>
              <dd className="mt-0.5 line-clamp-2 text-ink-muted italic">“{entry.notes}”</dd>
            </div>
          )}
        </dl>
        <button
          type="button"
          onClick={onOpen}
          className="col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-personal text-sm font-semibold text-void sm:hidden"
        >
          <PanelRightOpen aria-hidden className="size-4" /> Details & progress
        </button>
      </div>
    </section>
  );
}
