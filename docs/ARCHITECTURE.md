# Alexander OS — Technical Architecture

## Initial architecture
Modular monolith. Next.js App Router, React, strict TypeScript, Tailwind CSS, shadcn/ui primitives customized to the design system, PostgreSQL, Prisma, Zod, server-side LLM API. Begin with scheduled jobs/cron; adopt durable queue infrastructure when operational needs justify it.

## Module boundaries
- `identity`: auth, sessions, permissions.
- `home`: composed read models and dashboard preferences.
- `organization`: tasks, projects, notes.
- `library`: books, games, movies and user-owned status.
- `intelligence`: source ingestion, articles, event clustering, relevance, briefings.
- `assistant`: conversations, tool registry, retrieval, approvals, audit.
- `integrations`: OAuth connections, provider adapters, sync cursors.
- `health`: workouts and nutrition, separated permissions.

## Flow
UI -> authenticated server route/action -> validation -> domain service -> database/provider. Background scheduler -> ingestion/sync service -> normalized records -> event processing -> briefing -> notification outbox. AI -> permissioned tool registry -> read models or approval requests; never direct arbitrary database access.

## Reliability and security
Idempotent ingestion and briefing jobs, retries with backoff, per-source rate limits, execution history, notification dedupe, timezone-aware scheduling, structured logs with redaction, encrypted provider tokens, minimal OAuth scopes, audit trail, backups, data export/delete.

## Decisions (2026-11-11)
Chosen for "free and logical for a single-user personal app". Revisit if usage, privacy needs or free-tier terms change. Free-tier facts were checked on 2026-11-11 and can change; re-check before relying on a specific limit.

| Area | Decision | Why | Known limits / watch-outs |
|---|---|---|---|
| Hosting | **Vercel Hobby** (cloud-hosted) | Free, built for Next.js, preview deploys from GitHub. Personal, non-commercial use fits the Hobby terms. | Vercel cron on Hobby runs at most once a day, with up to ±59 min timing, so it is not used for scheduling (see Scheduler). |
| Database | **Neon Postgres, Free plan** (via the Vercel Marketplace integration) | Free managed Postgres that scales to zero, works with Prisma, and supports `pgvector` for later personalisation. | 1 GB storage and 100 CU-hours per project per month. Writes fail at the storage cap (no surprise bill), so ingestion must store excerpts, not full articles (already required by DATABASE.md). |
| ORM / validation | **Prisma + Zod** (unchanged) | Already specified above. | — |
| Authentication | **Better Auth** with **Sign in with GitHub**, allowlisted to the owner's GitHub account | Free and open source; the Auth.js maintainers now recommend it for new projects. Sessions live in our own Postgres, with no third-party user store. | Any other GitHub account is rejected server-side. Add a passkey later if desired. |
| Scheduler | **GitHub Actions scheduled workflows** calling secret-protected job endpoints | The repo is public, so Actions minutes are free. This allows RSS ingestion several times a day plus the daily/weekly briefing. | GitHub cron can start late under load; jobs must be idempotent and record what actually ran (already required). The shared secret lives in GitHub and Vercel secrets, never in the repo. |
| LLM | **Google Gemini API, free tier**, behind a provider-agnostic interface in `src/lib/ai/` | The only $0 option. MVP use is limited to summarising public RSS excerpts into cited briefings. | Outside the EEA/Switzerland/UK, free-tier prompts and outputs may be used to improve Google products and read by human reviewers; inside them, paid-tier data terms apply to the free quota. Never send private records on the free tier. **Before Stage 4 (Assistant over private data), switch to a paid, no-training provider.** Low-cost option: Claude Haiku 5.5 at $0.10 / $0.50 per million input / output tokens, which is fractions of a cent per briefing. |
| Notifications | **In-app + Web Push** (no vendor), decided at Stage 2 | Free and needs no account. | Email delivery is postponed until it is actually needed. |

### Migrations (decided 2026-11-18)
- Migrations are generated into `prisma/migrations/` and reviewed by the owner before they are merged to `main`.
- CI applies every migration to a throwaway Postgres 18 and fails if `schema.prisma` and the migrations drift apart.
- **Vercel production builds run `prisma migrate deploy` before `next build`** (`scripts/migrate-on-deploy.mjs`, via `vercel.json`). A failed migration fails the build, so the previous deployment stays live. No production credentials are needed on a developer machine.
- Preview and local builds never migrate. **Known risk:** preview deployments currently use the production database (the Neon variables cover Preview and Production). Before previews run code that writes data, give them their own Neon branch.
- Local development uses the Neon `dev` branch (`.env.local`); `npm run db:deploy` applies migrations there.
- Neon's own `neon_auth` schema (created when the database was provisioned) is unused; Better Auth's tables live in `public`.

Accounts the owner must create (Claude cannot create them): Vercel (Hobby), Neon (through Vercel), a GitHub OAuth app for Better Auth, and a Gemini API key from Google AI Studio.
