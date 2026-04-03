import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/wcl/character/route";
import { NextRequest } from "next/server";

// ─── Mock WCLClient ───

const mockGetCharacterZoneRankings = vi.fn();
const mockGetCharacterEncounterRankings = vi.fn();

vi.mock("@/lib/wcl/client", () => ({
  WCLClient: vi.fn().mockImplementation(() => ({
    getCharacterZoneRankings: mockGetCharacterZoneRankings,
    getCharacterEncounterRankings: mockGetCharacterEncounterRankings,
  })),
}));

// ─── Helpers ───

function buildRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL("http://localhost/api/wcl/character");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url);
}

// ─── Tests ───

describe("GET /api/wcl/character", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.WCL_CLIENT_ID = "test-id";
    process.env.WCL_CLIENT_SECRET = "test-secret";
  });

  // ── 400 for missing parameters (Req 14.4) ──

  it("returns 400 when all parameters are missing", async () => {
    const res = await GET(buildRequest());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/name/);
    expect(body.error).toMatch(/serverSlug/);
    expect(body.error).toMatch(/serverRegion/);
  });

  it("returns 400 when name is missing", async () => {
    const res = await GET(buildRequest({ serverSlug: "tichondrius", serverRegion: "us" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/name/);
  });

  it("returns 400 when serverSlug is missing", async () => {
    const res = await GET(buildRequest({ name: "Arthas", serverRegion: "us" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/serverSlug/);
  });

  it("returns 400 when serverRegion is missing", async () => {
    const res = await GET(buildRequest({ name: "Arthas", serverSlug: "tichondrius" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/serverRegion/);
  });

  // ── 502 when WCLClient throws (Req 14.5) ──

  it("returns 502 when WCLClient throws an error", async () => {
    mockGetCharacterZoneRankings.mockRejectedValue(new Error("WCL API error: 503 Service Unavailable"));
    mockGetCharacterEncounterRankings.mockResolvedValue(null);

    const res = await GET(
      buildRequest({ name: "Arthas", serverSlug: "tichondrius", serverRegion: "us" })
    );
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toMatch(/WCL API error/);
  });

  it("returns 502 with 'Unknown error' for non-Error throws", async () => {
    mockGetCharacterZoneRankings.mockRejectedValue("something went wrong");
    mockGetCharacterEncounterRankings.mockResolvedValue(null);

    const res = await GET(
      buildRequest({ name: "Arthas", serverSlug: "tichondrius", serverRegion: "us" })
    );
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe("Unknown error");
  });

  // ── Successful JSON response shape (Req 14.2, 14.3) ──

  it("returns 200 with zoneRankings and encounterRankings on success", async () => {
    const zoneRankings = {
      zoneName: "Nerub-ar Palace",
      zoneID: 38,
      bestPercentile: 92.1,
      medianPercentile: 78.4,
      difficulty: 5,
    };
    const encounterRankings = [
      {
        encounterName: "Ulgrax the Devourer",
        encounterID: 2902,
        percentile: 88.3,
        spec: "Frost",
        difficulty: 5,
        reportCode: "abc123",
      },
    ];

    mockGetCharacterZoneRankings.mockResolvedValue(zoneRankings);
    mockGetCharacterEncounterRankings.mockResolvedValue(encounterRankings);

    const res = await GET(
      buildRequest({ name: "Arthas", serverSlug: "tichondrius", serverRegion: "us" })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ zoneRankings, encounterRankings });
  });

  it("returns 200 with null values when character has no WCL data", async () => {
    mockGetCharacterZoneRankings.mockResolvedValue(null);
    mockGetCharacterEncounterRankings.mockResolvedValue(null);

    const res = await GET(
      buildRequest({ name: "Unknown", serverSlug: "unknown-server", serverRegion: "us" })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ zoneRankings: null, encounterRankings: null });
  });
});
