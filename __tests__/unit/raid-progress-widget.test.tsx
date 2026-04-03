import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  RaidProgressWidget,
  type RaidProgressWidgetProps,
} from "@/app/[region]/[realm]/[characterName]/bento-grid";
import type { RaidProgressionDetail } from "@/lib/raiderio/types";

// ─── Radix stubs (same pattern as avatar-menu tests) ───

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

const raidDetail: RaidProgressionDetail = {
  summary: "7/8 H",
  total_bosses: 8,
  normal_bosses_killed: 8,
  heroic_bosses_killed: 7,
  mythic_bosses_killed: 0,
  bosses: {
    normal: [
      { slug: "boss-1", name: "Sikran", defeatedAt: "2024-09-15T12:00:00Z" },
      { slug: "boss-2", name: "Rashanan", defeatedAt: "2024-09-15T13:00:00Z" },
    ],
    heroic: [
      { slug: "boss-1", name: "Sikran", defeatedAt: "2024-09-16T12:00:00Z" },
      { slug: "boss-2", name: "Rashanan" },
    ],
    mythic: [],
  },
};

const fullProps: RaidProgressWidgetProps = {
  raidSummary: "7/8 H",
  raidProgression: { "nerub-ar-palace": raidDetail },
  regionRank: 42,
  worldRank: 1337,
};

// ─── 6.2 Unit tests for RaidProgressWidget ───
// Validates: Requirements 7.2, 7.3, 7.7, 7.8

describe("RaidProgressWidget", () => {
  describe("rank display (Req 7.2, 7.3)", () => {
    it("renders region and world rank when data is provided", () => {
      render(<RaidProgressWidget {...fullProps} />);

      expect(screen.getByText("#42")).toBeInTheDocument();
      expect(screen.getByText("#1337")).toBeInTheDocument();
    });

    it("renders dash fallback when ranks are undefined", () => {
      render(
        <RaidProgressWidget
          raidSummary={undefined}
          raidProgression={undefined}
          regionRank={undefined}
          worldRank={undefined}
        />
      );

      // Summary should show dash
      const dashes = screen.getAllByText("—");
      // raidSummary dash + regionRank dash + worldRank dash = 3
      expect(dashes.length).toBe(3);
    });

    it("renders dash for region rank only when regionRank is undefined", () => {
      render(
        <RaidProgressWidget
          raidSummary="7/8 H"
          raidProgression={fullProps.raidProgression}
          regionRank={undefined}
          worldRank={500}
        />
      );

      expect(screen.getByText("#500")).toBeInTheDocument();
      // Region rank should be a dash
      const regionLabel = screen.getByText("Region:").parentElement;
      expect(regionLabel).toHaveTextContent("—");
    });
  });

  describe("tab disabled state for zero-progress difficulties (Req 7.7)", () => {
    it("disables the mythic tab when mythic has 0 kills", async () => {
      const user = userEvent.setup();
      render(<RaidProgressWidget {...fullProps} />);

      // Click "See More" to expand
      const seeMore = screen.getByText("See More");
      await user.click(seeMore);

      await waitFor(() => {
        const mythicTab = screen.getByRole("tab", { name: /mythic/i });
        expect(mythicTab).toBeDisabled();
      });
    });

    it("does not disable tabs with kills", async () => {
      const user = userEvent.setup();
      render(<RaidProgressWidget {...fullProps} />);

      await user.click(screen.getByText("See More"));

      await waitFor(() => {
        const normalTab = screen.getByRole("tab", { name: /normal/i });
        const heroicTab = screen.getByRole("tab", { name: /heroic/i });
        expect(normalTab).not.toBeDisabled();
        expect(heroicTab).not.toBeDisabled();
      });
    });
  });

  describe("boss kill table rendering (Req 7.8)", () => {
    it("renders boss names with kill indicators for the active difficulty", async () => {
      const user = userEvent.setup();
      render(<RaidProgressWidget {...fullProps} />);

      await user.click(screen.getByText("See More"));

      // Default tab should be heroic (highest with kills)
      await waitFor(() => {
        expect(screen.getByText("Sikran")).toBeInTheDocument();
        expect(screen.getByText("Rashanan")).toBeInTheDocument();
      });

      // Sikran was killed on heroic — should have ✓
      const killedIndicator = screen.getByLabelText("Killed");
      expect(killedIndicator).toBeInTheDocument();

      // Rashanan was NOT killed on heroic — should have ✗
      const notKilledIndicator = screen.getByLabelText("Not killed");
      expect(notKilledIndicator).toBeInTheDocument();
    });

    it("shows 'No kills' for a difficulty with empty boss list", async () => {
      const user = userEvent.setup();

      // Create data where all difficulties have kills except mythic
      const propsWithMythicEnabled: RaidProgressWidgetProps = {
        ...fullProps,
        raidProgression: {
          "nerub-ar-palace": {
            ...raidDetail,
            // Override to give mythic 1 kill so the tab is enabled
            mythic_bosses_killed: 1,
            bosses: {
              ...raidDetail.bosses,
              mythic: [], // but empty boss list
            },
          },
        },
      };

      render(<RaidProgressWidget {...propsWithMythicEnabled} />);

      await user.click(screen.getByText("See More"));

      // Click the mythic tab
      await waitFor(() => {
        const mythicTab = screen.getByRole("tab", { name: /mythic/i });
        expect(mythicTab).not.toBeDisabled();
      });

      const mythicTab = screen.getByRole("tab", { name: /mythic/i });
      await user.click(mythicTab);

      await waitFor(() => {
        expect(screen.getByText("No kills")).toBeInTheDocument();
      });
    });

    it("does not show boss table when See More has not been clicked", () => {
      render(<RaidProgressWidget {...fullProps} />);

      // Boss names should not be visible
      expect(screen.queryByText("Sikran")).not.toBeInTheDocument();
      expect(screen.queryByText("Rashanan")).not.toBeInTheDocument();
    });
  });

  describe("See More / See Less toggle", () => {
    it("toggles between See More and See Less", async () => {
      const user = userEvent.setup();
      render(<RaidProgressWidget {...fullProps} />);

      const toggle = screen.getByText("See More");
      await user.click(toggle);

      expect(screen.getByText("See Less")).toBeInTheDocument();

      await user.click(screen.getByText("See Less"));

      expect(screen.getByText("See More")).toBeInTheDocument();
    });
  });
});
