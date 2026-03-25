import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { render } from "@testing-library/react";

const notFoundMock = vi.fn();
vi.mock("next/navigation", () => ({
  notFound: () => {
    notFoundMock();
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const getCharacterProfileMock = vi.fn();
vi.mock("@/lib/wow-api", () => ({
  WoWApiClient: vi.fn().mockImplementation(() => ({
    getCharacterProfile: getCharacterProfileMock,
  })),
}));

import CharacterPage from "@/app/[realm]/[region]/[character]/page";
import { WoWApiClient } from "@/lib/wow-api";

beforeEach(() => {
  vi.clearAllMocks();
});

const arbValidParam = fc.stringMatching(/^[a-z][a-z0-9-]{0,14}$/);
const arbRegion = fc.constantFrom("us", "eu", "kr", "tw");

/**
 * Property 7: Invalid Character Params Show Not-Found
 * **Validates: Requirements 5.6**
 */
describe("Property 7: Invalid Character Params Show Not-Found", () => {
  it("calls notFound() for invalid regions", async () => {
    const arbInvalidRegion = fc.stringMatching(/^[a-z]{1,10}$/)
      .filter((s) => !["us", "eu", "kr", "tw"].includes(s));

    await fc.assert(
      fc.asyncProperty(arbValidParam, arbInvalidRegion, arbValidParam,
        async (realm, region, character) => {
          notFoundMock.mockClear();
          let threw = false;
          try {
            await CharacterPage({ params: Promise.resolve({ realm, region, character }) });
          } catch (e: any) {
            if (e.message === "NEXT_NOT_FOUND") threw = true;
            else throw e;
          }
          expect(threw).toBe(true);
        }),
      { numRuns: 100 },
    );
  });

  it("calls notFound() for empty realm", async () => {
    await fc.assert(
      fc.asyncProperty(arbRegion, arbValidParam, async (region, character) => {
        notFoundMock.mockClear();
        let threw = false;
        try {
          await CharacterPage({ params: Promise.resolve({ realm: "", region, character }) });
        } catch (e: any) {
          if (e.message === "NEXT_NOT_FOUND") threw = true;
          else throw e;
        }
        expect(threw).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("calls notFound() for params with special characters", async () => {
    const arbSpecialChar = fc.stringMatching(/^[!@#$%^&*()+=]{1,10}$/);

    await fc.assert(
      fc.asyncProperty(arbSpecialChar, arbRegion, arbValidParam,
        async (realm, region, character) => {
          notFoundMock.mockClear();
          let threw = false;
          try {
            await CharacterPage({ params: Promise.resolve({ realm, region, character }) });
          } catch (e: any) {
            if (e.message === "NEXT_NOT_FOUND") threw = true;
            else throw e;
          }
          expect(threw).toBe(true);
        }),
      { numRuns: 100 },
    );
  });
});

/**
 * Property 8: Character Page Passes URL Params to API Client
 * **Validates: Requirements 6.1**
 */
describe("Property 8: Character Page Passes URL Params to API Client", () => {
  it("forwards exact realm and character params to getCharacterProfile", async () => {
    await fc.assert(
      fc.asyncProperty(arbValidParam, arbRegion, arbValidParam,
        async (realm, region, character) => {
          getCharacterProfileMock.mockResolvedValue({
            ok: true,
            data: {
              id: 1, name: "Test",
              realm: { id: 1, name: "Realm", slug: "realm" },
              level: 70,
              character_class: { id: 1, name: "Warrior" },
              race: { id: 1, name: "Human" },
              gender: { type: "MALE", name: "Male" },
              faction: { type: "ALLIANCE", name: "Alliance" },
              achievement_points: 0, last_login_timestamp: 0,
            },
          });

          const jsx = await CharacterPage({ params: Promise.resolve({ realm, region, character }) });
          const { unmount } = render(jsx);

          expect(getCharacterProfileMock).toHaveBeenCalledWith(realm, character);
          expect(WoWApiClient).toHaveBeenCalledWith(expect.objectContaining({ region }));

          unmount();
        }),
      { numRuns: 100 },
    );
  });
});

/**
 * Property 9: Character Page Displays All Required Fields
 * **Validates: Requirements 6.3**
 */
describe("Property 9: Character Page Displays All Required Fields", () => {
  const arbProfile = fc.record({
    id: fc.nat(),
    name: fc.stringMatching(/^[A-Z][a-z]{2,15}$/),
    realm: fc.record({
      id: fc.nat(),
      name: fc.stringMatching(/^[A-Z][a-z]{2,15}$/),
      slug: fc.stringMatching(/^[a-z]{3,15}$/),
    }),
    level: fc.integer({ min: 1, max: 80 }),
    character_class: fc.record({
      id: fc.nat(),
      name: fc.stringMatching(/^[A-Z][a-z]{2,15}$/),
    }),
    race: fc.record({
      id: fc.nat(),
      name: fc.stringMatching(/^[A-Z][a-z]{2,15}$/),
    }),
    gender: fc.record({
      type: fc.stringMatching(/^[A-Z]{3,8}$/),
      name: fc.stringMatching(/^[A-Z][a-z]{2,8}$/),
    }),
    faction: fc.record({
      type: fc.stringMatching(/^[A-Z]{3,10}$/),
      name: fc.stringMatching(/^[A-Z][a-z]{2,10}$/),
    }),
    achievement_points: fc.nat(),
    last_login_timestamp: fc.nat(),
  });

  it("renders name, realm, level, race, and class from profile data", async () => {
    await fc.assert(
      fc.asyncProperty(arbProfile, async (profile) => {
        getCharacterProfileMock.mockResolvedValue({ ok: true, data: profile });

        const jsx = await CharacterPage({
          params: Promise.resolve({ realm: "testrealm", region: "us", character: "testchar" }),
        });
        const { container, unmount } = render(jsx);
        const text = container.textContent ?? "";

        expect(text).toContain(profile.name);
        expect(text).toContain(profile.realm.name);
        expect(text).toContain(String(profile.level));
        expect(text).toContain(profile.race.name);
        expect(text).toContain(profile.character_class.name);

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});

/**
 * Property 10: Character Page Shows Error on API Failure
 * **Validates: Requirements 6.4**
 */
describe("Property 10: Character Page Shows Error on API Failure", () => {
  it("renders error message for non-404 API errors", async () => {
    const arbNon404Error = fc.record({
      status: fc.integer({ min: 400, max: 599 }).filter((s) => s !== 404),
      message: fc.stringMatching(/^[a-zA-Z0-9 ]{1,50}$/),
    });

    await fc.assert(
      fc.asyncProperty(arbNon404Error, async (error) => {
        getCharacterProfileMock.mockResolvedValue({ ok: false, error });

        const jsx = await CharacterPage({
          params: Promise.resolve({ realm: "testrealm", region: "us", character: "testchar" }),
        });
        const { container, unmount } = render(jsx);
        const text = container.textContent ?? "";

        expect(text).toContain("Error");
        expect(text).toContain(error.message);

        unmount();
      }),
      { numRuns: 100 },
    );
  });

  it("calls notFound() for 404 API errors", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^[a-zA-Z0-9 ]{1,50}$/),
        async (message) => {
          notFoundMock.mockClear();
          getCharacterProfileMock.mockResolvedValue({
            ok: false,
            error: { status: 404, message },
          });

          let threw = false;
          try {
            await CharacterPage({
              params: Promise.resolve({ realm: "testrealm", region: "us", character: "testchar" }),
            });
          } catch (e: any) {
            if (e.message === "NEXT_NOT_FOUND") threw = true;
            else throw e;
          }
          expect(threw).toBe(true);
          expect(notFoundMock).toHaveBeenCalled();
        },
      ),
      { numRuns: 100 },
    );
  });
});
