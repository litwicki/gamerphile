import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  RaidProgressWidget,
  type RaidProgressWidgetProps,
} from "@/app/[region]/[realm]/[characterName]/bento-grid";
import type { RaidProgressionDetail } from "@/lib/raiderio/types";

beforeAll(() => {
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
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
};

describe("RaidProgressWidget", () => {
  describe("summary display", () => {
    it("renders the raid summary", () => {
      render(<RaidProgressWidget {...fullProps} />);
      expect(screen.getByText("7/8 H")).toBeInTheDocument();
    });

    it("renders dash when summary is undefined", () => {
      render(<RaidProgressWidget raidSummary={undefined} raidProgression={undefined} />);
      expect(screen.getByText("—")).toBeInTheDocument();
    });
  });

  describe("difficulty buttons", () => {
    it("disables the mythic button when mythic has 0 kills", () => {
      render(<RaidProgressWidget {...fullProps} />);
      const mythicBtn = screen.getByRole("button", { name: "M" });
      expect(mythicBtn).toBeDisabled();
    });

    it("does not disable buttons with kills", () => {
      render(<RaidProgressWidget {...fullProps} />);
      const normalBtn = screen.getByRole("button", { name: "N" });
      const heroicBtn = screen.getByRole("button", { name: "H" });
      expect(normalBtn).not.toBeDisabled();
      expect(heroicBtn).not.toBeDisabled();
    });

    it("defaults to highest difficulty with kills", () => {
      render(<RaidProgressWidget {...fullProps} />);
      // Heroic is highest with kills — should show heroic progress bar
      expect(screen.getByText("heroic")).toBeInTheDocument();
      expect(screen.getByText("7/8")).toBeInTheDocument();
    });

    it("switches difficulty when a button is clicked", async () => {
      const user = userEvent.setup();
      render(<RaidProgressWidget {...fullProps} />);

      const normalBtn = screen.getByRole("button", { name: "N" });
      await user.click(normalBtn);

      await waitFor(() => {
        expect(screen.getByText("normal")).toBeInTheDocument();
        expect(screen.getByText("8/8")).toBeInTheDocument();
      });
    });
  });

  describe("boss kill list (Req 7.8)", () => {
    it("renders boss names with kill indicators for the active difficulty", () => {
      render(<RaidProgressWidget {...fullProps} />);
      // Default is heroic
      expect(screen.getByText("Sikran")).toBeInTheDocument();
      expect(screen.getByText("Rashanan")).toBeInTheDocument();
      expect(screen.getByLabelText("Killed")).toBeInTheDocument();
      expect(screen.getByLabelText("Not killed")).toBeInTheDocument();
    });
  });
});
