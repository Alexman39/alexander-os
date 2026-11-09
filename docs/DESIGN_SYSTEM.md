# Alexander OS — Visual Identity and Interaction Design

## North star
An atmospheric personal command center inspired by Xbox 360 blades and tiles, PlayStation 3 XMB spatial navigation, and Windows 8.1 live information surfaces. Borrow their feeling of presence, not their exact assets or layouts. This is NOT a standard SaaS admin panel.

## Design qualities
Character, depth, calm motion, tactile selection, rich content, legible hierarchy, immersive navigation, subtle delight, meaningful information density.

## Visual language
- Base: midnight navy/charcoal with layered aurora-like ambient gradients; optional lighter themes later.
- Accent: electric lime for selection, cool blue for system, violet for intelligence, warm amber for personal highlights. Semantic colors must remain consistent.
- Surfaces: layered translucent panels, edge highlights, soft inner glow, restrained blur, clear elevation hierarchy.
- Layout: distinct navigation rail or ribbon, hero briefing surface, asymmetric tiles, compact lower information panels. Avoid endless identical cards.
- Typography: contemporary highly legible sans-serif, strong display headings, compact metadata. Do not use novelty fonts for body copy.
- Imagery: cover art and contextual illustrations where useful; never fill the interface with unrelated stock photos.
- Icons: consistent vector icon family with generous hit targets.

## Motion
- Spatial transitions 180–350ms, purposeful rather than constant.
- Focused tiles may subtly lift, illuminate, and reveal detail.
- Ambient background motion is very slow, non-distracting, and optional.
- Support `prefers-reduced-motion`; no essential information conveyed only by animation.
- Avoid autoplay audio. Any UI sounds must be opt-in and muted by default.

## Interaction model
- Mouse, touch, and keyboard first-class. Arrow-key navigation may be an enhancement; standard Tab/Enter/Escape must always work.
- Clear selected, focused, loading, empty, and error states.
- Quick capture accessible globally; command palette planned.
- Desktop is immersive; mobile rearranges to a practical compact navigation and stacked surfaces.
- No hover-only controls; maintain WCAG AA contrast where feasible.

## Required screens for initial design review
1. Home: hero briefing, modules, today, progress, intelligence.
2. Library: covers, filters, progress, ownership, rich detail view.
3. Intelligence: feed, source provenance, relevance explanation, digest.
4. Assistant: conversational workspace with cited records and action confirmations.

## Anti-patterns
Generic white sidebar + monotonous rounded cards; featureless gradient blobs; excessive glass that reduces readability; fake charts or fabricated activity; decorative animation that delays work; unbounded carousels; copied console trademarks or assets.

## Design approval gate
Before building full functionality, create a high-fidelity clickable front-end prototype with representative explicitly labeled demo data. Show desktop and mobile views. Request approval of navigation, colors, typography, tile density, motion, and information hierarchy. Do not silently replace the design with a component-library default.
