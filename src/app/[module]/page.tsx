import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { NAV } from "@/lib/nav";
import { Eyebrow, PageHeading } from "@/components/ui/primitives";

const PLANNED: Record<string, { stage: string; features: string[] }> = {
  life: { stage: "Later stage", features: ["Routines and errands", "Personal finance (explicit data boundary)", "Life admin projects"] },
  work: { stage: "Stage 1", features: ["Tasks with priority, due dates and next actions", "Projects and notes", "Quick capture inbox"] },
  university: { stage: "Stage 1", features: ["Courses and deadlines", "Thesis project tracking", "Lecture schedule from calendar (Stage 5)"] },
  health: { stage: "Stage 5", features: ["Workout log", "Nutrition tracking", "Sensitive-data permissions, never shared with the assistant by default"] },
};

export function generateStaticParams() {
  return Object.keys(PLANNED).map((module) => ({ module }));
}

export async function generateMetadata({ params }: { params: Promise<{ module: string }> }): Promise<Metadata> {
  const { module } = await params;
  return { title: NAV.find((m) => m.id === module)?.label ?? "Module" };
}

export default async function ModulePlaceholder({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const mod = NAV.find((m) => m.id === module);
  const plan = PLANNED[module];
  if (!mod || !plan) notFound();
  const Icon = mod.icon;
  const idx = String(NAV.indexOf(mod) + 1).padStart(2, "0");

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-8 pt-2 lg:pt-4">
      <PageHeading index={`${idx} · ${mod.label}`} title={mod.label} />
      <section
        aria-labelledby="not-designed"
        className="surface-2 chamfer relative overflow-hidden rounded-(--radius-panel) p-6 sm:p-10"
        style={{ "--m": mod.accent } as React.CSSProperties}
      >
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full opacity-25 blur-3xl" style={{ background: mod.accent }} />
        <Icon aria-hidden className="relative size-12 text-(--m)" strokeWidth={1.4} />
        <Eyebrow className="relative mt-6" tone="var(--m)">
          {plan.stage} · not part of this design review
        </Eyebrow>
        <h2 id="not-designed" className="text-display relative mt-2 max-w-xl text-3xl font-semibold leading-tight">
          This space is reserved. Nothing is shown here until real data exists.
        </h2>
        <ul className="relative mt-6 grid gap-2 sm:grid-cols-3">
          {plan.features.map((f) => (
            <li key={f} className="rounded-md bg-white/[0.04] p-3 text-sm text-ink-muted shadow-[inset_0_0_0_1px_var(--edge)]">
              {f}
            </li>
          ))}
        </ul>
        <Link
          href="/"
          className="relative mt-8 inline-flex h-10 items-center gap-2 rounded-md bg-white/[0.06] px-4 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_var(--edge-strong)] hover:bg-white/[0.1]"
        >
          Back to Home <ArrowRight aria-hidden className="size-4" />
        </Link>
      </section>
    </div>
  );
}
