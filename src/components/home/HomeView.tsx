"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CalendarClock,
  Check,
  CornerDownLeft,
  Gauge,
  LibraryBig,
  Radar,
  Sparkles,
  Target,
  FolderKanban,
  Plus,
} from "lucide-react";
import { Tile, TileStateContext, type TileState } from "@/components/ui/Tile";
import { Chip, DemoBadge, Eyebrow, Kbd, Meter, Ring } from "@/components/ui/primitives";
import { LiveFaces } from "./LiveTile";
import { Cover } from "@/components/library/Cover";
import { useOs } from "@/components/shell/OsProvider";
import { useAthensMinutes, useGreeting } from "@/components/shell/Clock";
import { cn } from "@/lib/cn";
import { NAV } from "@/lib/nav";
import {
  DEMO_BRIEFING,
  DEMO_FOCUS,
  DEMO_GOALS,
  DEMO_PROJECTS,
  DEMO_SCHEDULE,
  type DemoScheduleItem,
} from "@/lib/demo/home";
import { DEMO_EVENTS, DEMO_INTERESTS } from "@/lib/demo/intelligence";
import { DEMO_LIBRARY } from "@/lib/demo/library";
import { computeRelevance } from "@/lib/relevance";
import { SUGGESTED_PROMPTS } from "@/lib/demo/assistant";

const KIND_TONE: Record<DemoScheduleItem["kind"], string> = {
  university: "var(--color-system)",
  work: "var(--color-intel)",
  life: "var(--color-personal)",
  health: "var(--color-positive)",
};

const TONE_VAR = {
  lime: "var(--color-lime)",
  personal: "var(--color-personal)",
  system: "var(--color-system)",
  positive: "var(--color-positive)",
} as const;

export function HomeView() {
  const [previewState, setPreviewState] = useState<TileState>("demo");
  const greeting = useGreeting();
  const { setCaptureOpen } = useOs();

  return (
    <TileStateContext.Provider value={previewState}>
      <div className="mx-auto flex max-w-[1520px] flex-col gap-5">
        {/* Identity header */}
        <header className="flex flex-wrap items-end justify-between gap-4 pt-2 lg:pt-4">
          <div>
            <Eyebrow tone="var(--color-lime)">01 · Home</Eyebrow>
            <h1 className="mt-1 text-display text-[2.6rem] leading-[0.95] font-semibold sm:text-6xl lg:text-7xl">
              {greeting},
              <br className="sm:hidden" /> <span className="text-ink-muted">Alexander.</span>
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setCaptureOpen(true)}
            className="group flex h-12 w-full items-center gap-3 rounded-md px-4 text-left text-sm text-ink-faint surface-1 transition-shadow hover:text-ink-muted sm:w-[380px]"
          >
            <Plus aria-hidden className="size-4 text-lime" />
            Capture a task, note or idea…
            <span className="ml-auto">
              <Kbd>C</Kbd>
            </span>
          </button>
        </header>

        {/* Asymmetric tile field */}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-6 xl:grid-cols-12 xl:gap-4">
          <BriefingHero className="md:col-span-6 xl:col-span-6 xl:row-span-2" />
          <FocusTile className="md:col-span-3 xl:col-span-3 xl:row-span-2" />
          <TodayTile className="md:col-span-3 xl:col-span-3 xl:row-span-3" />
          <IntelLiveTile className="md:col-span-3 xl:col-span-3" />
          <LibraryNowTile className="md:col-span-3 xl:col-span-3" />
          <ProgressTile className="md:col-span-6 xl:col-span-3" />
          <ProjectsTile className="md:col-span-6 xl:col-span-5" />
          <AssistantEntry className="md:col-span-3 xl:col-span-4" />
          <ModuleShortcuts className="md:col-span-3 xl:col-span-3" />
        </div>

        <StateReviewBar value={previewState} onChange={setPreviewState} />
      </div>
    </TileStateContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */

function BriefingHero({ className }: { className?: string }) {
  return (
    <Tile
      variant="hero"
      tone="var(--color-intel)"
      eyebrow="Intelligence · sample briefing"
      title={DEMO_BRIEFING.title}
      icon={<Radar aria-hidden className="size-4 text-intel" />}
      className={cn("min-h-[340px]", className)}
      bodyClassName="flex flex-col"
      emptyText="No briefing yet — empty briefings are valid when nothing crossed your relevance threshold."
    >
      {/* orbit illustration */}
      <svg
        aria-hidden
        viewBox="0 0 400 400"
        className="pointer-events-none absolute -top-20 -right-24 h-[420px] w-[420px] opacity-60"
      >
        <defs>
          <radialGradient id="core" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ad8cff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ad8cff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="120" fill="url(#core)" />
        {[70, 110, 150, 190].map((r, i) => (
          <ellipse
            key={r}
            cx="200"
            cy="200"
            rx={r}
            ry={r * 0.42}
            fill="none"
            stroke={i % 2 ? "#52c7ff" : "#ad8cff"}
            strokeOpacity={0.35 - i * 0.05}
            transform={`rotate(${-18 + i * 9} 200 200)`}
          />
        ))}
        <circle cx="318" cy="168" r="4" fill="#c8ff3c" />
        <circle cx="96" cy="232" r="3" fill="#52c7ff" />
      </svg>

      <p className="relative max-w-xl text-[15px] leading-relaxed text-ink-muted">{DEMO_BRIEFING.summary}</p>

      <ol className="relative mt-5 flex flex-col gap-1">
        {DEMO_BRIEFING.highlights.map((h, n) => (
          <li key={h.id}>
            <Link
              href={`/intelligence#${h.id}`}
              className="group/hl -mx-2 flex items-start gap-4 rounded-md px-2 py-2.5 transition-colors hover:bg-white/[0.05]"
            >
              <span className="w-7 shrink-0 text-display text-2xl leading-none font-semibold text-intel/70 group-hover/hl:text-intel">
                {String(n + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] leading-snug font-medium text-ink">{h.text}</span>
                <span className="mt-1 flex items-center gap-2 text-xs text-ink-faint">
                  <span className="text-intel">{h.interest}</span>·<span>{h.sources} sources</span>
                </span>
              </span>
              <ArrowRight
                aria-hidden
                className="mt-1 ml-auto size-4 shrink-0 text-ink-faint opacity-0 transition-opacity group-hover/hl:opacity-100"
              />
            </Link>
          </li>
        ))}
      </ol>

      <div className="relative mt-auto flex flex-wrap items-center gap-2 pt-5">
        <Link
          href="/intelligence"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-intel px-4 text-sm font-semibold text-void transition-transform hover:-translate-y-px"
        >
          Open briefing <ArrowRight aria-hidden className="size-4" />
        </Link>
        <Link
          href="/assistant?q=Summarise%20today%27s%20intelligence"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-white/[0.06] px-4 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_var(--edge-strong)] hover:bg-white/[0.1]"
        >
          <Sparkles aria-hidden className="size-4 text-system" /> Ask about it
        </Link>
        <span className="ml-auto text-xs text-ink-faint">Sample only · no ingestion job has run</span>
      </div>
    </Tile>
  );
}

function FocusTile({ className }: { className?: string }) {
  const [tasks, setTasks] = useState(DEMO_FOCUS);
  const { captured } = useOs();
  const open = tasks.filter((t) => !t.done).length;
  return (
    <Tile
      tone="var(--color-lime)"
      eyebrow={`Focus · ${open} open`}
      title="Today's focus"
      icon={<Target aria-hidden className="size-4 text-lime" />}
      className={className}
      emptyText="No focus tasks. Capture one with C."
    >
      <ul className="flex flex-col gap-1">
        {tasks.map((t) => (
          <li key={t.id}>
            <label className="group/task -mx-2 flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 hover:bg-white/[0.04]">
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => setTasks((ts) => ts.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-[4px] transition-all duration-(--duration-quick) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-lime",
                  t.done
                    ? "bg-lime text-void"
                    : "shadow-[inset_0_0_0_1.5px_var(--color-ink-faint)] group-hover/task:shadow-[inset_0_0_0_1.5px_var(--color-lime)]",
                )}
              >
                {t.done && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block text-sm leading-snug font-medium",
                    t.done ? "text-ink-faint line-through" : "text-ink",
                  )}
                >
                  {t.title}
                </span>
                <span className="mt-0.5 flex items-center gap-2 text-xs text-ink-faint">
                  <span
                    className={cn(
                      "inline-block size-1.5 rounded-full",
                      t.priority === "high" ? "bg-danger" : t.priority === "medium" ? "bg-warning" : "bg-ink-faint",
                    )}
                  />
                  {t.project} · {t.due}
                  <span className="font-mono text-ink-ghost">{t.id}</span>
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>

      {captured.length > 0 && (
        <div className="mt-3 border-t border-white/[0.07] pt-3">
          <Eyebrow>Inbox · captured this session</Eyebrow>
          <ul className="mt-1.5 flex flex-col gap-1">
            {captured.slice(0, 3).map((c) => (
              <li key={c.id} className="flex animate-rise items-center gap-2 text-sm text-ink-muted">
                <Chip className="py-0.5 text-[10px] uppercase">{c.kind}</Chip>
                <span className="truncate">{c.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Tile>
  );
}

const toMin = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};

function TodayTile({ className }: { className?: string }) {
  const now = useAthensMinutes();
  const nextIdx = now === null ? -1 : DEMO_SCHEDULE.findIndex((e) => toMin(e.end) > now);
  return (
    <Tile
      tone="var(--color-system)"
      eyebrow="Schedule · Europe/Athens"
      title="Today"
      icon={<CalendarClock aria-hidden className="size-4 text-system" />}
      className={className}
      emptyText="Nothing scheduled. Calendar not connected."
    >
      <ol className="relative flex flex-col">
        <span aria-hidden className="absolute top-2 bottom-2 left-[51px] w-px bg-white/[0.08]" />
        {DEMO_SCHEDULE.map((e, n) => {
          const past = now !== null && toMin(e.end) <= now;
          const current = now !== null && toMin(e.start) <= now && toMin(e.end) > now;
          const isNext = n === nextIdx && !current;
          return (
            <li key={e.id} className={cn("relative flex gap-3 py-2", past && "opacity-45")}>
              <span className="w-10 shrink-0 pt-0.5 text-right font-mono text-xs text-ink-faint tabular-nums">
                {e.start}
              </span>
              <span
                aria-hidden
                className={cn(
                  "relative z-10 mt-1.5 size-2.5 shrink-0 rounded-full ring-4 ring-deep",
                  current && "animate-pulse",
                )}
                style={{
                  background: KIND_TONE[e.kind],
                  boxShadow: current ? `0 0 12px ${KIND_TONE[e.kind]}` : undefined,
                }}
              />
              <div
                className={cn(
                  "min-w-0 flex-1 rounded-[5px] px-2.5 py-1.5",
                  current
                    ? "bg-white/[0.08] shadow-[inset_0_0_0_1px_var(--edge-strong)]"
                    : isNext
                      ? "bg-white/[0.04]"
                      : "",
                )}
              >
                <p className="truncate text-sm font-medium text-ink">{e.title}</p>
                <p className="text-xs text-ink-faint">
                  {e.start}–{e.end}
                  {e.where ? ` · ${e.where}` : ""}
                  {current && <span className="ml-1.5 font-semibold text-lime">· now</span>}
                  {isNext && <span className="ml-1.5 text-system">· next</span>}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs text-ink-faint">Times are demo events placed on today&apos;s real clock.</p>
    </Tile>
  );
}

function IntelLiveTile({ className }: { className?: string }) {
  const top = [...DEMO_EVENTS].sort((a, b) => computeRelevance(b.factors) - computeRelevance(a.factors)).slice(0, 4);
  const faces = top.map((e) => {
    const interest = DEMO_INTERESTS.find((i) => i.id === e.interestId)!;
    const score = computeRelevance(e.factors);
    return (
      <Link
        key={e.id}
        href={`/intelligence#${e.id}`}
        className="flex h-full flex-col rounded-md focus-visible:outline-offset-4"
      >
        <span className="flex items-center gap-2 text-xs">
          <span className="font-medium" style={{ color: interest.color }}>
            {interest.name}
          </span>
          <span className="ml-auto font-mono text-ink-faint tabular-nums">{score}</span>
        </span>
        <span className="mt-2 line-clamp-3 text-display text-lg leading-tight font-semibold text-ink">{e.title}</span>
        <span className="mt-auto pt-2 text-xs text-ink-faint">{e.sources.length} sources · fictional</span>
      </Link>
    );
  });
  return (
    <Tile
      tone="var(--color-intel)"
      eyebrow="Live · top relevance"
      title="Intelligence"
      icon={<Radar aria-hidden className="size-4 text-intel" />}
      className={cn("min-h-[230px]", className)}
      bodyClassName="flex flex-col"
    >
      <LiveFaces faces={faces} label="Top intelligence events" />
    </Tile>
  );
}

function LibraryNowTile({ className }: { className?: string }) {
  const current = DEMO_LIBRARY.filter((e) => e.status === "in_progress");
  const faces = current.map((e) => (
    <Link
      key={e.id}
      href={`/library?focus=${e.id}`}
      className="flex h-full gap-4 rounded-md focus-visible:outline-offset-4"
    >
      <Cover entry={e} size="sm" className="w-[72px] shrink-0 shadow-[0_12px_24px_-10px_rgb(0_0_0/0.8)]" />
      <span className="flex min-w-0 flex-col">
        <span className="text-xs text-personal">
          {e.type === "GAME" ? "Playing" : e.type === "MOVIE" ? "Watching" : "Reading"}
        </span>
        <span className="mt-1 line-clamp-2 text-display text-base leading-tight font-semibold text-ink">{e.title}</span>
        <span className="mt-0.5 truncate text-xs text-ink-faint">{e.creator}</span>
        <span className="mt-auto">
          <span className="mb-1 flex justify-between text-xs text-ink-muted">
            <span>{e.progressLabel}</span>
            <span className="tabular-nums">{e.progress}%</span>
          </span>
          <Meter value={e.progress} tone="var(--color-personal)" label={`${e.title} progress`} />
        </span>
      </span>
    </Link>
  ));
  return (
    <Tile
      tone="var(--color-personal)"
      eyebrow={`Library · ${current.length} in progress`}
      title="Now"
      icon={<LibraryBig aria-hidden className="size-4 text-personal" />}
      className={cn("min-h-[230px]", className)}
      bodyClassName="flex flex-col"
      emptyText="Nothing in progress. Pick something from your backlog."
    >
      <LiveFaces faces={faces} interval={8000} label="Library items in progress" />
    </Tile>
  );
}

function ProgressTile({ className }: { className?: string }) {
  return (
    <Tile
      tone="var(--color-positive)"
      eyebrow="This week"
      title="Progress"
      icon={<Gauge aria-hidden className="size-4 text-positive" />}
      className={className}
    >
      <ul className="flex justify-between gap-2 pt-1">
        {DEMO_GOALS.map((g) => (
          <li key={g.id} className="flex flex-col items-center gap-2 text-center">
            <Ring
              value={g.value}
              max={g.target}
              tone={TONE_VAR[g.tone]}
              size={72}
              label={`${g.label}: ${g.value} of ${g.target} ${g.unit}`}
            >
              <span className="text-display text-lg leading-none font-semibold tabular-nums">{g.value}</span>
            </Ring>
            <span>
              <span className="block text-xs font-medium text-ink">{g.label}</span>
              <span className="block text-[11px] text-ink-faint">
                of {g.target} {g.unit}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Tile>
  );
}

function ProjectsTile({ className }: { className?: string }) {
  return (
    <Tile
      tone="var(--color-system)"
      eyebrow="Active projects"
      title="Projects"
      icon={<FolderKanban aria-hidden className="size-4 text-system" />}
      className={className}
      emptyText="No active projects."
    >
      <ul className="flex flex-col divide-y divide-white/[0.06]">
        {DEMO_PROJECTS.map((p) => (
          <li
            key={p.id}
            className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 py-2.5 first:pt-0 sm:grid-cols-[1fr_140px_auto]"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{p.name}</p>
              <p className="truncate text-xs text-ink-faint">
                Next: <span className="text-ink-muted">{p.nextAction}</span>
              </p>
            </div>
            <Meter
              value={p.progress}
              tone="var(--color-system)"
              label={`${p.name} progress`}
              className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto"
            />
            <span className="text-right font-mono text-xs text-ink-muted tabular-nums sm:order-last">
              {p.progress}%
            </span>
          </li>
        ))}
      </ul>
    </Tile>
  );
}

function AssistantEntry({ className }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/assistant?q=${encodeURIComponent(q.trim())}`);
  }
  return (
    <Tile
      tone="var(--color-system)"
      eyebrow="Grounded in your records"
      title="Ask Assistant"
      icon={<Sparkles aria-hidden className="size-4 text-system" />}
      className={className}
      hideDemoBadge
    >
      <form onSubmit={submit} className="relative">
        <label htmlFor="home-ask" className="sr-only">
          Ask the assistant
        </label>
        <input
          id="home-ask"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What should I focus on tomorrow?"
          className="h-11 w-full rounded-md bg-white/[0.04] pr-11 pl-3 text-sm text-ink shadow-[inset_0_0_0_1px_var(--edge-strong)] placeholder:text-ink-faint focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-system)]"
        />
        <button
          type="submit"
          aria-label="Ask"
          className="absolute top-1.5 right-1.5 grid size-8 place-items-center rounded-[5px] bg-system text-void"
        >
          <CornerDownLeft aria-hidden className="size-4" />
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {SUGGESTED_PROMPTS.map((p) => (
          <Link
            key={p}
            href={`/assistant?q=${encodeURIComponent(p)}`}
            className="rounded-[4px] bg-white/[0.04] px-2 py-1 text-xs text-ink-muted shadow-[inset_0_0_0_1px_var(--edge)] hover:text-ink"
          >
            {p}
          </Link>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-faint">Demo: scripted replies, no model connected.</p>
    </Tile>
  );
}

function ModuleShortcuts({ className }: { className?: string }) {
  const mods = NAV.filter((m) => ["life", "work", "university", "health"].includes(m.id));
  return (
    <nav aria-label="Other modules" className={cn("grid grid-cols-2 gap-2", className)}>
      {mods.map((m) => {
        const Icon = m.icon;
        return (
          <Link
            key={m.id}
            href={m.href}
            style={{ "--item-accent": m.accent } as React.CSSProperties}
            className="group relative flex min-h-[92px] flex-col justify-between overflow-hidden rounded-(--radius-tile) p-3 surface-1 transition-transform duration-(--duration-spatial) ease-(--ease-glide) hover:-translate-y-0.5"
          >
            <span
              aria-hidden
              className="absolute -top-6 -right-6 size-20 rounded-full opacity-25 blur-xl transition-opacity group-hover:opacity-50"
              style={{ background: m.accent }}
            />
            <Icon aria-hidden className="relative size-5 text-(--item-accent)" />
            <span className="relative">
              <span className="block text-display text-sm font-semibold text-ink">{m.label}</span>
              <span className="block text-[11px] text-ink-faint">Not designed yet</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function StateReviewBar({ value, onChange }: { value: TileState; onChange: (s: TileState) => void }) {
  const states: TileState[] = ["demo", "loading", "empty", "error"];
  return (
    <aside
      aria-label="Design review controls"
      className="flex flex-wrap items-center gap-3 rounded-md border border-dashed border-white/10 px-4 py-3 text-xs text-ink-faint"
    >
      <DemoBadge label="Design review" />
      <span>Preview every Home tile in a different state:</span>
      <div role="radiogroup" aria-label="Tile state" className="flex gap-1">
        {states.map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={value === s}
            onClick={() => onChange(s)}
            className={cn(
              "min-h-8 rounded-[4px] px-2.5 capitalize",
              value === s ? "bg-lime font-semibold text-void" : "bg-white/[0.05] text-ink-muted hover:text-ink",
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </aside>
  );
}
