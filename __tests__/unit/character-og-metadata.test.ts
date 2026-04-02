import { describe, it, expect, vi, beforeEach } from "vitest";

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

const MOCK_PROFILE = {
  id: 1,
  name: "Thrall",
  realm: { id: 1, name: "Area 52", slug: "area-52" },
  level: 80,
  character_class: { id: 7, name: "Shaman" },
  race: { id: 2, name: "Orc" },
  gender: { type: "MALE", name: "Male" },
  faction: { type: "HORDE", name: "Horde" },
  achievement_points: 1000,
  last_login_timestamp: 0,
};

const MAIN_RAW_URL = "https://render.worldofwarcraft.com/character/main-raw.jpg";

const MOCK_MEDIA = {
  character: { id: 1, name: "Thrall" },
  assets: [
    { key: "avatar", value: "https://render.worldofwarcraft.com/avatar.jpg" },
    { key: "main-raw", value: MAIN_RAW_URL },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── 2.1 Successful API response metadata ───

describe("generateMetadata — successful response", () => {
  beforeEach(() => {
    mockGetCharacterProfile.mockResolvedValue({ ok: true, data: MOCK_PROFILE });
    mockGetCharacterMedia.mockResolvedValue({ ok: true, data: MOCK_MEDIA });
  });

  it("formats the title as '{name} - {realm} ({REGION}) | Gamerphile'", async () => {
    const meta = await generateMetadata(makeParams());
    expect(meta.title).toBe("Thrall - Area 52 (US) | Gamerphile");
  });

  it("formats the description as 'Level {level} {race} {class} on {realm} ({REGION})'", async () => {
    const meta = await generateMetadata(makeParams());
    expect(meta.description).toBe("Level 80 Orc Shaman on Area 52 (US)");
  });

  it("sets openGraph.images[0].url to the main-raw asset URL", async () => {
    const meta = await generateMetadata(makeParams());
    const images = meta.openGraph?.images as any[];
    expect(images[0].url).toBe(MAIN_RAW_URL);
  });

  it("sets openGraph.images dimensions to 1024×1024", async () => {
    const meta = await generateMetadata(makeParams());
    const images = meta.openGraph?.images as any[];
    expect(images[0].width).toBe(1024);
    expect(images[0].height).toBe(1024);
  });

  it("sets openGraph.images[0].alt to '{name} character render'", async () => {
    const meta = await generateMetadata(makeParams());
    const images = meta.openGraph?.images as any[];
    expect(images[0].alt).toBe("Thrall character render");
  });

  it("sets openGraph.type to 'profile'", async () => {
    const meta = await generateMetadata(makeParams());
    expect(meta.openGraph?.type).toBe("profile");
  });

  it("sets openGraph.siteName to 'Gamerphile'", async () => {
    const meta = await generateMetadata(makeParams());
    expect(meta.openGraph?.siteName).toBe("Gamerphile");
  });

  it("sets twitter.card to 'summary_large_image'", async () => {
    const meta = await generateMetadata(makeParams());
    expect(meta.twitter?.card).toBe("summary_large_image");
  });

  it("sets twitter.images[0] to the main-raw asset URL", async () => {
    const meta = await generateMetadata(makeParams());
    const images = meta.twitter?.images as any[];
    expect(images[0]).toBe(MAIN_RAW_URL);
  });
});

// ─── 2.2 Graceful degradation ───

describe("generateMetadata — graceful degradation", () => {
  it("returns {} when profile API fails", async () => {
    mockGetCharacterProfile.mockResolvedValue({
      ok: false,
      error: { status: 500, message: "error" },
    });
    mockGetCharacterMedia.mockResolvedValue({ ok: true, data: MOCK_MEDIA });

    const meta = await generateMetadata(makeParams());
    expect(meta).toEqual({});
  });

  it("omits images when media API fails", async () => {
    mockGetCharacterProfile.mockResolvedValue({ ok: true, data: MOCK_PROFILE });
    mockGetCharacterMedia.mockResolvedValue({ ok: false });

    const meta = await generateMetadata(makeParams());
    expect(meta.title).toBeDefined();
    expect(meta.description).toBeDefined();
    expect(meta.openGraph?.images).toBeUndefined();
    expect(meta.twitter?.images).toBeUndefined();
  });

  it("omits images when main-raw asset is missing from assets array", async () => {
    mockGetCharacterProfile.mockResolvedValue({ ok: true, data: MOCK_PROFILE });
    mockGetCharacterMedia.mockResolvedValue({
      ok: true,
      data: {
        character: { id: 1, name: "Thrall" },
        assets: [{ key: "avatar", value: "https://example.com/avatar.jpg" }],
      },
    });

    const meta = await generateMetadata(makeParams());
    expect(meta.title).toBeDefined();
    expect(meta.description).toBeDefined();
    expect(meta.openGraph?.images).toBeUndefined();
    expect(meta.twitter?.images).toBeUndefined();
  });
});

// ─── 2.3 Invalid route parameters ───

describe("generateMetadata — invalid route parameters", () => {
  it("returns {} for an invalid region", async () => {
    const meta = await generateMetadata(makeParams("area-52", "xx", "thrall"));
    expect(meta).toEqual({});
    expect(mockGetCharacterProfile).not.toHaveBeenCalled();
  });

  it("returns {} for a realm with special characters", async () => {
    const meta = await generateMetadata(makeParams("realm@!", "us", "thrall"));
    expect(meta).toEqual({});
    expect(mockGetCharacterProfile).not.toHaveBeenCalled();
  });

  it("returns {} for an empty characterName", async () => {
    const meta = await generateMetadata(makeParams("area-52", "us", ""));
    expect(meta).toEqual({});
    expect(mockGetCharacterProfile).not.toHaveBeenCalled();
  });
});
