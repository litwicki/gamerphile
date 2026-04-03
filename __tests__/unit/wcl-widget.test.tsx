import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BentoGrid } from "@/app/[region]/[realm]/[characterName]/bento-grid";
import type { WCLCharacterResponse } from "@/lib/wcl/types";

// ─── Radix stubs (same pattern as other widget tests) ───

beforeAll(() => {
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);

  if (typeof globalThis.ResizeObserver === "undefined") {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;
  }

  if (typeof globalThis.DOMRect === "undefined") {
    (globalThis as any).DOMRect = class {
      x = 0; y = 0; width = 0; height = 0;
      top = 0; right = 0; bottom = 0; left = 0;
      toJSON() { return {}; }
      static fromRect() { return new (globalThis as any).DOMRect(); }
    };
  }
});

const originalFetch = globalThis.fetch;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

// ─── Helpers ───

/** Minimal BentoGrid props — only WCL-related fields matter for these tests */
function renderWCLWidget(fetchMock: typeof globalThis.fetch) {
  globalThis.fetch = fetchMock;

  return render(
    <BentoGrid
      raidSummary="7/8 H"
      raidProgression={undefined}
      regionRank={undefined}
      worldRank={undefined}
      mplusScore={0}
      highestRun={undefined}
      scoreColor=""
      ranks={undefined}
      specScores={undefined}
      scoreTiers={[]}
      hasTwitchIntegration={false}
      characterName="Testchar"
      serverSlug="illidan"
      serverRegion="us"
    />
  );
}

function mockFetchSuccess(data: WCLCharacterResponse): typeof globalThis.fetch {
  return vi.fn(async () => ({
    ok: true,
    json: async () => data,
  })) as unknown as typeof fetch;
}

function mockFetchError(): typeof globalThis.fetch {
  return vi.fn(async () => {
    throw new Error("Network failure");
  }) as unknown as typeof fetch;
}

function mockFetchNon200(): typeof globalThis.fetch {
  return vi.fn(async () => ({
    ok: false,
    status: 502,
  })) as unknown as typeof fetch;
}

// ─── 8.2 Unit tests for WCLWidget ───
// Validates: Requirements 10.3, 10.5, 10.6

describe("WarcraftLogsWidget", () => {
  describe("parse color mapping for each percentile range (Req 10.3)", () => {
    it("applies grey (#666666) for percentiles 0–24", async () => {
      renderWCLWidget(mockFetchSuccess({
        zoneRankings: { zoneName: "Test", zoneID: 1, bestPercentile: 15, medianPercentile: 5, difficulty: 4 },
        encounterRankings: [],
      }));

      await waitFor(() => {
        const best = screen.getByTestId("wcl-best");
        expect(best).toHaveStyle({ color: "#666666" });
      });
    });

    it("applies green (#1eff00) for percentiles 25–49", async () => {
      renderWCLWidget(mockFetchSuccess({
        zoneRankings: { zoneName: "Test", zoneID: 1, bestPercentile: 35, medianPercentile: 25, difficulty: 4 },
        encounterRankings: [],
      }));

      await waitFor(() => {
        const best = screen.getByTestId("wcl-best");
        expect(best).toHaveStyle({ color: "#1eff00" });
        const median = screen.getByTestId("wcl-median");
        expect(median).toHaveStyle({ color: "#1eff00" });
      });
    });

    it("applies blue (#0070ff) for percentiles 50–74", async () => {
      renderWCLWidget(mockFetchSuccess({
        zoneRankings: { zoneName: "Test", zoneID: 1, bestPercentile: 60, medianPercentile: 50, difficulty: 4 },
        encounterRankings: [],
      }));

      await waitFor(() => {
        const best = screen.getByTestId("wcl-best");
        expect(best).toHaveStyle({ color: "#0070ff" });
      });
    });

    it("applies purple (#a335ee) for percentiles 75–94", async () => {
      renderWCLWidget(mockFetchSuccess({
        zoneRankings: { zoneName: "Test", zoneID: 1, bestPercentile: 85, medianPercentile: 75, difficulty: 4 },
        encounterRankings: [],
      }));

      await waitFor(() => {
        const best = screen.getByTestId("wcl-best");
        expect(best).toHaveStyle({ color: "#a335ee" });
      });
    });

    it("applies orange (#ff8000) for percentiles 95–98", async () => {
      renderWCLWidget(mockFetchSuccess({
        zoneRankings: { zoneName: "Test", zoneID: 1, bestPercentile: 96, medianPercentile: 95, difficulty: 4 },
        encounterRankings: [],
      }));

      await waitFor(() => {
        const best = screen.getByTestId("wcl-best");
        expect(best).toHaveStyle({ color: "#ff8000" });
      });
    });

    it("applies pink (#e268a8) for percentile 99", async () => {
      renderWCLWidget(mockFetchSuccess({
        zoneRankings: { zoneName: "Test", zoneID: 1, bestPercentile: 99, medianPercentile: 50, difficulty: 4 },
        encounterRankings: [],
      }));

      await waitFor(() => {
        const best = screen.getByTestId("wcl-best");
        expect(best).toHaveStyle({ color: "#e268a8" });
      });
    });

    it("applies gold (#e5cc80) for percentile 100", async () => {
      renderWCLWidget(mockFetchSuccess({
        zoneRankings: { zoneName: "Test", zoneID: 1, bestPercentile: 100, medianPercentile: 100, difficulty: 4 },
        encounterRankings: [],
      }));

      await waitFor(() => {
        const best = screen.getByTestId("wcl-best");
        expect(best).toHaveStyle({ color: "#e5cc80" });
        const median = screen.getByTestId("wcl-median");
        expect(median).toHaveStyle({ color: "#e5cc80" });
      });
    });

    it("applies correct colors to per-encounter percentiles", async () => {
      renderWCLWidget(mockFetchSuccess({
        zoneRankings: { zoneName: "Test", zoneID: 1, bestPercentile: 90, medianPercentile: 80, difficulty: 4 },
        encounterRankings: [
          { encounterName: "Boss A", encounterID: 1, percentile: 99, spec: "Frost", difficulty: 4, reportCode: "abc" },
          { encounterName: "Boss B", encounterID: 2, percentile: 30, spec: "Frost", difficulty: 4, reportCode: "def" },
        ],
      }));

      await waitFor(() => {
        expect(screen.getByText("Boss A")).toBeInTheDocument();
        expect(screen.getByText("Boss B")).toBeInTheDocument();
      });

      // Boss A at 99 → pink, Boss B at 30 → green
      const bossAValue = screen.getByText("99");
      expect(bossAValue).toHaveStyle({ color: "#e268a8" });

      const bossBValue = screen.getByText("30");
      expect(bossBValue).toHaveStyle({ color: "#1eff00" });
    });
  });

  describe("fallback: no data (Req 10.5)", () => {
    it("shows 'No Warcraft Logs data available' when zoneRankings and encounterRankings are null", async () => {
      renderWCLWidget(mockFetchSuccess({
        zoneRankings: null,
        encounterRankings: null,
      }));

      await waitFor(() => {
        expect(screen.getByText("No Warcraft Logs data available")).toBeInTheDocument();
      });
    });

    it("shows 'No Warcraft Logs data available' when encounterRankings is empty and zoneRankings is null", async () => {
      renderWCLWidget(mockFetchSuccess({
        zoneRankings: null,
        encounterRankings: [],
      }));

      await waitFor(() => {
        expect(screen.getByText("No Warcraft Logs data available")).toBeInTheDocument();
      });
    });
  });

  describe("fallback: error (Req 10.6)", () => {
    it("shows 'Coming Soon' when fetch throws a network error", async () => {
      renderWCLWidget(mockFetchError());

      await waitFor(() => {
        expect(screen.getByText("Coming Soon")).toBeInTheDocument();
      });
    });

    it("shows 'Coming Soon' when fetch returns non-200 status", async () => {
      renderWCLWidget(mockFetchNon200());

      await waitFor(() => {
        expect(screen.getByText("Coming Soon")).toBeInTheDocument();
      });
    });
  });
});
