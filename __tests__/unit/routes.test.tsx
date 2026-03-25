import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import NewsPage from "@/app/news/page";
import UIShowcasePage from "@/app/ui/page";

// ─── 8.7 Static route rendering (/, /news, /ui) (Req 5.1, 5.2, 5.3) ───

describe("Home page (/)", () => {
  it("renders the Gamerphile heading", () => {
    render(<HomePage />);
    expect(screen.getByText("Gamerphile")).toBeInTheDocument();
  });

  it("renders a description mentioning World of Warcraft", () => {
    render(<HomePage />);
    expect(screen.getByText(/world of warcraft/i)).toBeInTheDocument();
  });
});

describe("News page (/news)", () => {
  it("renders the News heading", () => {
    render(<NewsPage />);
    expect(screen.getByText("News")).toBeInTheDocument();
  });

  it("renders content about WoW news", () => {
    render(<NewsPage />);
    expect(screen.getByText(/world of warcraft/i)).toBeInTheDocument();
  });
});

describe("UI Showcase page (/ui)", () => {
  it("renders the UI Showcase heading", () => {
    render(<UIShowcasePage />);
    expect(screen.getByText("UI Showcase")).toBeInTheDocument();
  });

  it("renders showcase buttons", () => {
    render(<UIShowcasePage />);
    expect(screen.getByText("Default")).toBeInTheDocument();
    expect(screen.getByText("Secondary")).toBeInTheDocument();
    expect(screen.getByText("Outline")).toBeInTheDocument();
  });
});
