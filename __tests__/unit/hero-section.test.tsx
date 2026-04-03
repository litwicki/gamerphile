import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "@/app/[region]/[realm]/[characterName]/hero-section";

const defaultProps = {
  mainRawUrl: "https://example.com/render.png",
  classTheme: "theme-warrior",
  name: "Thrall",
  specName: "Enhancement",
  raceName: "Orc",
  className: "Shaman",
  level: 80,
  realmName: "Thrall",
  region: "us",
  classColor: "text-green-400",
};

describe("HeroSection", () => {
  describe("mobile height", () => {
    it("renders the container with h-[50vh] class for mobile viewport", () => {
      const { container } = render(<HeroSection {...defaultProps} />);
      const hero = container.firstElementChild as HTMLElement;
      expect(hero.className).toContain("h-[50vh]");
    });

    it("renders the container with md:h-[40vh] class for desktop viewport", () => {
      const { container } = render(<HeroSection {...defaultProps} />);
      const hero = container.firstElementChild as HTMLElement;
      expect(hero.className).toContain("md:h-[40vh]");
    });
  });

  describe("gradient scrims", () => {
    it("renders a mobile gradient scrim with md:hidden", () => {
      const { container } = render(<HeroSection {...defaultProps} />);
      const mobileScrim = container.querySelector(".md\\:hidden.bg-gradient-to-t");
      expect(mobileScrim).toBeInTheDocument();
    });

    it("renders a desktop gradient scrim with hidden md:block", () => {
      const { container } = render(<HeroSection {...defaultProps} />);
      const desktopScrim = container.querySelector(".hidden.md\\:block");
      expect(desktopScrim).toBeInTheDocument();
      expect(desktopScrim?.className).toContain("bg-gradient-to-t");
    });
  });

  describe("character identity text", () => {
    it("renders the character name", () => {
      render(<HeroSection {...defaultProps} />);
      expect(screen.getByText("Thrall")).toBeInTheDocument();
    });

    it("renders spec, race, and class info", () => {
      render(<HeroSection {...defaultProps} />);
      expect(screen.getByText("Enhancement Orc Shaman")).toBeInTheDocument();
    });

    it("renders level, realm, and region", () => {
      render(<HeroSection {...defaultProps} realmName="Area-52" />);
      expect(screen.getByText(/Level 80/)).toBeInTheDocument();
      expect(screen.getByText(/Area-52/)).toBeInTheDocument();
      expect(screen.getByText(/us/i)).toBeInTheDocument();
    });

    it("renders without specName when undefined", () => {
      render(<HeroSection {...defaultProps} specName={undefined} />);
      expect(screen.getByText("Orc Shaman")).toBeInTheDocument();
    });
  });

  describe("background image", () => {
    it("renders the character image when mainRawUrl is provided", () => {
      render(<HeroSection {...defaultProps} />);
      const img = screen.getByAltText("Thrall character render");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "https://example.com/render.png");
    });

    it("renders a gradient fallback when mainRawUrl is undefined", () => {
      const { container } = render(
        <HeroSection {...defaultProps} mainRawUrl={undefined} />
      );
      const fallback = container.querySelector(".bg-gradient-to-br");
      expect(fallback).toBeInTheDocument();
    });
  });
});
