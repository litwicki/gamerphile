/**
 * Property 5: Dynamic Route Renders Character Page
 * Property 6: Public Routes Accessible Without Auth
 *
 * **Validates: Requirements 5.4, 5.5**
 */
import { describe, it, expect, vi } from "vitest";
import * as fc from "fast-check";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href }, children),
}));

// Shared mock for getCharacterProfile
const getCharacterProfileMock = vi.fn().mockResolvedValue({
  ok: true,
  data: {
    id: 1,
    name: "TestChar",
    realm: { id: 1, name: "TestRealm", slug: "testrealm" },
    level: 70,
    character_class: { id: 1, name: "Warrior" },
    race: { id: 1, name: "Human" },
    gender: { type: "MALE", name: "Male" },
    faction: { type: "ALLIANCE", name: "Alliance" },
    achievement_points: 1000,
    last_login_timestamp: Date.now(),
  },
});

const getCharacterMediaMock = vi.fn().mockResolvedValue({
  ok: true,
  data: {
    character: { id: 1, name: "TestChar" },
    assets: [],
  },
});

// Mock @/lib/wow-api
vi.mock("@/lib/wow-api", () => ({
  WoWApiClient: vi.fn().mockImplementation(() => ({
    getCharacterProfile: getCharacterProfileMock,
    getCharacterMedia: getCharacterMediaMock,
  })),
}));

// Mock @/lib/raiderio/client
vi.mock("@/lib/raiderio/client", () => ({
  getCharacterProfile: vi.fn().mockResolvedValue(null),
}));

import CharacterPage from "@/app/[region]/[realm]/[characterName]/page";
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

// ── Arbitraries ──

const arbAlphaHyphen = fc.stringMatching(/^[a-z][a-z0-9-]{0,14}$/);
const arbRegion = fc.constantFrom("us", "eu", "kr", "tw");

// ── Property 5: Dynamic Route Renders Character Page ──

describe("Property 5: Dynamic Route Renders Character Page", () => {
  it("renders without crashing for valid realm/region/characterName", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbAlphaHyphen,
        arbRegion,
        arbAlphaHyphen,
        async (realm, region, characterName) => {
          const params = Promise.resolve({ realm, region, characterName });
          const jsx = await CharacterPage({ params });
          const { unmount } = render(jsx);
          expect(document.querySelector("div")).toBeTruthy();
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Property 6: Public Routes Accessible Without Auth ──

describe("Property 6: Public Routes Accessible Without Auth", () => {
  it("Home page renders without auth", () => {
    const { unmount } = render(<RegionProvider><HomePage /></RegionProvider>);
    expect(screen.getAllByText("Blue Tracker").length).toBeGreaterThanOrEqual(1);
    unmount();
  });

  it("News page renders without auth", async () => {
    const searchParams = Promise.resolve({});
    const jsx = await NewsPage({ searchParams });
    const { unmount } = render(jsx);
    expect(screen.getByText("WoW News")).toBeInTheDocument();
    unmount();
  });

  it("UI Showcase page renders without auth", () => {
    const { unmount } = render(<UIShowcasePage />);
    expect(screen.getByText("UI Showcase")).toBeInTheDocument();
    unmount();
  });

  it("Character page renders without auth for any valid params", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbAlphaHyphen,
        arbRegion,
        arbAlphaHyphen,
        async (realm, region, characterName) => {
          const params = Promise.resolve({ realm, region, characterName });
          const jsx = await CharacterPage({ params });
          const { unmount } = render(jsx);
          expect(document.querySelector("div")).toBeTruthy();
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
