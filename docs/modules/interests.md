# Interest Intelligence — Feature Specification

## Initial interests
AI & LLMs: daily; Business & Entrepreneurship: daily; Software Development: weekly; Cybersecurity: weekly; Fitness & Nutrition Science: weekly; Video Games & Releases: weekly. All enabled. Monitoring cadence is independent from delivery cadence. Default timezone Europe/Athens; user may change it.

## Pipeline
Source registry -> scheduled fetch -> parse/normalize -> canonical URL/content hash -> candidate event search -> same-event classification -> relevance scoring -> briefing selection -> grounded summary -> delivery and audit.

## Sources
Prefer official announcements, permitted RSS/Atom feeds and APIs, and domain-specific authoritative sources. Track provider URL, licensing constraints, trust profile, refresh interval, ETag/Last-Modified, error state. No scraping around access restrictions.

## Deduplication
Exact canonical URLs/provider IDs/content hashes first; then embeddings of titles/excerpts and event verification. Similar subject does not imply same event. Significant follow-up developments remain distinct. Tune thresholds with labeled examples.

## Relevance
Initial weights: interest match 30, impact 25, personal usefulness 20, evidence quality 15, freshness/novelty 10. Normalize weights; score 0–100; threshold 85 high, 70 medium, below 70 feed-only by default. Keep score explanation and model version. Never treat scores as objective truth.

## Briefings
Daily AI and business; weekly other four plus recap. Default example times 08:00 daily, Sunday 09:00 weekly Europe/Athens; ask user to confirm before enabling notifications. Briefing items: what happened, evidence/source, why it matters, personal relevance, possible action. Empty briefings are valid. Store source links and timestamps.

## Feedback
Save, dismiss, irrelevant, mute topic, follow source. Explicit feedback precedes inferred preference learning. Prevent duplicate notifications via outbox idempotency key.

## Acceptance tests
Same feed fetched twice creates no duplicates; distinct updates aren't merged; source outages don't break other feeds; citations resolve; unsupported claims rejected; daylight saving handled; quiet hours respected; no fabricated headlines.
