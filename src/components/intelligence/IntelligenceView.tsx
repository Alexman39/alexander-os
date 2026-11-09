"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  CircleSlash,
  ExternalLink,
  EyeOff,
  Rss,
  ShieldCheck,
  BellOff,
  UserPlus,
  Clock3,
  Newspaper,
} from "lucide-react";
import { Chip, DemoBadge, Eyebrow, PageHeading } from "@/components/ui/primitives";
import { useOs } from "@/components/shell/OsProvider";
import { cn } from "@/lib/cn";
import { DEMO_EVENTS, DEMO_INTERESTS, type IntelEvent, type Interest, type SourceRef } from "@/lib/demo/intelligence";
import { FACTOR_LABELS, computeRelevance, factorContributions, relevanceTier, type RelevanceTier } from "@/lib/relevance";

const TIER_META: Record<RelevanceTier, { label: string; tone: string }> = {
  high: { label: "High", tone: "var(--color-intel)" },
  medium: { label: "Medium", tone: "var(--color-system)" },
  feed: { label: "Feed only", tone: "var(--color-ink-faint)" },
};

const fmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Athens",
});
const fmtDate = (iso: string) => fmt.format(new Date(iso));

type TierFilter = "all" | RelevanceTier;

export function IntelligenceView() {
  const { toast } = useOs();
  const [interests, setInterests] = useState<Interest[]>(DEMO_INTERESTS);
  const [interestFilter, setInterestFilter] = useState<string | "all">("all");
  const [tier, setTier] = useState<TierFilter>("all");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);

  // Deep links (#EV-101 from Home or the digest) expand and reveal that event.
  useEffect(() => {
    const open = () => {
      const id = window.location.hash.slice(1);
      if (!id || !DEMO_EVENTS.some((e) => e.id === id)) return;
      setExpanded(id);
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "center" }));
    };
    const raf = requestAnimationFrame(open);
    window.addEventListener("hashchange", open);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", open);
    };
  }, []);

  const scored = useMemo(
    () =>
      DEMO_EVENTS.map((e) => ({ ...e, score: computeRelevance(e.factors) }))
        .filter((e) => interests.find((i) => i.id === e.interestId)?.enabled)
        .filter((e) => !dismissed.has(e.id))
        .filter((e) => interestFilter === "all" || e.interestId === interestFilter)
        .filter((e) => tier === "all" || relevanceTier(e.score) === tier)
        .sort((a, b) => b.score - a.score),
    [interests, dismissed, interestFilter, tier],
  );

  const [lead, ...rest] = scored;

  const dismiss = (id: string, how: "dismissed" | "irrelevant") => {
    setDismissed((s) => new Set(s).add(id));
    toast(how === "dismissed" ? "Dismissed — feedback recorded (demo)" : "Marked not relevant — feedback recorded (demo)");
  };
  const mute = (interestId: string) => {
    setInterests((is) => is.map((i) => (i.id === interestId ? { ...i, enabled: false } : i)));
    toast(`Muted ${DEMO_INTERESTS.find((i) => i.id === interestId)?.name}`);
  };
  const toggleSave = (id: string) =>
    setSaved((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const actions = { dismiss, mute, toggleSave, follow: (name: string) => toast(`Following ${name} (demo)`) };

  return (
    <div className="mx-auto flex max-w-[1520px] flex-col gap-6 pt-2 lg:pt-4">
      <PageHeading index="07 · Intelligence" title="Intelligence" kicker={<DemoBadge label="Fictional sample events" />}>
        <div className="surface-1 flex items-center gap-3 rounded-md px-3.5 py-2.5 text-xs">
          <Clock3 aria-hidden className="size-4 text-ink-faint" />
          <span>
            <span className="block text-ink">Last ingestion: never</span>
            <span className="block text-ink-faint">No monitoring job has run · Europe/Athens</span>
          </span>
        </div>
      </PageHeading>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[250px_minmax(0,1fr)_340px]">
        <InterestRail
          interests={interests}
          selected={interestFilter}
          onSelect={setInterestFilter}
          onToggle={(id) => setInterests((is) => is.map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i)))}
        />

        <section aria-labelledby="feed-title" className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="feed-title" className="text-display mr-2 text-xl font-semibold">
              Feed
            </h2>
            <div role="group" aria-label="Relevance tier" className="flex flex-wrap gap-1.5">
              {(["all", "high", "medium", "feed"] as TierFilter[]).map((t) => (
                <Chip key={t} pressed={tier === t} onClick={() => setTier(t)}>
                  {t === "all" ? "All tiers" : `${TIER_META[t].label}${t === "high" ? " ≥85" : t === "medium" ? " ≥70" : " <70"}`}
                </Chip>
              ))}
            </div>
            <span className="ml-auto font-mono text-xs text-ink-faint">{scored.length} events</span>
          </div>

          {!lead && (
            <div className="surface-1 rounded-(--radius-tile) p-6">
              <p className="text-display text-lg font-semibold">Nothing crossed your threshold.</p>
              <p className="mt-1 text-sm text-ink-muted">
                An empty feed is a valid result. Re-enable an interest or widen the tier filter.
              </p>
            </div>
          )}

          {lead && (
            <LeadEvent
              event={lead}
              score={lead.score}
              saved={saved.has(lead.id)}
              expanded={expanded === lead.id}
              onExpand={() => setExpanded(expanded === lead.id ? null : lead.id)}
              actions={actions}
            />
          )}

          <ol className="flex flex-col gap-2">
            {rest.map((e) => (
              <li key={e.id}>
                <EventRow
                  event={e}
                  score={e.score}
                  saved={saved.has(e.id)}
                  expanded={expanded === e.id}
                  onExpand={() => setExpanded(expanded === e.id ? null : e.id)}
                  actions={actions}
                />
              </li>
            ))}
          </ol>

          {dismissed.size > 0 && (
            <button
              type="button"
              onClick={() => setDismissed(new Set())}
              className="self-start text-xs text-ink-faint underline decoration-dotted underline-offset-4 hover:text-ink"
            >
              Restore {dismissed.size} dismissed event{dismissed.size > 1 ? "s" : ""}
            </button>
          )}
        </section>

        <DigestPanel />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function InterestRail({
  interests,
  selected,
  onSelect,
  onToggle,
}: {
  interests: Interest[];
  selected: string;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  return (
    <aside aria-labelledby="interests-title" className="flex min-w-0 flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 id="interests-title" className="text-display text-xl font-semibold">
          Interests
        </h2>
        <span className="text-xs text-ink-faint">monitoring ≠ delivery</span>
      </div>
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 xl:mx-0 xl:flex-col xl:gap-1 xl:overflow-visible xl:px-0">
        <button
          type="button"
          aria-pressed={selected === "all"}
          onClick={() => onSelect("all")}
          className={cn(
            "shrink-0 rounded-[5px] px-3 py-2.5 text-left text-sm font-semibold transition-colors",
            selected === "all" ? "bg-white/[0.09] text-ink shadow-[inset_3px_0_0_var(--color-lime)]" : "text-ink-faint hover:bg-white/[0.04] hover:text-ink",
          )}
        >
          All interests
        </button>
        {interests.map((i) => {
          const on = selected === i.id;
          return (
            <div
              key={i.id}
              className={cn(
                "group flex shrink-0 items-center gap-2 rounded-[5px] pr-2 transition-colors",
                on ? "bg-white/[0.09] shadow-[inset_3px_0_0_var(--c)]" : "hover:bg-white/[0.04]",
                !i.enabled && "opacity-55",
              )}
              style={{ "--c": i.color } as React.CSSProperties}
            >
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onSelect(on ? "all" : i.id)}
                className="flex min-w-0 flex-1 items-center gap-2.5 py-2.5 pl-3 text-left"
              >
                <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: i.color, boxShadow: `0 0 8px ${i.color}` }} />
                <span className="min-w-0">
                  <span className={cn("block truncate text-sm font-medium", on ? "text-ink" : "text-ink-muted")}>{i.name}</span>
                  <span className="text-meta block text-ink-faint">{i.cadence} digest</span>
                </span>
              </button>
              <Switch checked={i.enabled} onChange={() => onToggle(i.id)} label={`Monitor ${i.name}`} />
            </div>
          );
        })}
      </div>
      <p className="hidden text-xs leading-relaxed text-ink-faint xl:block">
        Weights: interest 30 · impact 25 · usefulness 20 · evidence 15 · freshness 10. Scores explain a heuristic — they are not objective truth.
      </p>
    </aside>
  );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-(--duration-quick)",
        checked ? "bg-lime" : "bg-white/15",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-0.5 size-4 rounded-full transition-[left,background] duration-(--duration-quick) ease-(--ease-snap)",
          checked ? "left-[18px] bg-void" : "left-0.5 bg-ink-muted",
        )}
      />
    </button>
  );
}

interface RowProps {
  event: IntelEvent;
  score: number;
  saved: boolean;
  expanded: boolean;
  onExpand: () => void;
  actions: {
    dismiss: (id: string, how: "dismissed" | "irrelevant") => void;
    mute: (interestId: string) => void;
    toggleSave: (id: string) => void;
    follow: (name: string) => void;
  };
}

function ScoreDial({ score, size = 64 }: { score: number; size?: number }) {
  const t = relevanceTier(score);
  const tone = TIER_META[t].tone;
  const r = size / 2 - 5;
  const c = Math.PI * r * 1.5; // 270° arc
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }} aria-label={`Relevance ${score} of 100, ${TIER_META[t].label}`} role="img">
      <svg width={size} height={size} className="rotate-[135deg]" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="4" strokeDasharray={`${c} 999`} strokeLinecap="round" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${(c * score) / 100} 999`}
          style={{ filter: `drop-shadow(0 0 5px ${tone})` }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center">
        <span className="text-display text-lg font-semibold leading-none tabular-nums" style={{ color: tone }}>
          {score}
        </span>
      </span>
    </div>
  );
}

function LeadEvent(props: RowProps) {
  const { event, score, expanded, onExpand } = props;
  const interest = DEMO_INTERESTS.find((i) => i.id === event.interestId)!;
  return (
    <article id={event.id} aria-labelledby={`${event.id}-t`} className="surface-2 chamfer relative overflow-hidden rounded-(--radius-panel)">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_100%_at_100%_0%,color-mix(in_oklab,var(--color-intel)_28%,transparent),transparent_70%)]" />
      <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:p-6">
        <ScoreDial score={score} size={84} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Eyebrow tone="var(--color-intel)">Lead · {TIER_META[relevanceTier(score)].label} relevance</Eyebrow>
            <Chip tone={interest.color}>{interest.name}</Chip>
          </div>
          <h3 id={`${event.id}-t`} className="text-display mt-2 text-2xl font-semibold leading-tight sm:text-[1.75rem]">
            {event.title}
          </h3>
          <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-ink-muted">{event.summary}</p>
          <SourceStrip sources={event.sources} />
          <ActionsBar {...props} />
        </div>
      </div>
      {expanded && <EventDetail event={event} score={score} follow={props.actions.follow} />}
      <ExpandToggle expanded={expanded} onClick={onExpand} id={event.id} />
    </article>
  );
}

function EventRow(props: RowProps) {
  const { event, score, expanded, onExpand } = props;
  const interest = DEMO_INTERESTS.find((i) => i.id === event.interestId)!;
  const t = relevanceTier(score);
  return (
    <article
      id={event.id}
      aria-labelledby={`${event.id}-t`}
      className={cn(
        "surface-1 group relative overflow-hidden rounded-(--radius-tile) transition-shadow duration-(--duration-spatial)",
        expanded && "shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-intel)_35%,transparent)]",
      )}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ background: TIER_META[t].tone, opacity: t === "feed" ? 0.4 : 0.9 }} />
      <div className="flex gap-4 px-4 py-3.5 sm:px-5">
        <div className="flex w-12 shrink-0 flex-col items-center pt-0.5">
          <span className="text-display text-xl font-semibold leading-none tabular-nums" style={{ color: TIER_META[t].tone }}>
            {score}
          </span>
          <span className="text-meta mt-1 text-[9px] text-ink-faint">{TIER_META[t].label}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs">
            <span aria-hidden className="size-1.5 rounded-full" style={{ background: interest.color }} />
            <span style={{ color: interest.color }}>{interest.name}</span>
            <span className="text-ink-faint">· first seen {fmtDate(event.firstSeen)}</span>
          </div>
          <h3 id={`${event.id}-t`} className="mt-1 text-[15px] font-semibold leading-snug text-ink">
            {event.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-ink-muted sm:line-clamp-1">{event.summary}</p>
          <SourceStrip sources={event.sources} compact />
        </div>
        <button
          type="button"
          aria-pressed={props.saved}
          aria-label={props.saved ? `Unsave: ${event.title}` : `Save: ${event.title}`}
          onClick={() => props.actions.toggleSave(event.id)}
          className={cn(
            "-mr-2 grid size-9 shrink-0 place-items-center rounded-md transition-colors hover:bg-white/[0.07]",
            props.saved ? "text-lime" : "text-ink-faint hover:text-ink",
          )}
        >
          {props.saved ? <BookmarkCheck aria-hidden className="size-4" /> : <Bookmark aria-hidden className="size-4" />}
        </button>
      </div>
      {expanded && (
        <EventDetail event={event} score={score} follow={props.actions.follow}>
          <ActionsBar {...props} compact />
        </EventDetail>
      )}
      <ExpandToggle expanded={expanded} onClick={onExpand} id={event.id} />
    </article>
  );
}

function SourceStrip({ sources, compact }: { sources: SourceRef[]; compact?: boolean }) {
  const official = sources.some((s) => s.kind === "official");
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-faint", compact ? "mt-2" : "mt-4")}>
      <span className="flex items-center gap-1.5">
        <Newspaper aria-hidden className="size-3.5" />
        {sources.length} source{sources.length > 1 ? "s" : ""} clustered
      </span>
      <span className="truncate">
        {sources[0].name} · {fmtDate(sources[0].published)}
      </span>
      {official && (
        <span className="flex items-center gap-1 text-positive">
          <ShieldCheck aria-hidden className="size-3.5" /> Official source
        </span>
      )}
    </div>
  );
}

function ActionsBar({ event, saved, actions, compact }: RowProps & { compact?: boolean }) {
  const btn =
    "inline-flex min-h-8 items-center gap-1.5 rounded-[4px] px-2 text-xs text-ink-faint transition-colors hover:bg-white/[0.07] hover:text-ink";
  return (
    <div className={cn("flex flex-wrap items-center gap-0.5", compact ? "mt-2 -ml-2" : "mt-4 -ml-2")}>
      <button type="button" aria-pressed={saved} onClick={() => actions.toggleSave(event.id)} className={cn(btn, saved && "text-lime")}>
        {saved ? <BookmarkCheck aria-hidden className="size-3.5" /> : <Bookmark aria-hidden className="size-3.5" />}
        {saved ? "Saved" : "Save"}
      </button>
      <button type="button" onClick={() => actions.dismiss(event.id, "dismissed")} className={btn}>
        <EyeOff aria-hidden className="size-3.5" /> Dismiss
      </button>
      <button type="button" onClick={() => actions.dismiss(event.id, "irrelevant")} className={btn}>
        <CircleSlash aria-hidden className="size-3.5" /> Not relevant
      </button>
      <button type="button" onClick={() => actions.mute(event.interestId)} className={btn}>
        <BellOff aria-hidden className="size-3.5" /> Mute topic
      </button>
    </div>
  );
}

function ExpandToggle({ expanded, onClick, id }: { expanded: boolean; onClick: () => void; id: string }) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={`${id}-detail`}
      onClick={onClick}
      className="relative flex w-full items-center justify-center gap-1.5 border-t border-white/[0.06] py-2 text-xs font-medium text-ink-faint transition-colors hover:bg-white/[0.03] hover:text-ink"
    >
      {expanded ? "Hide evidence" : "Evidence, sources & feedback"}
      <ChevronDown aria-hidden className={cn("size-3.5 transition-transform duration-(--duration-spatial)", expanded && "rotate-180")} />
    </button>
  );
}

function EventDetail({
  event,
  score,
  follow,
  children,
}: {
  event: IntelEvent;
  score: number;
  follow: (name: string) => void;
  children?: React.ReactNode;
}) {
  const contrib = factorContributions(event.factors);
  return (
    <div id={`${event.id}-detail`} className="animate-rise relative grid gap-6 border-t border-white/[0.06] bg-black/15 px-4 py-5 sm:px-5 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <dl className="grid gap-3 text-sm">
          {(
            [
              ["What happened", event.summary],
              ["Why it matters", event.whyItMatters],
              ["Personal relevance", event.personalRelevance],
              ["Possible action", event.possibleAction],
            ] as const
          ).map(([k, v]) => (
            <div key={k}>
              <dt className="text-meta text-ink-faint">{k}</dt>
              <dd className="mt-0.5 leading-relaxed text-ink-muted">{v}</dd>
            </div>
          ))}
        </dl>
        <div>
          <h4 className="text-meta mb-2 text-ink-faint">Sources (provenance)</h4>
          <ul className="flex flex-col gap-1.5">
            {event.sources.map((s) => (
              <li key={s.url} className="flex items-center gap-2 rounded-[5px] bg-white/[0.03] px-2.5 py-2 text-xs">
                <Rss aria-hidden className="size-3.5 shrink-0 text-ink-faint" />
                <span className="min-w-0 flex-1">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-ink hover:text-system hover:underline"
                  >
                    {s.name} <ExternalLink aria-hidden className="size-3" />
                    <span className="sr-only">(opens example.com placeholder in new tab)</span>
                  </a>
                  <span className="block text-ink-faint">
                    {s.kind} · {fmtDate(s.published)} · {new URL(s.url).hostname}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => follow(s.name)}
                  aria-label={`Follow ${s.name}`}
                  className="grid size-8 shrink-0 place-items-center rounded-md text-ink-faint hover:bg-white/[0.08] hover:text-ink"
                >
                  <UserPlus aria-hidden className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <h4 className="text-meta mb-3 text-ink-faint">Relevance breakdown · {score}/100</h4>
        <ul className="flex flex-col gap-3">
          {contrib.map((c) => (
            <li key={c.factor}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-ink-muted">
                  {FACTOR_LABELS[c.factor]} <span className="text-ink-ghost">× {c.weight}%</span>
                </span>
                <span className="font-mono tabular-nums text-ink">
                  {c.value} → +{c.points.toFixed(1)}
                </span>
              </div>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.07]" aria-hidden>
                <div className="h-full rounded-full bg-intel" style={{ width: `${c.value}%`, opacity: 0.35 + c.weight / 50 }} />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-ink-faint">
          Model: <span className="font-mono">heuristic-demo-v0</span>. Factor values are hand-set for this sample. The score is an
          explanation of ranking, not a claim of objective importance.
        </p>
      </div>
      {children && <div className="lg:col-span-2">{children}</div>}
    </div>
  );
}

function DigestPanel() {
  const [tab, setTab] = useState<"daily" | "weekly">("daily");
  const items = DEMO_EVENTS.filter((e) => DEMO_INTERESTS.find((i) => i.id === e.interestId)?.cadence === tab)
    .map((e) => ({ ...e, score: computeRelevance(e.factors) }))
    .filter((e) => e.score >= 70)
    .sort((a, b) => b.score - a.score);
  return (
    <aside aria-labelledby="digest-title" className="surface-2 flex h-fit flex-col overflow-hidden rounded-(--radius-panel) xl:sticky xl:top-24">
      <div className="border-b border-white/[0.07] p-4">
        <div className="flex items-center justify-between">
          <h2 id="digest-title" className="text-display text-xl font-semibold">
            Digest
          </h2>
          <DemoBadge label="Sample" />
        </div>
        <div role="tablist" aria-label="Digest cadence" className="mt-3 grid grid-cols-2 gap-1 rounded-md bg-black/25 p-1">
          {(["daily", "weekly"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "min-h-8 rounded-[4px] text-xs font-semibold capitalize transition-colors",
                tab === t ? "bg-intel text-void" : "text-ink-faint hover:text-ink",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          {tab === "daily" ? "AI & LLMs, Business · 08:00 daily" : "Dev, Security, Fitness, Games · Sunday 09:00"} · Europe/Athens.
          Notifications are off until you confirm.
        </p>
      </div>
      <ol role="tabpanel" className="flex flex-col p-2">
        {items.length === 0 && <li className="p-3 text-sm text-ink-muted">Empty briefing — nothing above threshold. That&apos;s fine.</li>}
        {items.map((e, n) => (
          <li key={e.id}>
            <a href={`#${e.id}`} className="flex gap-3 rounded-md p-2.5 hover:bg-white/[0.05]">
              <span className="text-display w-5 shrink-0 text-base font-semibold text-intel/70">{n + 1}</span>
              <span className="min-w-0">
                <span className="line-clamp-2 text-sm font-medium leading-snug text-ink">{e.title}</span>
                <span className="mt-1 line-clamp-2 block text-xs text-ink-faint">{e.whyItMatters}</span>
                <span className="mt-1 block font-mono text-[10px] text-ink-ghost">
                  {e.sources.length} sources · score {e.score}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
      <div className="border-t border-white/[0.07] p-4">
        <button
          type="button"
          disabled
          className="w-full rounded-md bg-white/[0.05] py-2.5 text-sm text-ink-faint disabled:cursor-not-allowed"
          title="Manual briefing generation arrives in Stage 2"
        >
          Generate briefing now · Stage 2
        </button>
      </div>
    </aside>
  );
}
