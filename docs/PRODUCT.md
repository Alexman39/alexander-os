# Alexander OS — Product Requirements

## Vision
A private personal operating system that unifies work, university, projects, tasks, calendar, personal life, fitness, nutrition, finance, reading, games, movies, knowledge, and proactive intelligence. An AI assistant retrieves grounded information, helps plan, and proposes permissioned actions.

## Product principles
1. Useful without AI; AI enhances rather than replaces ordinary controls.
2. Capture quickly; retrieve effortlessly; act deliberately.
3. A warm, memorable, console-inspired interface with depth and personality.
4. Proactive when helpful, quiet when not; user controls notification sensitivity.
5. Private by design; explicit consent for connected services.
6. Progressive delivery; each milestone works independently.

## Navigation
Home, Life, Work, University, Health, Library, Intelligence, Assistant, Settings. Allow personalized pinning and reordering in later versions.

## Core features
- Home: today's briefing, schedule, focus, quick capture, current projects, progress, intelligence feed.
- Tasks and projects: status, priority, due dates, next action, tags, notes.
- Library: books, games, movies, ownership, wishlist/backlog, in-progress/completed, ratings, notes, metadata, cover art.
- Intelligence: monitored topics, sources, deduplicated events, relevance, citations, daily/weekly briefing, feedback.
- Assistant: chat, context retrieval, tool calls, clear evidence, proposed actions and confirmations.
- Integrations: Google Calendar and Gmail first, other providers later.
- Health: workout and nutrition tracking as independent modules with sensitive-data controls.

## MVP 0.1
Secure single-user shell, polished Home, tasks/projects, interest settings, source registry, basic RSS ingestion, deduplicated feed, manually triggered cited briefing. Use seeded demo data only in an explicitly labeled demo mode.

## Not in MVP 0.1
Autonomous email sending, financial transactions, broad agent autonomy, native apps, complex gamification, multi-user SaaS, advanced vector personalization.

## Success criteria
- User can capture and retrieve a task in under 15 seconds.
- Home shows actual stored data and graceful empty states.
- Interest feed shows source links and dates.
- Repeated ingestion does not duplicate articles.
- A briefing never fabricates sources or claim a scheduled job ran when it did not.
