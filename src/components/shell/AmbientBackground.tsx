/**
 * Ambient layer: three slow aurora fields, a fan of fine "ribbon" lines
 * (an original take on a console-era light wave), a horizon glow and grain.
 * Purely decorative — aria-hidden, pointer-events none, paused with
 * reduced motion or the ambient toggle.
 */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-abyss">
      {/* deep vertical gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#0d1733_0%,#070b18_55%,#04060e_100%)]" />

      <div className="aurora-blob aurora-blob--a left-[-10vw] top-[-20vh] h-[70vh] w-[60vw]" />
      <div className="aurora-blob aurora-blob--b right-[-15vw] top-[10vh] h-[60vh] w-[55vw]" />
      <div className="aurora-blob aurora-blob--c bottom-[-30vh] left-[20vw] h-[60vh] w-[60vw]" />

      {/* ribbon of light — thin parallel curves */}
      <svg
        className="absolute left-[-10%] top-[46%] h-[42vh] w-[120%] opacity-50 mix-blend-screen"
        viewBox="0 0 1200 300"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="ribbon-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--module-accent)" stopOpacity="0" />
            <stop offset="0.35" stopColor="var(--module-accent)" stopOpacity="0.55" />
            <stop offset="0.7" stopColor="#9fd4ff" stopOpacity="0.4" />
            <stop offset="1" stopColor="#9fd4ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#ribbon-grad)" strokeLinecap="round">
          <path className="ribbon-path" strokeWidth="1.2" d="M0 170 C 200 90, 380 250, 600 160 S 1000 70, 1200 150" />
          <path className="ribbon-path" strokeWidth="0.8" d="M0 185 C 220 110, 400 260, 610 175 S 990 95, 1200 168" />
          <path className="ribbon-path" strokeWidth="0.6" d="M0 150 C 180 70, 420 230, 590 140 S 1010 60, 1200 130" />
          <path className="ribbon-path" strokeWidth="2.2" strokeOpacity="0.35" d="M0 200 C 240 140, 380 270, 620 190 S 980 120, 1200 186" />
        </g>
      </svg>

      {/* horizon glow tinted by current module */}
      <div className="absolute inset-x-0 bottom-0 h-[38vh] bg-[radial-gradient(60%_100%_at_50%_100%,color-mix(in_oklab,var(--module-accent)_10%,transparent),transparent)] transition-[background] duration-1000" />

      {/* grain */}
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(130%_90%_at_50%_40%,transparent_55%,rgb(2_3_8/0.7)_100%)]" />
    </div>
  );
}
