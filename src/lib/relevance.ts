/**
 * Relevance scoring — per docs/modules/interests.md.
 * Weights: interest match 30, impact 25, personal usefulness 20,
 * evidence quality 15, freshness/novelty 10. Normalised; score 0–100.
 * Tiers: ≥85 high, ≥70 medium, below 70 feed-only.
 * Scores are explanations of a heuristic, never objective truth.
 */

export const RELEVANCE_WEIGHTS = {
  interest: 30,
  impact: 25,
  usefulness: 20,
  evidence: 15,
  freshness: 10,
} as const;

export type RelevanceFactor = keyof typeof RELEVANCE_WEIGHTS;
export type FactorScores = Record<RelevanceFactor, number>;
export type RelevanceTier = "high" | "medium" | "feed";

export const FACTOR_LABELS: Record<RelevanceFactor, string> = {
  interest: "Interest match",
  impact: "Impact",
  usefulness: "Personal usefulness",
  evidence: "Evidence quality",
  freshness: "Freshness / novelty",
};

const clamp = (n: number) => Math.min(100, Math.max(0, n));

/** Weighted mean of 0–100 factor scores, normalised by the weight total. */
export function computeRelevance(
  factors: FactorScores,
  weights: Record<RelevanceFactor, number> = RELEVANCE_WEIGHTS,
): number {
  const keys = Object.keys(weights) as RelevanceFactor[];
  const total = keys.reduce((s, k) => s + Math.max(0, weights[k]), 0);
  if (total === 0) return 0;
  const sum = keys.reduce((s, k) => s + clamp(factors[k] ?? 0) * Math.max(0, weights[k]), 0);
  return Math.round(sum / total);
}

export function relevanceTier(score: number): RelevanceTier {
  if (score >= 85) return "high";
  if (score >= 70) return "medium";
  return "feed";
}

/** Points each factor contributes to the final score (sums to ≈ score). */
export function factorContributions(
  factors: FactorScores,
  weights: Record<RelevanceFactor, number> = RELEVANCE_WEIGHTS,
): Array<{ factor: RelevanceFactor; value: number; weight: number; points: number }> {
  const keys = Object.keys(weights) as RelevanceFactor[];
  const total = keys.reduce((s, k) => s + Math.max(0, weights[k]), 0) || 1;
  return keys.map((k) => ({
    factor: k,
    value: clamp(factors[k] ?? 0),
    weight: weights[k],
    points: (clamp(factors[k] ?? 0) * weights[k]) / total,
  }));
}
