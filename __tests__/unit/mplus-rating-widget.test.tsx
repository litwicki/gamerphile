import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  MPlusRatingWidget,
  type MPlusRatingWidgetProps,
} from "@/app/[region]/[realm]/[characterName]/bento-grid";
import type { MythicPlusRanks, MythicPlusSpecScore, ScoreTier } from "@/lib/raiderio/types";

// ─── Radix stubs ───

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

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Test data ───

const scoreTiers: ScoreTier[] = [
  { score: 0, rgbHex: "#ffffff" },
  { score: 500, rgbHex: "#00ff00" },
  { score: 1000, rgbHex: "#0070ff" },
  { score: 1500, rgbHex: "#a335ee" },
  { score: 2000, rgbHex: "#ff8000" },
  { score: 2500, rgbHex: "#e268a8" },
];

const ranks: MythicPlusRanks = {
  overall: { world: 500, region: 100, realm: 10 },
  specs: {
    Frost: { world: 300, region: 80, realm: 5 },
    Fire: { world: 0, region: 0, realm: 0 },
  },
};

const specScores: MythicPlusSpecScore[] = [
  { spec: "Frost", score: 1800, ranks: { world: 300, region: 80, realm: 5 } },
  { spec: "Fire", score: 0, ranks: { world: 0, region: 0, realm: 0 } },
];

const fullProps: MPlusRatingWidgetProps = {
  mplusScore: 2100,
  highestRun: { dungeon: "Mists of Tirna Scithe", level: 20 },
  scoreColor: "#ff8000",
  ranks,
  specScores,
  scoreTiers,
};

// ─── 7.2 Unit tests for MPlusRatingWidget ───
// Validates: Requirements 8.1, 8.4, 8.7

describe("MPlusRatingWidget", () => {
  describe("color application on score and ranks (Req 8.1)", () => {
    it("applies the scoreColor to the overall M+ score", () => {
      render(<MPlusRatingWidget {...fullProps} />);

      const scoreEl = screen.getByTestId("mplus-score");
      expect(scoreEl).toHaveStyle({ color: "#ff8000" });
    });

    it("applies the scoreColor to realm, region, and world rank values", () => {
      render(<MPlusRatingWidget {...fullProps} />);

      expect(screen.getByTestId("realm-rank")).toHaveStyle({ color: "#ff8000" });
      expect(screen.getByTestId("region-rank")).toHaveStyle({ color: "#ff8000" });
      expect(screen.getByTestId("world-rank")).toHaveStyle({ color: "#ff8000" });
    });

    it("renders dash and no color when score is 0 and no ranks", () => {
      render(
        <MPlusRatingWidget
          mplusScore={0}
          highestRun={undefined}
          scoreColor=""
          ranks={undefined}
          specScores={undefined}
          scoreTiers={scoreTiers}
        />
      );

      const scoreEl = screen.getByTestId("mplus-score");
      expect(scoreEl).toHaveTextContent("—");
      expect(screen.getByTestId("realm-rank")).toHaveTextContent("—");
      expect(screen.getByTestId("region-rank")).toHaveTextContent("—");
      expect(screen.getByTestId("world-rank")).toHaveTextContent("—");
    });
  });

  describe("spec tab switching updates displayed values (Req 8.4)", () => {
    it("shows overall data by default", () => {
      render(<MPlusRatingWidget {...fullProps} />);

      expect(screen.getByTestId("mplus-score")).toHaveTextContent("2100");
      expect(screen.getByTestId("realm-rank")).toHaveTextContent("#10");
      expect(screen.getByTestId("region-rank")).toHaveTextContent("#100");
      expect(screen.getByTestId("world-rank")).toHaveTextContent("#500");
    });

    it("updates score and ranks when a spec tab is clicked", async () => {
      const user = userEvent.setup();
      render(<MPlusRatingWidget {...fullProps} />);

      const frostTab = screen.getByRole("tab", { name: /frost/i });
      await user.click(frostTab);

      await waitFor(() => {
        expect(screen.getByTestId("mplus-score")).toHaveTextContent("1800");
        expect(screen.getByTestId("realm-rank")).toHaveTextContent("#5");
        expect(screen.getByTestId("region-rank")).toHaveTextContent("#80");
        expect(screen.getByTestId("world-rank")).toHaveTextContent("#300");
      });
    });

    it("resolves spec-specific color from scoreTiers when switching specs", async () => {
      const user = userEvent.setup();
      render(<MPlusRatingWidget {...fullProps} />);

      const frostTab = screen.getByRole("tab", { name: /frost/i });
      await user.click(frostTab);

      await waitFor(() => {
        // Frost score is 1800, which falls in the 1500 tier (#a335ee)
        const scoreEl = screen.getByTestId("mplus-score");
        expect(scoreEl).toHaveStyle({ color: "#a335ee" });
      });
    });

    it("reverts to overall data when 'All' tab is clicked", async () => {
      const user = userEvent.setup();
      render(<MPlusRatingWidget {...fullProps} />);

      // Switch to Frost
      await user.click(screen.getByRole("tab", { name: /frost/i }));
      await waitFor(() => {
        expect(screen.getByTestId("mplus-score")).toHaveTextContent("1800");
      });

      // Switch back to All
      await user.click(screen.getByRole("tab", { name: /all/i }));
      await waitFor(() => {
        expect(screen.getByTestId("mplus-score")).toHaveTextContent("2100");
        expect(screen.getByTestId("mplus-score")).toHaveStyle({ color: "#ff8000" });
      });
    });
  });

  describe("disabled state for specs with no data (Req 8.7)", () => {
    it("disables spec tabs with score of 0", () => {
      render(<MPlusRatingWidget {...fullProps} />);

      const fireTab = screen.getByRole("tab", { name: /fire/i });
      expect(fireTab).toBeDisabled();
    });

    it("does not disable spec tabs with a positive score", () => {
      render(<MPlusRatingWidget {...fullProps} />);

      const frostTab = screen.getByRole("tab", { name: /frost/i });
      expect(frostTab).not.toBeDisabled();
    });

    it("renders dash for all ranks when ranks prop is undefined", () => {
      render(
        <MPlusRatingWidget
          mplusScore={1500}
          highestRun={undefined}
          scoreColor="#a335ee"
          ranks={undefined}
          specScores={undefined}
          scoreTiers={scoreTiers}
        />
      );

      expect(screen.getByTestId("realm-rank")).toHaveTextContent("—");
      expect(screen.getByTestId("region-rank")).toHaveTextContent("—");
      expect(screen.getByTestId("world-rank")).toHaveTextContent("—");
    });
  });
});
