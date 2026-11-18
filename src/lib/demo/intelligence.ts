/**
 * DEMO DATA — Interest Intelligence.
 * Every headline, summary and source here is FICTIONAL and written for
 * design review. Source domains use example.com/.org (RFC 2606 reserved
 * names) so nothing can be mistaken for a real publication or real news.
 * No ingestion job has run; no briefing has been generated.
 */
import type { FactorScores } from "@/lib/relevance";

export type Cadence = "daily" | "weekly";

export interface Interest {
  id: string;
  name: string;
  cadence: Cadence;
  enabled: boolean;
  color: string;
}

export interface SourceRef {
  name: string;
  url: string;
  published: string; // ISO
  kind: "official" | "feed" | "analysis";
}

export interface IntelEvent {
  id: string;
  interestId: string;
  title: string;
  summary: string;
  whyItMatters: string;
  personalRelevance: string;
  possibleAction: string;
  factors: FactorScores;
  sources: SourceRef[];
  firstSeen: string; // ISO
}

/** Initial interests — docs/modules/interests.md. */
export const DEMO_INTERESTS: Interest[] = [
  { id: "ai", name: "AI & LLMs", cadence: "daily", enabled: true, color: "#ad8cff" },
  { id: "biz", name: "Business & Entrepreneurship", cadence: "daily", enabled: true, color: "#ffb648" },
  { id: "dev", name: "Software Development", cadence: "weekly", enabled: true, color: "#52c7ff" },
  { id: "sec", name: "Cybersecurity", cadence: "weekly", enabled: true, color: "#ff6f7d" },
  { id: "fit", name: "Fitness & Nutrition Science", cadence: "weekly", enabled: true, color: "#3ee6bd" },
  { id: "games", name: "Video Games & Releases", cadence: "weekly", enabled: true, color: "#c8ff3c" },
];

export const DEMO_EVENTS: IntelEvent[] = [
  {
    id: "EV-101",
    interestId: "ai",
    title: "Open-weight model family adds long-context variants; independent benchmarks pending",
    summary:
      "A fictional lab released three open-weight checkpoints with extended context windows. Claimed retrieval accuracy has not yet been replicated by third parties.",
    whyItMatters:
      "Long-context open models could make local retrieval over personal notes viable without a hosted API.",
    personalRelevance: "Directly related to your thesis on retrieval evaluation (P-1).",
    possibleAction: "Add to thesis reading list; revisit once replication results appear.",
    factors: { interest: 98, impact: 86, usefulness: 92, evidence: 70, freshness: 95 },
    sources: [
      {
        name: "Demo Lab Blog",
        url: "https://example.com/demo-lab/release-notes",
        published: "2026-11-09T07:12:00Z",
        kind: "official",
      },
      {
        name: "Example ML Weekly",
        url: "https://example.org/ml-weekly/long-context",
        published: "2026-11-09T09:40:00Z",
        kind: "analysis",
      },
      {
        name: "Sample Research Feed",
        url: "https://example.org/research-feed/41823",
        published: "2026-11-09T10:05:00Z",
        kind: "feed",
      },
      { name: "Demo Wire", url: "https://example.com/wire/ai-models", published: "2026-11-09T11:30:00Z", kind: "feed" },
    ],
    firstSeen: "2026-11-09T07:20:00Z",
  },
  {
    id: "EV-102",
    interestId: "ai",
    title: "Agent tool-permission specification reaches public draft",
    summary:
      "A fictional standards group published a draft describing how AI agents should request, scope and log tool permissions, including mandatory confirmation for external side effects.",
    whyItMatters: "Mirrors the approval model planned for the Alexander OS assistant.",
    personalRelevance: "Relevant to the assistant module design (read tools auto, write tools approved).",
    possibleAction: "Compare the draft's audit fields with the AssistantToolCall entity.",
    factors: { interest: 92, impact: 80, usefulness: 95, evidence: 82, freshness: 88 },
    sources: [
      {
        name: "Example Standards Group",
        url: "https://example.org/standards/agent-permissions-draft",
        published: "2026-11-08T16:00:00Z",
        kind: "official",
      },
      {
        name: "Demo Dev Digest",
        url: "https://example.com/dev-digest/agents",
        published: "2026-11-09T06:30:00Z",
        kind: "analysis",
      },
      {
        name: "Demo Wire",
        url: "https://example.com/wire/agent-spec",
        published: "2026-11-09T08:15:00Z",
        kind: "feed",
      },
    ],
    firstSeen: "2026-11-08T16:20:00Z",
  },
  {
    id: "EV-104",
    interestId: "biz",
    title: "Analysis: developer-tool vendors shift from seats to usage-based pricing",
    summary:
      "A fictional analyst note tracks pricing-page changes across a sample of developer-tool companies over two quarters.",
    whyItMatters: "Pricing model shifts affect what a solo builder pays for infrastructure.",
    personalRelevance: "Moderate — relevant if Alexander OS is hosted on paid services.",
    possibleAction: "Note for the hosting decision in ARCHITECTURE.md.",
    factors: { interest: 80, impact: 70, usefulness: 72, evidence: 74, freshness: 76 },
    sources: [
      {
        name: "Sample Market Notes",
        url: "https://example.com/market-notes/usage-pricing",
        published: "2026-11-09T05:00:00Z",
        kind: "analysis",
      },
      {
        name: "Demo Founder Letter",
        url: "https://example.org/founder-letter/pricing",
        published: "2026-11-08T19:00:00Z",
        kind: "analysis",
      },
    ],
    firstSeen: "2026-11-09T05:10:00Z",
  },
  {
    id: "EV-105",
    interestId: "sec",
    title: "Advisory: prompt-injection via calendar invites in sample mail clients",
    summary:
      "A fictional vendor advisory describes hidden instructions in event descriptions being read by assistant integrations.",
    whyItMatters: "Calendar and email are the first planned integrations; their content must be treated as untrusted.",
    personalRelevance: "High for Stage 5 integration design.",
    possibleAction: "Add an injection fixture to the integration test plan.",
    factors: { interest: 78, impact: 88, usefulness: 90, evidence: 85, freshness: 70 },
    sources: [
      {
        name: "Example Security Advisories",
        url: "https://example.org/advisories/2026-114",
        published: "2026-11-07T12:00:00Z",
        kind: "official",
      },
      {
        name: "Demo Sec Weekly",
        url: "https://example.com/sec-weekly/calendar-injection",
        published: "2026-11-08T09:00:00Z",
        kind: "analysis",
      },
    ],
    firstSeen: "2026-11-07T12:30:00Z",
  },
  {
    id: "EV-106",
    interestId: "dev",
    title: "Major JS framework minor release changes default caching behaviour",
    summary: "A fictional release note announces opt-in caching by default and new prefetch heuristics.",
    whyItMatters: "Affects how dashboard read models are cached.",
    personalRelevance: "Moderate — relevant once Stage 1 begins.",
    possibleAction: "Skim migration guide before scaffolding Stage 1.",
    factors: { interest: 76, impact: 66, usefulness: 70, evidence: 90, freshness: 60 },
    sources: [
      {
        name: "Demo Framework Blog",
        url: "https://example.com/framework/blog/minor-release",
        published: "2026-11-06T15:00:00Z",
        kind: "official",
      },
    ],
    firstSeen: "2026-11-06T15:20:00Z",
  },
  {
    id: "EV-107",
    interestId: "fit",
    title: "Meta-analysis on protein timing finds small effect sizes",
    summary: "A fictional review of sample trials reports total daily intake matters more than timing for most adults.",
    whyItMatters: "Simplifies nutrition tracking — fewer fields needed for timing.",
    personalRelevance: "Low–moderate; informs Health module scope.",
    possibleAction: "None required.",
    factors: { interest: 70, impact: 52, usefulness: 60, evidence: 80, freshness: 55 },
    sources: [
      {
        name: "Example Journal Digest",
        url: "https://example.org/journal-digest/protein-timing",
        published: "2026-11-05T10:00:00Z",
        kind: "analysis",
      },
    ],
    firstSeen: "2026-11-05T10:30:00Z",
  },
  {
    id: "EV-108",
    interestId: "games",
    title: "Indie showcase announces November release window for several titles",
    summary: "A fictional showcase lists a dozen upcoming releases; two match genres in your library.",
    whyItMatters: "Could add to wishlist — low urgency.",
    personalRelevance: "Matches your 'exploration' and 'roguelike' tags.",
    possibleAction: "Review list during weekly recap.",
    factors: { interest: 72, impact: 40, usefulness: 55, evidence: 76, freshness: 62 },
    sources: [
      {
        name: "Demo Games Feed",
        url: "https://example.com/games-feed/showcase-nov",
        published: "2026-11-04T18:00:00Z",
        kind: "feed",
      },
      {
        name: "Sample Press Room",
        url: "https://example.org/press/showcase",
        published: "2026-11-04T17:00:00Z",
        kind: "official",
      },
    ],
    firstSeen: "2026-11-04T18:10:00Z",
  },
];
