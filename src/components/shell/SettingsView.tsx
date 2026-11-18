"use client";

import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useOs, type MotionPref } from "./OsProvider";
import { DemoBadge, Eyebrow, Kbd, PageHeading } from "@/components/ui/primitives";

const SHORTCUTS: Array<[ReactNode, string]> = [
  [<Kbd key="k">Ctrl K</Kbd>, "Command palette"],
  [<Kbd key="c">C</Kbd>, "Quick capture"],
  [
    <Fragment key="b">
      <Kbd>[</Kbd> <Kbd>]</Kbd>
    </Fragment>,
    "Previous / next module",
  ],
  [
    <Fragment key="a">
      <Kbd>←</Kbd> <Kbd>→</Kbd>
    </Fragment>,
    "Move along the crossbar or a shelf",
  ],
  [<Kbd key="e">Esc</Kbd>, "Close any panel"],
];

export function SettingsView() {
  const { motion, setMotion, ambient, setAmbient, reducedMotion } = useOs();
  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-6 pt-2 lg:pt-4">
      <PageHeading index="09 · Settings" title="Settings" />

      <Panel title="Motion" eyebrow="Accessibility">
        <div role="radiogroup" aria-label="Motion preference" className="grid gap-2 sm:grid-cols-3">
          {(
            [
              ["system", "Follow system", "Respect the OS reduced-motion setting"],
              ["reduced", "Reduced", "No spatial transitions, no live-tile rotation"],
              ["full", "Full", "All transitions, even if the OS asks for less"],
            ] as Array<[MotionPref, string, string]>
          ).map(([v, l, d]) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={motion === v}
              onClick={() => setMotion(v)}
              className={cn(
                "rounded-md p-3 text-left transition-[background,box-shadow]",
                motion === v
                  ? "bg-lime/[0.12] shadow-[inset_0_0_0_1.5px_var(--color-lime)]"
                  : "bg-white/[0.04] hover:bg-white/[0.07]",
              )}
            >
              <span className="block text-sm font-semibold text-ink">{l}</span>
              <span className="mt-0.5 block text-xs text-ink-faint">{d}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          Currently: {reducedMotion ? "reduced motion active" : "full motion active"}.
        </p>
      </Panel>

      <Panel title="Ambience" eyebrow="Atmosphere">
        <Row
          label="Ambient background motion"
          hint="Slow aurora drift and light ribbon. Paused automatically with reduced motion."
        >
          <Toggle checked={ambient} onChange={() => setAmbient(!ambient)} label="Ambient background motion" />
        </Row>
        <Row label="Interface sounds" hint="Opt-in only, muted by default. Not available in this prototype.">
          <Toggle checked={false} onChange={() => {}} label="Interface sounds" disabled />
        </Row>
      </Panel>

      <Panel title="Demo mode" eyebrow="Data">
        <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
          <DemoBadge label="On" />
          Everything you see is fictional sample data. No database, authentication or external API is connected. Edits
          live only in this browser tab.
        </div>
      </Panel>

      <Panel title="Keyboard" eyebrow="Shortcuts">
        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-2.5 text-sm">
          {SHORTCUTS.map(([k, d], i) => (
            <Fragment key={i}>
              <dt className="flex gap-1">{k}</dt>
              <dd className="text-ink-muted">{d}</dd>
            </Fragment>
          ))}
        </dl>
        <p className="mt-3 text-xs text-ink-faint">
          Tab, Enter and Escape always work; arrow-key navigation is an enhancement.
        </p>
      </Panel>
    </div>
  );
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`set-${title}`} className="rounded-(--radius-panel) p-5 surface-1">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={`set-${title}`} className="mt-0.5 mb-4 text-display text-lg font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 border-t border-white/[0.06] py-3 first:border-0 first:pt-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-ink-faint">{hint}</p>
      </div>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40",
        checked ? "bg-lime" : "bg-white/15",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-0.5 size-5 rounded-full transition-[left] duration-(--duration-quick) ease-(--ease-snap)",
          checked ? "left-[22px] bg-void" : "left-0.5 bg-ink-muted",
        )}
      />
    </button>
  );
}
