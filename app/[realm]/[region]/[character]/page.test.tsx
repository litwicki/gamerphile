import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/navigation
const notFoundMock = vi.fn();
vi.mock("next/navigation", () => ({
  notFound: () => {
    notFoundMock();
    throw new Error("NEXT_NOT_FOUND");
  },
}));

// Mock the WoWApiClient
const getCharacterProfileMock = vi.fn();
vi.mock("@/lib/wow-api", () => ({
  WoWApiClient: vi.fn().mockImplementation(() => ({
    getCharacterProfile: getCharacterProfileMock,
  })),
}));

import CharacterPage from "./page";
import { WoWApiClient } from "@/lib/wow-api";

function makeParams(realm: string, region: string, character: string) {
  return Promise.resolve({ realm, region, character });
}

describe("CharacterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 7.4 — Input validation
  describe("input validation", () => {
    it("calls notFound for invalid region", async () => {
      await expect(
        CharacterPage({ params: makeParams("tichondrius", "xx", "arthas") })
      ).rejects.toThrow("NEXT_NOT_FOUND");
      expect(notFoundMock).toHaveBeenCalled();
    });

    it("calls notFound for empty realm", async () => {
      await expect(
        CharacterPage({ params: makeParams("", "us", "arthas") })
      ).rejects.toThrow("NEXT_NOT_FOUND");
      expect(notFoundMock).toHaveBeenCalled();
    });

    it("calls notFound for empty character", async () => {
      await expect(
        CharacterPage({ params: makeParams("tichondrius", "us", "") })
      ).rejects.toThrow("NEXT_NOT_FOUND");
      expect(notFoundMock).toHaveBeenCalled();
    });

    it("calls notFound for realm with special characters", async () => {
      await expect(
        CharacterPage({ params: makeParams("tic<script>", "us", "arthas") })
      ).rejects.toThrow("NEXT_NOT_FOUND");
      expect(notFoundMock).toHaveBeenCalled();
    });

    it("calls notFound for character with special characters", async () => {
      await expect(
        CharacterPage({ params: makeParams("tichondrius", "eu", "art/has") })
      ).rejects.toThrow("NEXT_NOT_FOUND");
      expect(notFoundMock).toHaveBeenCalled();
    });
  });

  // 7.1 — Server-side data fetching
  describe("data fetching", () => {
    it("creates WoWApiClient with the region from URL params", async () => {
      getCharacterProfileMock.mockResolvedValue({
        ok: true,
        data: {
          id: 1,
          name: "Arthas",
          realm: { id: 1, name: "Tichondrius", slug: "tichondrius" },
          level: 70,
          character_class: { id: 6, name: "Death Knight" },
          race: { id: 1, name: "Human" },
          gender: { type: "MALE", name: "Male" },
          faction: { type: "ALLIANCE", name: "Alliance" },
          achievement_points: 1000,
          last_login_timestamp: 1700000000000,
        },
      });

      await CharacterPage({ params: makeParams("tichondrius", "eu", "arthas") });

      expect(WoWApiClient).toHaveBeenCalledWith(
        expect.objectContaining({ region: "eu" })
      );
      expect(getCharacterProfileMock).toHaveBeenCalledWith("tichondrius", "arthas");
    });
  });

  // 7.2 — Character profile display
  describe("profile display", () => {
    it("renders character name, realm, level, race, and class", async () => {
      getCharacterProfileMock.mockResolvedValue({
        ok: true,
        data: {
          id: 1,
          name: "Arthas",
          realm: { id: 1, name: "Tichondrius", slug: "tichondrius" },
          level: 70,
          character_class: { id: 6, name: "Death Knight" },
          race: { id: 1, name: "Human" },
          gender: { type: "MALE", name: "Male" },
          faction: { type: "ALLIANCE", name: "Alliance" },
          achievement_points: 1000,
          last_login_timestamp: 1700000000000,
        },
      });

      const jsx = await CharacterPage({
        params: makeParams("tichondrius", "us", "arthas"),
      });
      render(jsx);

      expect(screen.getByText("Arthas")).toBeInTheDocument();
      expect(screen.getByText("Tichondrius")).toBeInTheDocument();
      expect(screen.getByText("70")).toBeInTheDocument();
      expect(screen.getByText("Human")).toBeInTheDocument();
      expect(screen.getByText("Death Knight")).toBeInTheDocument();
    });
  });

  // 7.3 — Error handling
  describe("error handling", () => {
    it("calls notFound when API returns 404", async () => {
      getCharacterProfileMock.mockResolvedValue({
        ok: false,
        error: { status: 404, message: "Not Found" },
      });

      await expect(
        CharacterPage({ params: makeParams("tichondrius", "us", "nobody") })
      ).rejects.toThrow("NEXT_NOT_FOUND");
      expect(notFoundMock).toHaveBeenCalled();
    });

    it("displays error message for non-404 API errors", async () => {
      getCharacterProfileMock.mockResolvedValue({
        ok: false,
        error: { status: 500, message: "Internal Server Error" },
      });

      const jsx = await CharacterPage({
        params: makeParams("tichondrius", "us", "arthas"),
      });
      render(jsx);

      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(
        screen.getByText("Failed to load character: Internal Server Error")
      ).toBeInTheDocument();
    });
  });
});
