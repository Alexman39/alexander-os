# Alexander OS — Data Model Specification

## General rules
UUID identifiers; created_at/updated_at timestamps; explicit user ownership on personal records; migrations reviewed before application; unique constraints for idempotency; soft-delete only when justified. Never store credentials in plaintext.

## Core entities
User, UserPreference, Project, Task, Note, CalendarConnection, EmailConnection, IntegrationSyncRun, AssistantConversation, AssistantMessage, AssistantToolCall, ActionApproval, AuditEvent.

## Library entities
MediaItem(id, type: BOOK|GAME|MOVIE, external_provider, external_id, title, metadata, cover_url); LibraryEntry(user_id, media_item_id, ownership_status, progress_status, progress_value, rating, notes, started_at, completed_at); Collection and CollectionItem. Distinguish catalog metadata from the user's personal record.

## Intelligence entities
Interest(user_id, name, enabled, delivery_frequency, priority, timezone); InterestFilter(interest_id, term, weight, excluded); Source(name, url, source_type, trust_profile, refresh_interval); SourceInterest(source_id, interest_id); Article(source_id, canonical_url, title, excerpt, published_at, content_hash); Event(canonical_title, summary, first_seen_at, updated_at); EventArticle(event_id, article_id, similarity); EventScore(user_id, event_id, interest_id, score, explanation, model_version); Briefing(user_id, type, period_start, period_end, status); BriefingItem(briefing_id, event_id, rank); Feedback(user_id, event_id, action); MonitoringRun(source_id, status, cursor, error, started_at, finished_at); NotificationOutbox(user_id, event_key, channel, status, delivered_at).

## Constraints
Unique normalized article URL where available; unique provider+external_id for catalog items; unique user+media_item library entry; unique briefing+event item; unique notification user+event_key+channel. Store provenance and original URLs for claims. Avoid storing full copyrighted article text unless permitted.

## Future additions
Embeddings via pgvector, health datasets, financial records, user knowledge graph, multiple users/tenants. These are not MVP prerequisites.
