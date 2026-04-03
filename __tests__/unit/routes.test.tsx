import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import UIShowcasePage from "@/app/ui/page";
import { RegionProvider } from "@/components/region-provider";

// Mock supabase server client for NewsPage
vi.mock("@/lib/supabase/server", () => {
  const createChain = (result: { data: unknown; count?: number }) => {
    const chain: Record<string, unknown> = {
      ...result,
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };
    // Make each method return the chain itself
    (chain.select as ReturnType<typeof vi.fn>).mockReturnValue(chain);
    (chain.order as ReturnType<typeof vi.fn>).mockReturnValue(chain);
    (chain.range as ReturnType<typeof vi.fn>).mockReturnValue(chain);
    (chain.eq as ReturnType<typeof vi.fn>).mockReturnValue(chain);
    return chain;
  };

  return {
    createClient: vi.fn().mockResolvedValue({
      from: vi.fn().mockImplementation(() => createChain({ data: [], count: 0 })),
    }),
  };
});

import NewsPage from "@/app/news/page";

// ─── 8.7 Static route rendering (/, /news, /ui) (Req 5.1, 5.2, 5.3) ───

describe("Home page (/)", () => {
  it("renders the bento grid sections", () => {
    render(<RegionProvider><HomePage /></RegionProvider>);
    expect(screen.getAllByText("Blue Tracker").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Leaderboards/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders the Gamers and UI sections", () => {
    render(<RegionProvider><HomePage /></RegionProvider>);
    expect(screen.getAllByText(/Top M\+/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("UI").length).toBeGreaterThanOrEqual(1);
  });
});

describe("News page (/news)", () => {
  it("renders the News heading", async () => {
    const searchParams = Promise.resolve({});
    const jsx = await NewsPage({ searchParams });
    render(jsx);
    expect(screen.getByText("WoW News")).toBeInTheDocument();
  });

  it("renders content about WoW news", async () => {
    const searchParams = Promise.resolve({});
    const jsx = await NewsPage({ searchParams });
    render(jsx);
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
