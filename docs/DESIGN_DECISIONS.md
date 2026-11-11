# Alexander OS — Prototype Design Decisions

Stage 0 visual prototype. This records **what was decided, why, and what is still open for approval**. It complements `DESIGN_SYSTEM.md` (the brief) — where they disagree, the brief wins until amended.

Status: built, verified, and **design approved on 2026-11-09** (see §10 for the decisions taken). Architecture decisions were made on 2026-11-11 (see `ARCHITECTURE.md`).

---

## 1. Concept: "a lit room you move through"

The three references are borrowed for *feeling*, never for assets or layouts:

| Reference | What we took | How it appears |
|---|---|---|
| PS3 XMB | Spatial, horizontal movement; one item "lit" at a time; ambient light wave | **Crossbar** top navigation, directional page transitions, ribbon-of-light background |
| Xbox 360 dashboard | Slanted blades; bold, tactile tiles with personality | **Blades** for in-module sections (Library types), chamfered hero surfaces, tone stripes |
| Windows 8.1 | Live surfaces that carry information, not decoration | **Live tiles** that flip through real content with visible controls |

No console logos, sounds, icons, fonts, colours-as-trade-dress or layouts are copied. The monogram, ribbon, covers and blade shapes are original.

## 2. Navigation

- **Crossbar (desktop ≥1024px).** All nine modules in PRODUCT.md order. The active module is lit: larger icon, accent fill, lime under-glow, visible label. Inactive items *recede with distance* from the active one. Labels are always present for assistive tech.
  - **Wide screens show every label.** A container query on the crossbar itself (`@min-[66.5rem]/xb`) shows all labels once the bar has room — measured at ~1040px of labels, i.e. roughly ≥1640px viewports. Below that, inactive items are icon-only and expand on hover **and** keyboard focus. Using the bar's own width (not a viewport breakpoint) means it adapts if the header's other contents change.
  - Keyboard: a single tab stop (roving tabindex); `←/→`, `Home/End` move; `Enter/Space` go. `[` / `]` jump to previous/next module from anywhere.
- **Directional transitions.** Moving right along the crossbar slides content in from the right (and vice versa), reinforcing the spatial model. 320ms, ease-out.
- **Mobile (<1024px).** Bottom dock with **Home, Life, Work, Assistant** (chosen in review) + **More** sheet listing all nine as a tile grid. Life and Work are still reserved placeholders until Stage 1; Library and Intelligence are one tap away via More. Desktop is not shrunk — each view re-flows to stacked surfaces with horizontally scrolling rails where a row would otherwise wrap awkwardly (blades, interests, conversations, shelves).
- **Command palette** (`Ctrl/⌘ K`) and **Quick capture** (`C`, or the lime `+`) are global. Capture is three keystrokes from anywhere, targeting the <15s capture criterion.

## 3. Visual language

### Colour (tokens in `src/app/globals.css` → `@theme`)
- **Base:** midnight navy layers `void → abyss → deep → navy → slate`.
- **Semantic accents — fixed meanings, never decorative:**
  - `lime #c8ff3c` — selection, focus, "you are here", primary confirm. Every focus ring is lime.
  - `system #52c7ff` — schedule, system state, assistant chrome.
  - `intel #ad8cff` — intelligence, briefings, relevance.
  - `personal #ffb648` — library, personal highlights.
  - Status: `positive`, `warning` (also the **demo badge**), `danger` (also *external* actions).
- **Ink** is tuned for WCAG AA on the deep base (`ink-muted` ≈ 8:1, `ink-faint` ≈ 5:1). `ink-ghost` is reserved for non-essential IDs.
- **Per-module ambience:** each module sets `--module-accent` and an aurora palette; the Library additionally tints the room with the focused item's cover colour. This is the only place colour is used "for mood", and it sits behind content.

### Surfaces & depth
Three elevation utilities (`surface-1/2/3`): translucent navy, restrained blur (14–24px), inner edge highlight, layered shadow. Hero surfaces add a **chamfered top-right corner** — the signature machined cut. Radii are deliberately tight (6px tiles, 10px panels) to avoid the soft SaaS look. Every tile carries a 3px **tone stripe** in its semantic colour, so hierarchy is legible even in greyscale density.

### Typography
- **Display:** Bricolage Grotesque — characterful, condensed-leaning, strong at 48–72px for module titles.
- **Body:** Geist Sans — neutral, highly legible at 13–15px.
- **Meta:** Geist Mono, uppercase, tracked — eyebrows, IDs, timestamps. Gives the "system readout" texture without a novelty font.

### Imagery
No stock photos. Library covers are **procedurally generated** (palette + pattern + typography, sized with container-query units) until a metadata provider with clear attribution is connected. Decorative SVG (orbits, ribbon) is `aria-hidden` and `pointer-events: none`.

## 4. Layout per screen

- **Home** — asymmetric 12-column field: a wide chamfered **briefing hero**, a tall **Today** timeline (demo events placed on the *real* Athens clock with a live "now"/"next"), **Focus** tasks with a session inbox, two **live tiles** (Intelligence, Library "Now"), **Progress** rings, **Projects**, an **Assistant** entry, and four compact module shortcuts. No two neighbouring tiles share a size.
- **Library** — Blades (type) + ownership filter on the left; a **stage** that "spotlights" the focused item (large tilted cover, status, progress, rating, notes) and re-tints the room; **shelves** grouped by status. Arrow keys move along and between shelves; focus *is* selection (XMB-style). Detail opens as a right **blade sheet** where ownership and progress are separate controls (owning ≠ finishing).
- **Intelligence** — interest rail (with monitor toggles and cadence), a **lead story** with a 270° score dial, then compact rows with score, tier stripe, interest colour, provenance strip and an inline Save. "Evidence, sources & feedback" expands: what happened / why it matters / personal relevance / possible action, **sources with dates and domains**, a **per-factor relevance breakdown** (value × weight → points), and feedback actions. A **Digest** panel shows daily/weekly cadence, Athens schedule, and says plainly that notifications are off and no job has run.
- **Assistant** — conversation blades, a transcript (not chat bubbles) with **tool traces** ("ran 2 read-only tools automatically"), inline **citation chips** that light up the matching record in the **Context** panel, and **proposal cards** for write actions with Approve/Decline. External actions (`send_email`, `schedule_event`) are styled in danger and labelled "External · needs approval". The context panel shows the tool registry with read/auto vs write/approve, data boundaries (health, finance), and a session audit log.
- **Settings** — motion preference (System / Reduced / Full), ambient motion toggle, sounds (opt-in, disabled), demo-mode explanation, shortcut reference.
- **Life / Work / University / Health** — honest reserved states naming the planned stage and scope; no fake data.

## 5. Motion

| Motion | Duration | Purpose |
|---|---|---|
| Page enter (directional) | 320ms | Spatial orientation |
| Tile lift + edge illumination on hover/focus | 320ms | Tactile selection |
| Cover lift + lime ring on focus | 320ms snap | "You are here" on shelves |
| Live-tile face flip | 520ms every 6.5–8s | Information rotation |
| Aurora drift / ribbon | 38–110s loops | Ambience only |

- **Reduced motion:** honours `prefers-reduced-motion`, overridable in Settings (`data-motion` on `<html>`). Under reduced motion: transitions collapse to ~0ms, live tiles **stop auto-rotating** (manual *Next* remains), and the transcript scrolls without smoothing.
- **Ambient motion** can be paused independently (`data-ambient`) for users who like transitions but not background movement.
- No information is conveyed only by animation; every live tile has pause/next controls and an item counter for screen readers.

## 6. Accessibility

Skip link; landmarks on every view; native `<dialog>` for all overlays (focus containment, `Esc`, inert background, focus return); roving tabindex for crossbar, blades and shelves; ARIA tabs/radio/switch/meter semantics; 32–44px hit targets; no hover-only controls; visible lime focus everywhere; `aria-live` for toasts, transcript, and stage changes.

## 7. Demo data policy

- All data lives in `src/lib/demo/*` with a header comment stating it is fictional.
- Every surface showing it carries a **Demo** badge; the header shows **Demo mode** globally.
- Intelligence headlines and sources are **fictional**; source URLs use reserved `example.com/.org` domains so nothing can be mistaken for real news or attributed to a real publication.
- Library uses real titles only as representative examples; all personal fields are invented; covers are generated.
- The UI never claims a job ran, a briefing was generated, or an action executed: "Last ingestion: never", "nothing was written or sent", "no model connected".
- Edits (capture, ratings, progress, approvals) live in React state for the tab only.

## 8. Implementation notes

- Next.js 16 (App Router, Cache Components on), React 19, TypeScript strict, Tailwind v4 (`@theme` tokens + custom utilities). `lucide-react` is the single icon family. No component library — primitives are in `src/components/ui`.
- Client-only values (clock, media queries, preferences) use `useSyncExternalStore` so SSR and hydration agree.
- `overflow-x: clip` on the root prevents directional transitions from widening the mobile layout viewport (a real bug found in testing).

### Structure
```
src/app/                 routes: /, /library, /intelligence, /assistant, /settings, /[module]
src/components/shell/    OsProvider (prefs, capture, toasts), Shell, Crossbar, MobileDock,
                         CommandPalette, QuickCapture, Sheet, AmbientBackground, Clock
src/components/ui/       primitives (DemoBadge, Chip, Meter, Ring, Kbd, PageHeading), Tile, Blades
src/components/<module>/ Home, Library, Intelligence, Assistant views
src/lib/                 nav model, relevance scoring, client stores, demo/* datasets
tests/unit, tests/e2e    Playwright (unit + desktop + Pixel 7)
```

## 9. Verification (what actually ran)

- `npm run lint`, `npm run typecheck`, `npm run build` — clean.
- `npx playwright test` — 30 passed (7 unit tests for relevance scoring; 20 desktop browser tests; 3 mobile browser tests), stable across 3 consecutive runs. Covers crossbar mouse+keyboard and wide/narrow label behaviour, `[`/`]`, palette, capture, Escape, tile state previews, task toggle, Home→Assistant handoff, library detail/ownership/status/rating, 2-D shelf keyboard nav, filters, intelligence evidence/provenance/feedback/mute, assistant approve/decline/external flag/citations/demo honesty, reduced-motion behaviour, motion & ambient preferences, mobile dock + More sheet, mobile layout-viewport width, assistant no-scroll-on-load.
- Visual inspection of screenshots at 1440×900 and 390/412px wide for Home, Library, Intelligence, Assistant, Settings and a placeholder module, plus detail blade, expanded evidence and palette states.

Not verified: screen-reader walkthrough (only semantics were checked), Safari/Firefox rendering, real touch devices, contrast measured with a tool rather than by token design.

## 10. Review decisions (2026-11-09)

| Question | Decision |
|---|---|
| Crossbar labels | **Show all labels on wide screens**, icons only (expand on hover/focus) on narrower ones — implemented via container query. |
| Home tile density | **Keep.** Density is right for a command center; familiarity will make it faster. |
| Lime accent | **Keep** as is. |
| Display face | **Keep** Bricolage Grotesque. |
| Ambient motion default | **On** — it makes the system feel alive. Still pausable in Settings and off under reduced motion. |
| Mobile dock | **Home, Life, Work, Assistant** (+ More). Revisit after Life/Work have real content. |
| Generated covers | **Acceptable fallback** when no cover art is available from a provider. Real art preferred when the provider supplies it with attribution. |
