import Link from "next/link";

/** Original monogram: a chevron "A" split by an orbit line. */
export function Monogram({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="mono-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e9ffb0" />
          <stop offset="1" stopColor="#c8ff3c" />
        </linearGradient>
      </defs>
      <path d="M16 3 L29 28 H22.5 L16 15 L9.5 28 H3 Z" fill="url(#mono-g)" />
      <ellipse cx="16" cy="20" rx="14.5" ry="3.2" fill="none" stroke="#52c7ff" strokeWidth="1.4" transform="rotate(-12 16 20)" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <Link href="/" className="group flex items-center gap-2.5 rounded-md pr-2" aria-label="Alexander OS — Home">
      <span className="transition-transform duration-(--duration-spatial) ease-(--ease-snap) group-hover:rotate-[-8deg]">
        <Monogram />
      </span>
      <span className="text-display text-[15px] font-semibold tracking-tight text-ink">
        Alexander<span className="text-lime">OS</span>
      </span>
    </Link>
  );
}
