import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  resolveScoreColor,
  resolveParseColor,
  getScoreTiers,
} from "../../lib/raiderio/score-colors";
import type { ScoreTier } from "../../lib/raiderio/types";

// ─── Sample tiers (sorted descending by score, as RaiderIO returns them) ───

const sampleTiers: ScoreTier[] = [
  { score: 3800, rgbHex: "#ff8000" },
  { score: 3400, rgbHex: "#a335ee" },
  { score: 3000, rgbHex: "#0070ff" },
  { score: 2500, rgbHex: "#1eff00" },
  { score: 0, rgbHex: "#666666" },
];

describe("resolveScoreColor", () => {
  it("returns empty string for score 0", () => {
    expect(resolveScoreColor(0, sampleTiers)).toBe("");
  });

  it("returns empty string for empty tiers", () => {
    expect(resolveScoreColor(3000, [])).toBe("");
  });

  it("returns the highest tier color not exceeding the score", () => {
    expect(resolveScoreColor(3500, sampleTiers)).toBe("#a335ee");
  });

  it("returns exact match tier color", () => {
    expect(resolveScoreColor(3000, sampleTiers)).toBe("#0070ff");
  });

  it("returns lowest tier color for a low positive score", () => {
    expect(resolveScoreColor(100, sampleTiers)).toBe("#666666");
  });

  it("returns highest tier color when score exceeds all tiers", () => {
    expect(resolveScoreColor(5000, sampleTiers)).toBe("#ff8000");
  });
});

describe("resolveParseColor", () => {
  it("returns gold for 100 percentile", () => {
    expect(resolveParseColor(100)).toBe("#e5cc80");
  });

  it("returns pink for 99 percentile", () => {
    expect(resolveParseColor(99)).toBe("#e268a8");
  });

  it("returns orange for 95-98 percentile", () => {
    expect(resolveParseColor(95)).toBe("#ff8000");
    expect(resolveParseColor(98)).toBe("#ff8000");
  });

  it("returns purple for 75-94 percentile", () => {
    expect(resolveParseColor(75)).toBe("#a335ee");
    expect(resolveParseColor(94)).toBe("#a335ee");
  });

  it("returns blue for 50-74 percentile", () => {
    expect(resolveParseColor(50)).toBe("#0070ff");
    expect(resolveParseColor(74)).toBe("#0070ff");
  });

  it("returns green for 25-49 percentile", () => {
    expect(resolveParseColor(25)).toBe("#1eff00");
    expect(resolveParseColor(49)).toBe("#1eff00");
  });

  it("returns grey for 0-24 percentile", () => {
    expect(resolveParseColor(0)).toBe("#666666");
    expect(resolveParseColor(24)).toBe("#666666");
  });
});

// ─── getScoreTiers (Req 5.3, 5.4) ───

const originalFetch = globalThis.fetch;

describe("getScoreTiers", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => { globalThis.fetch = originalFetch; });

  it("returns a ScoreTier array on successful fetch", async () => {
    const tiers: ScoreTier[] = [
      { score: 3800, rgbHex: "#ff8000" },
      { score: 3000, rgbHex: "#0070ff" },
      { score: 0, rgbHex: "#666666" },
    ];

    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => tiers,
    })) as unknown as typeof fetch;

    const result = await getScoreTiers();
    expect(result).toEqual(tiers);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("returns an empty array when fetch responds with non-ok status", async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: false,
      status: 500,
    })) as unknown as typeof fetch;

    const result = await getScoreTiers();
    expect(result).toEqual([]);
  });

  it("returns an empty array when fetch throws a network error", async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error("Network failure");
    }) as unknown as typeof fetch;

    const result = await getScoreTiers();
    expect(result).toEqual([]);
  });
});
