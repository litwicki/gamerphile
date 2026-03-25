import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CharacterLoading from "@/app/[realm]/[region]/[character]/loading";

// ─── 8.8 Character page loading indicator (Req 6.2) ───

describe("Character loading indicator", () => {
  it("renders loading text", () => {
    render(<CharacterLoading />);
    expect(screen.getByText(/loading character data/i)).toBeInTheDocument();
  });

  it("renders an animated spinner", () => {
    const { container } = render(<CharacterLoading />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });
});
