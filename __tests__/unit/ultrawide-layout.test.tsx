import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { BentoGrid } from "@/app/[region]/[realm]/[characterName]/bento-grid";

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
  // Stub fetch so WCLWidget doesn't make real requests
  globalThis.fetch = vi.fn(async () => ({
    ok: true,
    json: async () => ({ zoneRankings: null, encounterRankings: null }),
  })) as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

// ─── 12.2 Unit tests for ultrawide layout ───
// Validates: Requirements 12.1, 12.4

describe("Ultrawide layout support", () => {
  describe("BentoGrid container uses CSS variable for max-width (Req 12.1, 12.4)", () => {
    it("has the max-w-[var(--max-viewport)] class on the grid container", () => {
      const { container } = render(
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

      // The outermost div of BentoGrid should have the CSS variable class
      const gridContainer = container.firstElementChild as HTMLElement;
      expect(gridContainer.className).toContain("max-w-[var(--max-viewport)]");
    });
  });

  describe("Character page content container uses CSS variable for max-width (Req 12.4)", () => {
    it("the max-w class references --max-viewport CSS variable, not a fixed value", () => {
      // Render BentoGrid and verify it does NOT use a hardcoded max-w-7xl or max-w-screen-xl
      const { container } = render(
        <BentoGrid
          raidSummary={undefined}
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

      const gridContainer = container.firstElementChild as HTMLElement;
      const classes = gridContainer.className;

      // Should use the CSS variable approach, not a hardcoded width
      expect(classes).toContain("max-w-[var(--max-viewport)]");
      expect(classes).not.toContain("max-w-7xl");
      expect(classes).not.toContain("max-w-screen-xl");
    });
  });
});
