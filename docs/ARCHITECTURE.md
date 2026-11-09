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

## Decisions to confirm
Hosting and database provider, authentication provider, LLM provider, push/email delivery provider, and whether deployment is cloud-hosted or self-hosted. Do not pretend these are settled.
