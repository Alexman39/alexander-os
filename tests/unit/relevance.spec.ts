import { expect, test } from "@playwright/test";
import { RELEVANCE_WEIGHTS, computeRelevance, factorContributions, relevanceTier } from "../../src/lib/relevance";

const all = (n: number) => ({ interest: n, impact: n, usefulness: n, evidence: n, freshness: n });

test.describe("relevance scoring", () => {
  test("weights match the interests spec and total 100", () => {
    expect(RELEVANCE_WEIGHTS).toEqual({ interest: 30, impact: 25, usefulness: 20, evidence: 15, freshness: 10 });
    expect(Object.values(RELEVANCE_WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100);
  });

  test("uniform factors produce that score", () => {
    expect(computeRelevance(all(0))).toBe(0);
    expect(computeRelevance(all(73))).toBe(73);
    expect(computeRelevance(all(100))).toBe(100);
  });

  test("weights are applied and normalised", () => {
    // interest only at 100 → 30% of the total weight
    expect(computeRelevance({ ...all(0), interest: 100 })).toBe(30);
    // custom weights that do not sum to 100 are still normalised to 0–100
    expect(computeRelevance(all(80), { interest: 1, impact: 1, usefulness: 1, evidence: 1, freshness: 1 })).toBe(80);
  });

  test("out-of-range factors are clamped", () => {
    expect(computeRelevance(all(150))).toBe(100);
    expect(computeRelevance(all(-20))).toBe(0);
  });

  test("zero total weight yields 0 instead of NaN", () => {
    expect(computeRelevance(all(90), { interest: 0, impact: 0, usefulness: 0, evidence: 0, freshness: 0 })).toBe(0);
  });

  test("tiers follow the 85 / 70 thresholds", () => {
    expect(relevanceTier(85)).toBe("high");
    expect(relevanceTier(84)).toBe("medium");
    expect(relevanceTier(70)).toBe("medium");
    expect(relevanceTier(69)).toBe("feed");
  });

  test("factor contributions sum to the score", () => {
    const f = { interest: 98, impact: 86, usefulness: 92, evidence: 70, freshness: 95 };
    const sum = factorContributions(f).reduce((s, c) => s + c.points, 0);
    expect(Math.round(sum)).toBe(computeRelevance(f));
  });
});
