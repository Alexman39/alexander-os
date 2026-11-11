# Alexander OS

A private personal operating system. **Current state: Stage 0 visual prototype** — a clickable front end with explicitly labelled demo data. There is no backend, authentication, database, LLM, or external API.

- Product & spec: `docs/PRODUCT.md`, `docs/DESIGN_SYSTEM.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`
- Prototype design rationale & open questions: **`docs/DESIGN_DECISIONS.md`**
- Accounts & secrets setup (Vercel, Neon, GitHub OAuth, Gemini): **`docs/SETUP.md`**, with variables listed in `.env.example`

## Run

```bash
npm install
npm run dev            # http://localhost:3000
```

## Verify

```bash
npm run lint
npm run typecheck
npm run build
npm test               # Playwright: unit + desktop + mobile; starts `next start` on :3100 (build first)
npm run verify         # all of the above
```

Playwright is pinned to 1.64.1. If its browser is missing: `npx playwright install chromium`.

## Try it

| Key | Action |
|---|---|
| `Ctrl/⌘ K` | Command palette |
| `C` | Quick capture |
| `[` `]` | Previous / next module |
| `← →` | Move along the crossbar, blades or library shelves |
| `Esc` | Close any panel |

Home → "Design review" bar previews every tile in loading / empty / error states. Settings → Motion switches between system, reduced and full motion.
