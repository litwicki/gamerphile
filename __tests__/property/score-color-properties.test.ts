/**
 * Property 2: Score Color Monotonicity
 *
 * For any sorted tier list and score, `resolveScoreColor` returns the color
 * of the highest tier not exceeding the score.
 *
 * **Validates: Requirements 6.1, 6.3**
 */
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { resolveScoreColor } from "@/lib/raiderio/score-colors";
import type { ScoreTier } from "@/lib/raiderio/types";

// ── Arbitraries ──

/** Generate a single ScoreTier with a non-negative score and a hex color string. */
const arbScoreTier: fc.Arbitrary<ScoreTier> = fc.record({
  score: fc.integer({ min: 0, max: 10000 }),
  rgbHex: fc
    .array(fc.constantFrom(..."0123456789abcdef"), { minLength: 6, maxLength: 6 })
    .map((chars) => `#${chars.join("")}`),
});

/**
 * Generate a non-empty list of ScoreTiers with unique scores, sorted ascending by score.
 * Unique scores ensure a deterministic "highest tier not exceeding the score" lookup.
 */
const arbSortedTiers: fc.Arbitrary<ScoreTier[]> = fc
  .uniqueArray(arbScoreTier, {
    minLength: 1,
    maxLength: 20,
    comparator: (a, b) => a.score === b.score,
  })
  .map((tiers) => [...tiers].sort((a, b) => a.score - b.score));

/** Generate a positive score (score 0 is a special case that always returns ""). */
const arbPositiveScore = fc.integer({ min: 1, max: 15000 });

// ── Property Tests ──

describe("Property 2: Score color monotonicity", () => {
  it("returns the color of the highest tier not exceeding the score", () => {
    fc.assert(
      fc.property(arbSortedTiers, arbPositiveScore, (tiers, score) => {
        const result = resolveScoreColor(score, tiers);

        // Find the expected tier: highest tier whose score <= given score
        const matchingTiers = tiers.filter((t) => t.score <= score);

        if (matchingTiers.length === 0) {
          // No tier at or below the score — should return ""
          expect(result).toBe("");
        } else {
          const expectedTier = matchingTiers[matchingTiers.length - 1];
          expect(result).toBe(expectedTier.rgbHex);
        }
      }),
      { numRuns: 200 }
    );
  });

  it("returns empty string when score is 0 regardless of tiers", () => {
    fc.assert(
      fc.property(arbSortedTiers, (tiers) => {
        expect(resolveScoreColor(0, tiers)).toBe("");
      }),
      { numRuns: 100 }
    );
  });

  it("returns empty string when tier list is empty regardless of score", () => {
    fc.assert(
      fc.property(arbPositiveScore, (score) => {
        expect(resolveScoreColor(score, [])).toBe("");
      }),
      { numRuns: 100 }
    );
  });
});
