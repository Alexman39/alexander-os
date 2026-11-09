import type { ReactNode } from "react";
import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/cn";

/* --------------------------------------------------------------------------
   DemoBadge — every demo surface carries one. Never hidden.
   -------------------------------------------------------------------------- */
export function DemoBadge({ className, label = "Demo data" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[3px] border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-meta text-warning",
        className,
      )}
    >
      <FlaskConical aria-hidden className="size-3" />
      {label}
    </span>
  );
}

/* --------------------------------------------------------------------------
   Eyebrow — compact mono metadata label
   -------------------------------------------------------------------------- */
export function Eyebrow({ children, className, tone }: { children: ReactNode; className?: string; tone?: string }) {
  return (
    <p className={cn("text-meta text-ink-faint", className)} style={tone ? { color: tone } : undefined}>
      {children}
    </p>
  );
}

/* --------------------------------------------------------------------------
   Chip — tags, statuses, filters (as toggle when `pressed` provided)
   -------------------------------------------------------------------------- */
interface ChipProps {
  children: ReactNode;
  tone?: string;
  className?: string;
  pressed?: boolean;
  onClick?: () => void;
  title?: string;
}
export function Chip({ children, tone, className, pressed, onClick, title }: ChipProps) {
  const base =
    "inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-xs font-medium transition-[background,color,box-shadow] duration-(--duration-quick)";
  const style = tone ? ({ "--chip": tone } as React.CSSProperties) : undefined;
  if (onClick) {
    return (
      <button
        type="button"
        aria-pressed={pressed}
        onClick={onClick}
        title={title}
        style={style}
        className={cn(
          base,
          "min-h-8 cursor-pointer",
          pressed
            ? "bg-lime text-void shadow-[0_0_0_1px_var(--color-lime),0_0_18px_-4px_var(--color-lime)]"
            : "bg-white/[0.04] text-ink-muted shadow-[inset_0_0_0_1px_var(--edge)] hover:bg-white/[0.08] hover:text-ink",
          className,
        )}
      >
        {children}
      </button>
    );
  }
  return (
    <span
      style={style}
      title={title}
      className={cn(
        base,
        tone
          ? "bg-[color-mix(in_oklab,var(--chip)_14%,transparent)] text-(--chip) shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--chip)_30%,transparent)]"
          : "bg-white/[0.05] text-ink-muted shadow-[inset_0_0_0_1px_var(--edge)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* --------------------------------------------------------------------------
   Meter — horizontal progress with value semantics
   -------------------------------------------------------------------------- */
export function Meter({
  value,
  label,
  tone = "var(--color-lime)",
  className,
  thin,
}: {
  value: number;
  label: string;
  tone?: string;
  className?: string;
  thin?: boolean;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
      className={cn("relative overflow-hidden rounded-full bg-white/[0.07]", thin ? "h-1" : "h-1.5", className)}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-(--ease-glide)"
        style={{ width: `${v}%`, background: tone, boxShadow: `0 0 12px -2px ${tone}` }}
      />
    </div>
  );
}

/* --------------------------------------------------------------------------
   Ring — circular progress for goals
   -------------------------------------------------------------------------- */
export function Ring({
  value,
  max,
  size = 64,
  stroke = 6,
  tone = "var(--color-lime)",
  children,
  label,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  tone?: string;
  children?: ReactNode;
  label: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ filter: `drop-shadow(0 0 6px ${tone})`, transition: "stroke-dashoffset 600ms var(--ease-glide)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Kbd — keyboard hint
   -------------------------------------------------------------------------- */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-grid min-w-5 place-items-center rounded-[3px] border border-white/15 bg-white/[0.06] px-1 font-mono text-[10px] leading-4 text-ink-muted",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

/* --------------------------------------------------------------------------
   PageHeading — large display title with module numeral
   -------------------------------------------------------------------------- */
export function PageHeading({
  index,
  title,
  kicker,
  children,
}: {
  index: string;
  title: string;
  kicker?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="text-meta text-(--module-accent)">{index}</span>
          <span aria-hidden className="h-px w-10 bg-(--module-accent) opacity-60" />
          {kicker}
        </div>
        <h1 className="text-display mt-1 text-4xl font-semibold leading-none text-ink sm:text-5xl lg:text-6xl">{title}</h1>
      </div>
      {children}
    </header>
  );
}
