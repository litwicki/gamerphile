import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

// ─── Mock WoWApiClient ───

const mockGetCharacterProfile = vi.fn();
const mockGetCharacterMedia = vi.fn();

vi.mock("@/lib/wow-api", () => ({
  WoWApiClient: vi.fn().mockImplementation(() => ({
    getCharacterProfile: mockGetCharacterProfile,
    getCharacterMedia: mockGetCharacterMedia,
  })),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

import { generateMetadata } from "@/app/[region]/[realm]/[characterName]/page";

// ─── Helpers ───

function makeParams(
  realm = "area-52",
  region = "us",
  characterName = "thrall"
) {
  return { params: Promise.resolve({ realm, region, characterName }) };
}

// ─── Arbitraries ───

const arbRegion = fc.constantFrom("us", "eu", "kr", "tw");

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

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Property 1: Metadata text formatting ───
// Feature: character-og-image, Property 1: Metadata text formatting
/**
 * Property 1 — Metadata text formatting: for any valid character profile,
 * title and description follow the specified format patterns.
 * **Validates: Requirements 1.2, 1.3**
 */
describe("Property 1: Metadata text formatting", () => {
  it("title matches '{name} - {realm} ({REGION}) | Gamerphile' and description matches 'Level {level} {race} {class} on {realm} ({REGION})'", async () => {
    await fc.assert(
      fc.asyncProperty(arbProfile, arbRegion, async (profile, region) => {
        mockGetCharacterProfile.mockResolvedValue({ ok: true, data: profile });
        mockGetCharacterMedia.mockResolvedValue({
          ok: true,
          data: {
            character: { id: profile.id, name: profile.name },
            assets: [{ key: "avatar", value: "https://example.com/avatar.jpg" }],
          },
        });

        const meta = await generateMetadata(makeParams("testrealm", region, "testchar"));
        const regionUpper = region.toUpperCase();

        expect(meta.title).toBe(
          `${profile.name} - ${profile.realm.name} (${regionUpper}) | Gamerphile`
        );
        expect(meta.description).toBe(
          `Level ${profile.level} ${profile.race.name} ${profile.character_class.name} on ${profile.realm.name} (${regionUpper})`
        );
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 2: Image metadata inclusion ───
// Feature: character-og-image, Property 2: Image metadata inclusion
/**
 * Property 2 — Image metadata inclusion: for any valid profile and media
 * with a main-raw asset, OG and twitter image fields are correctly populated.
 * **Validates: Requirements 1.4, 1.5, 5.1**
 */
describe("Property 2: Image metadata inclusion", () => {
  it("openGraph.images and twitter.images are populated with the main-raw URL", async () => {
    const arbMainRawUrl = fc.webUrl();

    await fc.assert(
      fc.asyncProperty(arbProfile, arbRegion, arbMainRawUrl, async (profile, region, mainRawUrl) => {
        mockGetCharacterProfile.mockResolvedValue({ ok: true, data: profile });
        mockGetCharacterMedia.mockResolvedValue({
          ok: true,
          data: {
            character: { id: profile.id, name: profile.name },
            assets: [
              { key: "avatar", value: "https://example.com/avatar.jpg" },
              { key: "main-raw", value: mainRawUrl },
            ],
          },
        });

        const meta = await generateMetadata(makeParams("testrealm", region, "testchar"));

        const ogImages = meta.openGraph?.images as any[];
        expect(ogImages).toBeDefined();
        expect(ogImages[0].url).toBe(mainRawUrl);
        expect(ogImages[0].width).toBe(1024);
        expect(ogImages[0].height).toBe(1024);
        expect(ogImages[0].alt).toBe(`${profile.name} character render`);

        expect((meta.twitter as any)?.card).toBe("summary_large_image");
        const twitterImages = meta.twitter?.images as any[];
        expect(twitterImages[0]).toBe(mainRawUrl);
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 3: Invalid parameters yield empty metadata ───
// Feature: character-og-image, Property 3: Invalid parameters yield empty metadata
/**
 * Property 3 — Invalid parameters yield empty metadata: for any invalid region,
 * realm, or characterName, generateMetadata returns `{}`.
 * **Validates: Requirements 2.1, 2.2**
 */
describe("Property 3: Invalid parameters yield empty metadata", () => {
  it("returns {} for invalid regions", async () => {
    const arbInvalidRegion = fc
      .stringMatching(/^[a-z]{1,10}$/)
      .filter((s) => !["us", "eu", "kr", "tw"].includes(s));

    await fc.assert(
      fc.asyncProperty(arbInvalidRegion, async (region) => {
        const meta = await generateMetadata(makeParams("area-52", region, "thrall"));
        expect(meta).toEqual({});
        expect(mockGetCharacterProfile).not.toHaveBeenCalled();
      }),
      { numRuns: 100 },
    );
  });

  it("returns {} for realm with special characters", async () => {
    const arbBadRealm = fc
      .stringMatching(/^[!@#$%^&*()+=]{1,10}$/);

    await fc.assert(
      fc.asyncProperty(arbBadRealm, async (realm) => {
        const meta = await generateMetadata(makeParams(realm, "us", "thrall"));
        expect(meta).toEqual({});
        expect(mockGetCharacterProfile).not.toHaveBeenCalled();
      }),
      { numRuns: 100 },
    );
  });

  it("returns {} for characterName with special characters", async () => {
    const arbBadName = fc
      .stringMatching(/^[!@#$%^&*()+=]{1,10}$/);

    await fc.assert(
      fc.asyncProperty(arbBadName, async (name) => {
        const meta = await generateMetadata(makeParams("area-52", "us", name));
        expect(meta).toEqual({});
        expect(mockGetCharacterProfile).not.toHaveBeenCalled();
      }),
      { numRuns: 100 },
    );
  });

  it("returns {} for empty realm or characterName", async () => {
    await fc.assert(
      fc.asyncProperty(arbRegion, async (region) => {
        const metaEmptyRealm = await generateMetadata(makeParams("", region, "thrall"));
        expect(metaEmptyRealm).toEqual({});

        const metaEmptyName = await generateMetadata(makeParams("area-52", region, ""));
        expect(metaEmptyName).toEqual({});
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 4: Profile failure yields empty metadata ───
// Feature: character-og-image, Property 4: Profile failure yields empty metadata
/**
 * Property 4 — Profile failure yields empty metadata: for any profile API error,
 * generateMetadata returns `{}`.
 * **Validates: Requirement 3.1**
 */
describe("Property 4: Profile failure yields empty metadata", () => {
  it("returns {} when profile API returns non-ok result", async () => {
    const arbError = fc.record({
      status: fc.integer({ min: 400, max: 599 }),
      message: fc.stringMatching(/^[a-zA-Z0-9 ]{1,50}$/),
    });

    await fc.assert(
      fc.asyncProperty(arbError, arbRegion, async (error, region) => {
        mockGetCharacterProfile.mockResolvedValue({ ok: false, error });
        mockGetCharacterMedia.mockResolvedValue({ ok: true, data: { character: { id: 1, name: "X" }, assets: [] } });

        const meta = await generateMetadata(makeParams("area-52", region, "thrall"));
        expect(meta).toEqual({});
      }),
      { numRuns: 100 },
    );
  });

  it("returns {} when profile API promise rejects", async () => {
    const arbMessage = fc.stringMatching(/^[a-zA-Z0-9 ]{1,50}$/);

    await fc.assert(
      fc.asyncProperty(arbMessage, arbRegion, async (message, region) => {
        mockGetCharacterProfile.mockRejectedValue(new Error(message));
        mockGetCharacterMedia.mockResolvedValue({ ok: true, data: { character: { id: 1, name: "X" }, assets: [] } });

        const meta = await generateMetadata(makeParams("area-52", region, "thrall"));
        expect(meta).toEqual({});
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 5: Missing image graceful degradation ───
// Feature: character-og-image, Property 5: Missing image graceful degradation
/**
 * Property 5 — Missing image graceful degradation: for any valid profile
 * without a main-raw asset, metadata has title/description but no images.
 * **Validates: Requirements 3.2, 3.3, 5.2**
 */
describe("Property 5: Missing image graceful degradation", () => {
  it("has title/description but no images when media API fails", async () => {
    await fc.assert(
      fc.asyncProperty(arbProfile, arbRegion, async (profile, region) => {
        mockGetCharacterProfile.mockResolvedValue({ ok: true, data: profile });
        mockGetCharacterMedia.mockResolvedValue({ ok: false, error: { status: 500, message: "fail" } });

        const meta = await generateMetadata(makeParams("testrealm", region, "testchar"));
        const regionUpper = region.toUpperCase();

        expect(meta.title).toBe(
          `${profile.name} - ${profile.realm.name} (${regionUpper}) | Gamerphile`
        );
        expect(meta.description).toBe(
          `Level ${profile.level} ${profile.race.name} ${profile.character_class.name} on ${profile.realm.name} (${regionUpper})`
        );
        expect(meta.openGraph?.images).toBeUndefined();
        expect(meta.twitter?.images).toBeUndefined();
      }),
      { numRuns: 100 },
    );
  });

  it("has title/description but no images when assets array lacks main-raw", async () => {
    const arbNonMainRawKey = fc
      .stringMatching(/^[a-z]{3,15}$/)
      .filter((k) => k !== "main-raw");

    const arbAssetsWithoutMainRaw = fc.array(
      fc.record({
        key: arbNonMainRawKey,
        value: fc.webUrl(),
      }),
      { minLength: 0, maxLength: 5 },
    );

    await fc.assert(
      fc.asyncProperty(arbProfile, arbRegion, arbAssetsWithoutMainRaw, async (profile, region, assets) => {
        mockGetCharacterProfile.mockResolvedValue({ ok: true, data: profile });
        mockGetCharacterMedia.mockResolvedValue({
          ok: true,
          data: {
            character: { id: profile.id, name: profile.name },
            assets,
          },
        });

        const meta = await generateMetadata(makeParams("testrealm", region, "testchar"));
        const regionUpper = region.toUpperCase();

        expect(meta.title).toBe(
          `${profile.name} - ${profile.realm.name} (${regionUpper}) | Gamerphile`
        );
        expect(meta.description).toBe(
          `Level ${profile.level} ${profile.race.name} ${profile.character_class.name} on ${profile.realm.name} (${regionUpper})`
        );
        expect(meta.openGraph?.images).toBeUndefined();
        expect(meta.twitter?.images).toBeUndefined();
      }),
      { numRuns: 100 },
    );
  });

  it("has title/description but no images when media API promise rejects", async () => {
    await fc.assert(
      fc.asyncProperty(arbProfile, arbRegion, async (profile, region) => {
        mockGetCharacterProfile.mockResolvedValue({ ok: true, data: profile });
        mockGetCharacterMedia.mockRejectedValue(new Error("network error"));

        const meta = await generateMetadata(makeParams("testrealm", region, "testchar"));
        const regionUpper = region.toUpperCase();

        expect(meta.title).toBe(
          `${profile.name} - ${profile.realm.name} (${regionUpper}) | Gamerphile`
        );
        expect(meta.description).toBe(
          `Level ${profile.level} ${profile.race.name} ${profile.character_class.name} on ${profile.realm.name} (${regionUpper})`
        );
        expect(meta.openGraph?.images).toBeUndefined();
        expect(meta.twitter?.images).toBeUndefined();
      }),
      { numRuns: 100 },
    );
  });
});
