import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import CharacterLoading from "@/app/[region]/[realm]/[characterName]/loading";

// ─── 8.8 Character page loading indicator (Req 6.2) ───

describe("Character loading indicator", () => {
  it("renders a hero skeleton placeholder", () => {
    const { container } = render(<CharacterLoading />);
    const hero = container.querySelector(".h-\\[40vh\\]");
    expect(hero).toBeInTheDocument();
    expect(hero?.className).toContain("animate-pulse");
  });

  it("renders animated skeleton cards", () => {
    const { container } = render(<CharacterLoading />);
    const pulseElements = container.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);
  });
});
