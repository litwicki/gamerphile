import type { ScoreTier } from "./types";

const BASE_URL = "https://raider.io";

/**
 * Fetch M+ score color tiers from RaiderIO.
 * Returns an empty array on failure.
 */
export async function getScoreTiers(): Promise<ScoreTier[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/mythic-plus/score-tiers`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return [];
    }
    return (await res.json()) as ScoreTier[];
  } catch {
    return [];
  }
}

/**
 * Resolve the color for an M+ score given a list of score tiers.
 * Finds the highest tier whose score threshold is <= the given score.
 * Returns empty string for score 0 or empty tiers.
 */
export function resolveScoreColor(score: number, tiers: ScoreTier[]): string {
  if (score === 0 || tiers.length === 0) {
    return "";
  }

  let result = "";
  let bestScore = -Infinity;

  for (const tier of tiers) {
    if (tier.score <= score && tier.score > bestScore) {
      bestScore = tier.score;
      result = tier.rgbHex;
    }
  }

  return result;
}

/**
 * Resolve the WCL parse percentile color using the standard WCL color scheme.
 */
export function resolveParseColor(percentile: number): string {
  if (percentile >= 100) return "#e5cc80";
  if (percentile >= 99) return "#e268a8";
  if (percentile >= 95) return "#ff8000";
  if (percentile >= 75) return "#a335ee";
  if (percentile >= 50) return "#0070ff";
  if (percentile >= 25) return "#1eff00";
  return "#666666";
}
