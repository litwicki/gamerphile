import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Mock next/navigation ───
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: pushMock,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
}));

import {
  MPlusHistoryTable,
} from "@/app/[region]/[realm]/[characterName]/mplus-history-table";
import {
  RunDetailModal,
  type RunDetailModalProps,
} from "@/app/[region]/[realm]/[characterName]/run-detail-modal";
import type {
  MythicPlusBestRun,
  EnrichedRunPlayer,
} from "@/lib/raiderio/types";

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
  cleanup();
  vi.clearAllMocks();
});

// ─── Test data ───

const emptyGear = {
  head: null, neck: null, shoulder: null, back: null,
  chest: null, waist: null, wrist: null, hands: null,
  legs: null, feet: null, finger1: null, finger2: null,
  trinket1: null, trinket2: null, mainhand: null, offhand: null,
};

const mockPlayer: EnrichedRunPlayer = {
  character: {
    id: 1,
    name: "Thrall",
    realm: { slug: "area-52" },
    region: { slug: "us" },
    class: { name: "Shaman", slug: "shaman" },
    spec: { name: "Enhancement", slug: "enhancement" },
  },
  role: "dps",
  itemLevel: null,
  ranks: null,
  talentLoadoutText: null,
  thumbnailUrl: null,
  gear: emptyGear,
};

const mockPlayer2: EnrichedRunPlayer = {
  character: {
    id: 2,
    name: "Jaina",
    realm: { slug: "stormrage" },
    region: { slug: "us" },
    class: { name: "Mage", slug: "mage" },
    spec: { name: "Frost", slug: "frost" },
  },
  role: "dps",
  itemLevel: null,
  ranks: null,
  talentLoadoutText: null,
  thumbnailUrl: null,
  gear: emptyGear,
};

const mockRun: MythicPlusBestRun = {
  dungeon: "Mists of Tirna Scithe",
  short_name: "MISTS",
  mythic_level: 20,
  completed_at: "2024-01-15T12:00:00Z",
  clear_time_ms: 1800000,
  par_time_ms: 2100000,
  num_keystone_upgrades: 2,
  score: 185.5,
  url: "https://raider.io/mythic-plus-runs/season-tww-2/123-20-mists",
  keystone_run_id: 123,
};

const mockRun2: MythicPlusBestRun = {
  dungeon: "The Stonevault",
  short_name: "SV",
  mythic_level: 15,
  completed_at: "2024-01-14T10:00:00Z",
  clear_time_ms: 1200000,
  par_time_ms: 1500000,
  num_keystone_upgrades: 1,
  score: 140.2,
  url: "https://raider.io/mythic-plus-runs/season-tww-2/456-15-stonevault",
  keystone_run_id: 456,
};

/** Mock fetch to return roster data for run-details API */
function mockRunDetailsFetch(roster: EnrichedRunPlayer[]) {
  globalThis.fetch = vi.fn(async () => ({
    ok: true,
    json: async () => ({ roster }),
  })) as unknown as typeof fetch;
}

// ─── Tests ───

describe("MPlusHistoryTable", () => {
  describe("row expand/collapse behavior (Req 9.3)", () => {
    it("shows player table when a run row is clicked", async () => {
      mockRunDetailsFetch([mockPlayer, mockPlayer2]);
      const user = userEvent.setup();
      render(<MPlusHistoryTable bestRuns={[mockRun]} />);

      expect(screen.queryByText("Thrall")).toBeNull();

      const row = screen.getByRole("button", { name: /mists of tirna scithe/i });
      await user.click(row);

      await waitFor(() => {
        expect(screen.getByText("Thrall")).toBeInTheDocument();
        expect(screen.getByText("Jaina")).toBeInTheDocument();
      });
    });

    it("collapses the player table when the same row is clicked again", async () => {
      mockRunDetailsFetch([mockPlayer, mockPlayer2]);
      const user = userEvent.setup();
      render(<MPlusHistoryTable bestRuns={[mockRun]} />);

      const row = screen.getByRole("button", { name: /mists of tirna scithe/i });

      await user.click(row);
      await waitFor(() => {
        expect(screen.getByText("Thrall")).toBeInTheDocument();
      });

      await user.click(row);
      await waitFor(() => {
        expect(screen.queryByText("Thrall")).toBeNull();
      });
    });

    it("sets aria-expanded correctly on toggle", async () => {
      mockRunDetailsFetch([mockPlayer]);
      const user = userEvent.setup();
      render(<MPlusHistoryTable bestRuns={[mockRun]} />);

      const row = screen.getByRole("button", { name: /mists of tirna scithe/i });
      expect(row).toHaveAttribute("aria-expanded", "false");

      await user.click(row);
      expect(row).toHaveAttribute("aria-expanded", "true");

      await user.click(row);
      expect(row).toHaveAttribute("aria-expanded", "false");
    });

    it("only expands one row at a time", async () => {
      mockRunDetailsFetch([mockPlayer]);
      const user = userEvent.setup();
      render(<MPlusHistoryTable bestRuns={[mockRun, mockRun2]} />);

      const rows = screen.getAllByRole("button");
      const row1 = rows[0];
      const row2 = rows[1];

      await user.click(row1);
      await waitFor(() => {
        expect(row1).toHaveAttribute("aria-expanded", "true");
      });

      await user.click(row2);
      await waitFor(() => {
        expect(row1).toHaveAttribute("aria-expanded", "false");
        expect(row2).toHaveAttribute("aria-expanded", "true");
      });
    });
  });

  describe("player click callback (Req 9.4)", () => {
    it("calls onPlayerClick with the correct player and run", async () => {
      mockRunDetailsFetch([mockPlayer, mockPlayer2]);
      const onPlayerClick = vi.fn();
      const user = userEvent.setup();
      render(
        <MPlusHistoryTable bestRuns={[mockRun]} onPlayerClick={onPlayerClick} />
      );

      const row = screen.getByRole("button", { name: /mists of tirna scithe/i });
      await user.click(row);

      await waitFor(() => {
        expect(screen.getByText("Thrall")).toBeInTheDocument();
      });
      await user.click(screen.getByText("Thrall"));

      expect(onPlayerClick).toHaveBeenCalledOnce();
      expect(onPlayerClick).toHaveBeenCalledWith(mockPlayer, mockRun);
    });
  });

  describe("empty state", () => {
    it("renders empty message when bestRuns is empty", () => {
      render(<MPlusHistoryTable bestRuns={[]} />);
      expect(screen.getByText("No M+ history available.")).toBeInTheDocument();
    });
  });
});

describe("RunDetailModal", () => {
  const defaultProps: RunDetailModalProps = {
    player: mockPlayer,
    run: mockRun,
    open: true,
    onClose: vi.fn(),
  };

  describe("displays correct player data (Req 9.5)", () => {
    it("shows the player name in the modal title", () => {
      render(<RunDetailModal {...defaultProps} />);
      expect(screen.getByText("Thrall")).toBeInTheDocument();
    });

    it("shows the player role, spec, and class", () => {
      render(<RunDetailModal {...defaultProps} />);
      expect(screen.getByText(/DPS — Enhancement Shaman/)).toBeInTheDocument();
    });

    it("shows the run dungeon and key level", () => {
      render(<RunDetailModal {...defaultProps} />);
      expect(screen.getByText("Mists of Tirna Scithe")).toBeInTheDocument();
      expect(screen.getByText("+20")).toBeInTheDocument();
    });

    it("shows the run score", () => {
      render(<RunDetailModal {...defaultProps} />);
      expect(screen.getByText("185.5")).toBeInTheDocument();
    });
  });

  describe("Copy Talents (Req 9.7)", () => {
    it("copies talent loadout text to clipboard when Copy loadout is clicked", async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });

      const playerWithTalents: EnrichedRunPlayer = {
        ...mockPlayer,
        talentLoadoutText: "CsQAAAAAAAAAAAAAAAAAAAAAAAmZmZmZEz",
      };

      render(<RunDetailModal {...defaultProps} player={playerWithTalents} />);

      const copyBtn = screen.getByText("Copy loadout");
      fireEvent.click(copyBtn);

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledWith("CsQAAAAAAAAAAAAAAAAAAAAAAAmZmZmZEz");
      });
    });
  });

  describe("Character Profile navigation (Req 9.8)", () => {
    it("navigates to the character profile page when profile link is clicked", async () => {
      const onClose = vi.fn();
      render(<RunDetailModal {...defaultProps} onClose={onClose} />);

      const profileBtn = screen.getByText(/View full character profile/);
      fireEvent.click(profileBtn);

      await waitFor(() => {
        expect(pushMock).toHaveBeenCalledWith("/us/area-52/thrall");
        expect(onClose).toHaveBeenCalled();
      });
    });
  });
});
