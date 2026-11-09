"use client";

import { useSearchParams } from "next/navigation";
import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  ArrowUp,
  BookOpen,
  CalendarClock,
  Check,
  CheckSquare,
  FolderKanban,
  Lock,
  MessageSquarePlus,
  Radar,
  ShieldAlert,
  Sparkles,
  Wrench,
  X,
  FileText,
  PanelRight,
  ScrollText,
} from "lucide-react";
import { Chip, DemoBadge, Eyebrow, PageHeading } from "@/components/ui/primitives";
import { Sheet } from "@/components/shell/Sheet";
import { useOs } from "@/components/shell/OsProvider";
import { cn } from "@/lib/cn";
import {
  DEMO_CONVERSATIONS,
  FALLBACK_REPLY,
  SCRIPTED_REPLIES,
  SUGGESTED_PROMPTS,
  TOOL_REGISTRY,
  type Citation,
  type Conversation,
  type Proposal,
  type Turn,
} from "@/lib/demo/assistant";

type Decision = "approved" | "declined";
interface AuditEntry {
  at: string;
  text: string;
}

const KIND_ICON: Record<Citation["kind"], typeof CheckSquare> = {
  task: CheckSquare,
  event: CalendarClock,
  project: FolderKanban,
  library: BookOpen,
  intel: Radar,
  note: FileText,
};
const KIND_TONE: Record<Citation["kind"], string> = {
  task: "var(--color-lime)",
  event: "var(--color-system)",
  project: "var(--color-system)",
  library: "var(--color-personal)",
  intel: "var(--color-intel)",
  note: "var(--color-ink-muted)",
};

const nowLabel = () =>
  new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Athens" }).format(new Date());

export function AssistantView() {
  const params = useSearchParams();
  const { reducedMotion } = useOs();
  const [convos, setConvos] = useState<Conversation[]>(DEMO_CONVERSATIONS);
  const [activeId, setActiveId] = useState(DEMO_CONVERSATIONS[0].id);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [contextOpen, setContextOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const handledQ = useRef(false);

  const active = convos.find((c) => c.id === activeId) ?? convos[0];
  const citations = dedupe(active.turns.flatMap((t) => (t.role === "assistant" ? (t.citations ?? []) : [])));

  function send(text: string, intoNew = false) {
    const t = text.trim();
    if (!t || thinking) return;
    let targetId = activeId;
    if (intoNew) {
      targetId = `C-${Date.now().toString(36)}`;
      setConvos((cs) => [{ id: targetId, title: t.slice(0, 28), when: "Now", turns: [] }, ...cs]);
      setActiveId(targetId);
    }
    const push = (turn: Turn) =>
      setConvos((cs) => cs.map((c) => (c.id === targetId ? { ...c, turns: [...c.turns, turn] } : c)));
    push({ role: "user", text: t });
    setDraft("");
    setThinking(true);
    const reply = SCRIPTED_REPLIES[t] ?? FALLBACK_REPLY;
    window.setTimeout(
      () => {
        push(reply);
        setThinking(false);
        if (reply.tools?.length) {
          setAudit((a) => [{ at: nowLabel(), text: `Auto-ran ${reply.tools!.map((x) => x.tool).join(", ")} (read-only)` }, ...a]);
        }
      },
      reducedMotion ? 150 : 1100,
    );
  }

  // Prompt handed over from Home (?q=...)
  useEffect(() => {
    const q = params.get("q");
    if (q && !handledQ.current) {
      handledQ.current = true;
      send(q, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // Keep the newest turn in view — but never move the page on first load,
  // and prefer scrolling the transcript itself over scrolling the window.
  const logRef = useRef<HTMLDivElement>(null);
  const seen = useRef({ id: activeId, turns: active.turns.length });
  useEffect(() => {
    const prev = seen.current;
    seen.current = { id: activeId, turns: active.turns.length };
    const grew = prev.id === activeId && active.turns.length > prev.turns;
    if (!grew && !thinking) return; // first load or switching conversations: don't move the page
    const log = logRef.current;
    if (log && log.scrollHeight > log.clientHeight) {
      log.scrollTo({ top: log.scrollHeight, behavior: reducedMotion ? "auto" : "smooth" });
    } else {
      endRef.current?.scrollIntoView({ block: "nearest", behavior: reducedMotion ? "auto" : "smooth" });
    }
  }, [active.turns.length, thinking, reducedMotion, activeId]);

  function decide(p: Proposal, d: Decision) {
    setDecisions((x) => ({ ...x, [p.id]: d }));
    setAudit((a) => [
      { at: nowLabel(), text: `${d === "approved" ? "Approved" : "Declined"} ${p.tool} — ${p.title}${d === "approved" ? " (demo: nothing written)" : ""}` },
      ...a,
    ]);
  }

  function onComposerKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(draft);
    }
  }

  const context = <ContextPanel citations={citations} highlight={highlight} audit={audit} />;

  return (
    <div className="mx-auto flex max-w-[1520px] flex-col gap-5 pt-2 lg:pt-4">
      <PageHeading index="08 · Assistant" title="Assistant" kicker={<DemoBadge label="Scripted · no model connected" />}>
        <button
          type="button"
          onClick={() => setContextOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-white/[0.05] px-3 text-sm text-ink-muted shadow-[inset_0_0_0_1px_var(--edge)] xl:hidden"
        >
          <PanelRight aria-hidden className="size-4" /> Context ({citations.length})
        </button>
      </PageHeading>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
        {/* Conversations */}
        <nav aria-label="Conversations" className="flex min-w-0 flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              const id = `C-${Date.now().toString(36)}`;
              setConvos((cs) => [{ id, title: "New conversation", when: "Now", turns: [] }, ...cs]);
              setActiveId(id);
            }}
            className="hidden h-11 items-center gap-2 rounded-md bg-system/15 px-3 text-sm font-semibold text-system shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-system)_35%,transparent)] hover:bg-system/25 xl:flex"
          >
            <MessageSquarePlus aria-hidden className="size-4" /> New conversation
          </button>
          <ul className="scrollbar-none -mx-4 flex gap-1.5 overflow-x-auto px-4 xl:mx-0 xl:flex-col xl:overflow-visible xl:px-0">
            {convos.map((c) => {
              const on = c.id === active.id;
              return (
                <li key={c.id} className="shrink-0">
                  <button
                    type="button"
                    aria-current={on ? "true" : undefined}
                    onClick={() => setActiveId(c.id)}
                    className={cn(
                      "flex w-full flex-col items-start rounded-[5px] px-3 py-2 text-left transition-[background,transform] duration-(--duration-spatial) ease-(--ease-glide)",
                      on
                        ? "bg-[linear-gradient(100deg,color-mix(in_oklab,var(--color-system)_22%,#16204a),#121a3a)] shadow-[inset_3px_0_0_var(--color-system)] xl:translate-x-1.5"
                        : "bg-white/[0.03] hover:bg-white/[0.06]",
                    )}
                  >
                    <span className={cn("max-w-44 truncate text-sm font-medium", on ? "text-ink" : "text-ink-muted")}>{c.title}</span>
                    <span className="text-meta text-ink-faint">{c.when}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Thread */}
        <section aria-label={`Conversation: ${active.title}`} className="surface-1 flex min-h-[60vh] min-w-0 flex-col rounded-(--radius-panel)">
          <div ref={logRef} role="log" aria-live="polite" aria-relevant="additions" className="flex-1 space-y-7 overflow-y-auto p-4 sm:p-6 xl:max-h-[calc(100dvh-330px)]">
            {active.turns.length === 0 && (
              <div className="grid h-full place-items-center py-16 text-center">
                <div>
                  <Sparkles aria-hidden className="mx-auto size-8 text-system" />
                  <p className="text-display mt-3 text-xl font-semibold">Ask about your tasks, schedule, library or briefings.</p>
                  <p className="mt-1 text-sm text-ink-faint">Answers cite the records they use. Actions always wait for your approval.</p>
                </div>
              </div>
            )}
            {active.turns.map((t, i) =>
              t.role === "user" ? (
                <div key={i} className="animate-rise flex gap-3 sm:gap-4">
                  <span className="text-meta w-10 shrink-0 pt-1.5 text-lime sm:w-16">You</span>
                  <p className="text-display text-lg font-medium leading-snug text-ink sm:text-xl">{t.text}</p>
                </div>
              ) : (
                <div key={i} className="animate-rise flex gap-3 sm:gap-4">
                  <span className="text-meta w-10 shrink-0 pt-1 text-system sm:w-16">AOS</span>
                  <div className="min-w-0 flex-1 space-y-3">
                    {t.tools && t.tools.length > 0 && <ToolTrace tools={t.tools} />}
                    <div className="space-y-3 text-[15px] leading-relaxed text-ink-muted">
                      {t.text.split("\n\n").map((para, pi) => (
                        <p key={pi}>
                          <RichText text={para} citations={t.citations ?? []} onCite={setHighlight} />
                        </p>
                      ))}
                    </div>
                    {t.proposal && (
                      <ProposalCard proposal={t.proposal} decision={decisions[t.proposal.id]} onDecide={(d) => decide(t.proposal!, d)} />
                    )}
                  </div>
                </div>
              ),
            )}
            {thinking && (
              <div className="flex gap-3 sm:gap-4" aria-label="Assistant is responding">
                <span className="text-meta w-10 shrink-0 pt-1 text-system sm:w-16">AOS</span>
                <span className="flex items-center gap-1 pt-2" aria-hidden>
                  <span className="typing-dot size-1.5 rounded-full bg-system" />
                  <span className="typing-dot size-1.5 rounded-full bg-system" />
                  <span className="typing-dot size-1.5 rounded-full bg-system" />
                </span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Composer */}
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              send(draft);
            }}
            className="border-t border-white/[0.07] p-3 sm:p-4"
          >
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => send(p)}
                  disabled={thinking}
                  className="rounded-[4px] bg-white/[0.04] px-2.5 py-1.5 text-xs text-ink-muted shadow-[inset_0_0_0_1px_var(--edge)] hover:text-ink disabled:opacity-40"
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="relative">
              <label htmlFor="composer" className="sr-only">
                Message the assistant
              </label>
              <textarea
                id="composer"
                rows={2}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onComposerKey}
                placeholder="Ask anything about your records…  (Enter to send, Shift+Enter for newline)"
                className="w-full resize-none rounded-md bg-black/25 py-3 pl-3.5 pr-14 text-[15px] text-ink shadow-[inset_0_0_0_1px_var(--edge-strong)] placeholder:text-ink-faint focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-system)]"
              />
              <button
                type="submit"
                aria-label="Send"
                disabled={!draft.trim() || thinking}
                className="absolute bottom-3 right-2.5 grid size-9 place-items-center rounded-md bg-system text-void transition-opacity disabled:opacity-30"
              >
                <ArrowUp aria-hidden className="size-4" strokeWidth={2.5} />
              </button>
            </div>
          </form>
        </section>

        <div className="hidden xl:block">{context}</div>
      </div>

      <Sheet open={contextOpen} onClose={() => setContextOpen(false)} title="Context & permissions" side="right">
        <div className="p-4">{context}</div>
      </Sheet>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function dedupe(cs: Citation[]): Citation[] {
  const seen = new Set<string>();
  return cs.filter((c) => (seen.has(c.ref) ? false : (seen.add(c.ref), true)));
}

function RichText({ text, citations, onCite }: { text: string; citations: Citation[]; onCite: (ref: string) => void }) {
  const parts = text.split(/(\[\[[^\]]+\]\])/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\[\[(.+)\]\]$/);
        if (!m) return <Fragment key={i}>{p}</Fragment>;
        const c = citations.find((x) => x.ref === m[1]);
        const tone = c ? KIND_TONE[c.kind] : "var(--color-ink-muted)";
        return (
          <button
            key={i}
            type="button"
            onClick={() => onCite(m[1])}
            title={c?.label}
            aria-label={`Source ${m[1]}: ${c?.label ?? "record"}`}
            style={{ "--c": tone } as React.CSSProperties}
            className="mx-0.5 inline-flex translate-y-[-1px] items-center rounded-[3px] bg-[color-mix(in_oklab,var(--c)_14%,transparent)] px-1.5 font-mono text-[11px] font-semibold text-(--c) shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--c)_35%,transparent)] hover:bg-[color-mix(in_oklab,var(--c)_25%,transparent)]"
          >
            {m[1]}
          </button>
        );
      })}
    </>
  );
}

function ToolTrace({ tools }: { tools: NonNullable<Extract<Turn, { role: "assistant" }>["tools"]> }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md bg-black/20 text-xs shadow-[inset_0_0_0_1px_var(--edge)]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-ink-faint hover:text-ink"
      >
        <Wrench aria-hidden className="size-3.5 text-system" />
        Ran {tools.length} read-only tool{tools.length > 1 ? "s" : ""} automatically
        <span className="ml-auto font-mono">{tools.map((t) => t.tool).join(" · ")}</span>
      </button>
      {open && (
        <ul className="animate-rise border-t border-white/[0.06] px-3 py-2 font-mono text-[11px]">
          {tools.map((t) => (
            <li key={t.tool} className="flex flex-wrap gap-x-2 py-0.5">
              <span className="text-system">{t.tool}</span>
              <span className="text-ink-faint">({t.args})</span>
              <span className="text-ink-muted">→ {t.result}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProposalCard({ proposal, decision, onDecide }: { proposal: Proposal; decision?: Decision; onDecide: (d: Decision) => void }) {
  const tone = proposal.external ? "var(--color-danger)" : "var(--color-personal)";
  return (
    <div
      role="group"
      aria-label={`Proposed action: ${proposal.title}`}
      style={{ "--p": tone } as React.CSSProperties}
      className="chamfer-sm relative overflow-hidden rounded-md bg-[color-mix(in_oklab,var(--p)_8%,rgb(10_15_32/0.8))] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--p)_40%,transparent)]"
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-[color-mix(in_oklab,var(--p)_25%,transparent)] px-4 py-2.5">
        {proposal.external ? <ShieldAlert aria-hidden className="size-4 text-(--p)" /> : <Lock aria-hidden className="size-4 text-(--p)" />}
        <span className="text-sm font-semibold text-ink">{proposal.title}</span>
        <span className="font-mono text-[11px] text-ink-faint">{proposal.tool}</span>
        <span className="text-meta ml-auto text-(--p)">{proposal.external ? "External · needs approval" : "Write · needs approval"}</span>
      </div>
      <dl className="grid grid-cols-[80px_1fr] gap-x-3 gap-y-1.5 px-4 py-3 text-sm">
        {proposal.fields.map(([k, v]) => (
          <Fragment key={k}>
            <dt className="text-ink-faint">{k}</dt>
            <dd className="text-ink">{v}</dd>
          </Fragment>
        ))}
      </dl>
      <div className="flex flex-wrap items-center gap-2 px-4 pb-3.5">
        {!decision && (
          <>
            <button
              type="button"
              onClick={() => onDecide("approved")}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-lime px-3.5 text-sm font-semibold text-void"
            >
              <Check aria-hidden className="size-4" /> Approve
            </button>
            <button
              type="button"
              onClick={() => onDecide("declined")}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-white/[0.06] px-3.5 text-sm text-ink hover:bg-white/[0.1]"
            >
              <X aria-hidden className="size-4" /> Decline
            </button>
            <span className="text-xs text-ink-faint">Nothing happens until you choose.</span>
          </>
        )}
        {decision === "approved" && (
          <p role="status" className="flex items-center gap-2 text-sm text-lime">
            <Check aria-hidden className="size-4" /> Approved — demo mode, nothing was written or sent.
          </p>
        )}
        {decision === "declined" && (
          <p role="status" className="flex items-center gap-2 text-sm text-ink-faint">
            <X aria-hidden className="size-4" /> Declined — no action taken.
          </p>
        )}
      </div>
    </div>
  );
}

function ContextPanel({ citations, highlight, audit }: { citations: Citation[]; highlight: string | null; audit: AuditEntry[] }) {
  return (
    <aside aria-label="Context and permissions" className="flex flex-col gap-5">
      <section>
        <Eyebrow className="mb-2">Records in use · {citations.length}</Eyebrow>
        {citations.length === 0 && <p className="text-sm text-ink-faint">No records cited in this conversation yet.</p>}
        <ul className="flex flex-col gap-1.5">
          {citations.map((c) => {
            const Icon = KIND_ICON[c.kind];
            const on = highlight === c.ref;
            return (
              <li
                key={c.ref}
                style={{ "--c": KIND_TONE[c.kind] } as React.CSSProperties}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-[background,box-shadow] duration-(--duration-spatial)",
                  on ? "bg-white/[0.09] shadow-[inset_0_0_0_1px_var(--c),0_0_20px_-8px_var(--c)]" : "bg-white/[0.03]",
                )}
              >
                <Icon aria-hidden className="size-4 shrink-0 text-(--c)" />
                <span className="min-w-0 flex-1 truncate text-ink-muted">{c.label}</span>
                <span className="font-mono text-[11px] text-(--c)">{c.ref}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <Eyebrow className="mb-2">Tool permissions</Eyebrow>
        <ul className="grid grid-cols-1 gap-1 text-xs">
          {TOOL_REGISTRY.map((t) => (
            <li key={t.name} className="flex items-center gap-2 rounded-[4px] px-2 py-1.5 odd:bg-white/[0.02]">
              <span className="font-mono text-ink-muted">{t.name}</span>
              <span className="ml-auto">
                {t.access === "read" ? (
                  <Chip tone="var(--color-positive)" className="py-0.5 text-[10px]">
                    read · auto
                  </Chip>
                ) : (
                  <Chip tone={t.external ? "var(--color-danger)" : "var(--color-personal)"} className="py-0.5 text-[10px]">
                    {t.external ? "external · approve" : "write · approve"}
                  </Chip>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-md bg-white/[0.03] p-3 text-xs leading-relaxed text-ink-faint shadow-[inset_0_0_0_1px_var(--edge)]">
        <p className="mb-1.5 flex items-center gap-1.5 font-semibold text-ink-muted">
          <Lock aria-hidden className="size-3.5" /> Data boundaries
        </p>
        Health and finance records are not shared with the assistant. Email and web content are treated as untrusted and cannot
        override these rules.
      </section>

      <section>
        <Eyebrow className="mb-2 flex items-center gap-1.5">
          <ScrollText aria-hidden className="size-3.5" /> Audit · this session
        </Eyebrow>
        {audit.length === 0 ? (
          <p className="text-xs text-ink-faint">No tool runs or decisions yet.</p>
        ) : (
          <ol className="flex flex-col gap-1 font-mono text-[11px]">
            {audit.map((a, i) => (
              <li key={i} className="animate-rise flex gap-2 text-ink-muted">
                <span className="text-ink-ghost">{a.at}</span>
                {a.text}
              </li>
            ))}
          </ol>
        )}
      </section>
    </aside>
  );
}
