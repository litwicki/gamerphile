import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock next/link to render a plain <a>
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => React.createElement("a", { href, ...props }, children),
}));

import { Footer } from "@/components/layout/footer";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Footer", () => {
  describe("three-column layout", () => {
    it("renders three columns (logo, patreon, nav)", () => {
      const { container } = render(<Footer />);
      const grid = container.querySelector(".grid.grid-cols-1.md\\:grid-cols-3");
      expect(grid).toBeInTheDocument();
      expect(grid!.children).toHaveLength(3);
    });
  });

  describe("logo column", () => {
    it("renders Raider.IO logo link with correct href and target", () => {
      render(<Footer />);
      const link = screen.getByLabelText("Raider.IO");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "https://raider.io");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("renders WarcraftLogs logo link with correct href and target", () => {
      render(<Footer />);
      const img = screen.getByAltText("WarcraftLogs logo");
      const link = img.closest("a");
      expect(link).toHaveAttribute("href", "https://warcraftlogs.com");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it('renders "WarcraftLogs" text', () => {
      render(<Footer />);
      expect(screen.getByText("WarcraftLogs")).toBeInTheDocument();
    });
  });

  describe("patreon column", () => {
    it("renders a link to the Gamerphile Patreon page", () => {
      render(<Footer />);
      const link = screen.getByText("Become a Patron");
      expect(link.closest("a")).toHaveAttribute(
        "href",
        "https://patreon.com/gamerphile"
      );
    });
  });

  describe("nav column", () => {
    it("renders nav links to Home, News, Characters, and UI", () => {
      render(<Footer />);
      const nav = screen.getByRole("navigation", { name: "Footer navigation" });

      const links = nav.querySelectorAll("a");
      const hrefs = Array.from(links).map((l) => l.getAttribute("href"));
      expect(hrefs).toEqual(["/", "/news", "/characters", "/ui"]);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("News")).toBeInTheDocument();
      expect(screen.getByText("Characters")).toBeInTheDocument();
      expect(screen.getByText("UI")).toBeInTheDocument();
    });

    it('renders a <nav> element with aria-label="Footer navigation"', () => {
      render(<Footer />);
      const nav = screen.getByRole("navigation", { name: "Footer navigation" });
      expect(nav).toBeInTheDocument();
      expect(nav.tagName.toLowerCase()).toBe("nav");
    });
  });

  describe("legal section", () => {
    it("displays the current year and Gamerphile", () => {
      render(<Footer />);
      const year = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`© ${year} Gamerphile`))).toBeInTheDocument();
    });

    it('renders "Privacy Policy" link', () => {
      render(<Footer />);
      const link = screen.getByText("Privacy Policy");
      expect(link.closest("a")).toHaveAttribute("href", "/privacy");
    });

    it('renders "Terms and Conditions" link', () => {
      render(<Footer />);
      const link = screen.getByText("Terms and Conditions");
      expect(link.closest("a")).toHaveAttribute("href", "/terms");
    });

    it("renders Blizzard disclaimer text", () => {
      render(<Footer />);
      expect(
        screen.getByText(/World of Warcraft® is a registered trademark of Blizzard Entertainment/)
      ).toBeInTheDocument();
    });
  });

  describe("divider", () => {
    it("renders a horizontal divider (hr element)", () => {
      const { container } = render(<Footer />);
      const hr = container.querySelector("hr");
      expect(hr).toBeInTheDocument();
    });
  });

  describe("container", () => {
    it("uses max-w-[var(--max-viewport)] on the content container", () => {
      const { container } = render(<Footer />);
      const div = container.querySelector(
        ".max-w-\\[var\\(--max-viewport\\)\\]"
      );
      expect(div).toBeInTheDocument();
    });
  });
});
