import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WCLClient } from "@/lib/wcl/client";

// ─── Helpers ───

const originalFetch = globalThis.fetch;

function tokenResponse(overrides: Record<string, unknown> = {}) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      access_token: "test-token",
      token_type: "bearer",
      expires_in: 86400,
      ...overrides,
    }),
  };
}

function graphqlResponse(data: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ data }),
  };
}

function mockFetch(
  responses: Array<{ ok: boolean; status?: number; statusText?: string; json: () => Promise<any> }>
) {
  let callIndex = 0;
  globalThis.fetch = vi.fn(async () => {
    const resp = responses[callIndex] ?? responses[responses.length - 1];
    callIndex++;
    return resp as Response;
  });
}

// ─── Token caching and refresh (Req 1.1, 1.2, 1.3, 1.4) ───

describe("WCLClient token management", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => { globalThis.fetch = originalFetch; });

  it("fetches a new token on the first query call", async () => {
    mockFetch([
      tokenResponse(),
      graphqlResponse({ characterData: { character: null } }),
    ]);

    const client = new WCLClient();
    await client.getCharacterZoneRankings("Test", "test-server", "us");

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://www.warcraftlogs.com/oauth/token"
    );
  });

  it("reuses a valid (non-expired) token without re-fetching", async () => {
    mockFetch([
      tokenResponse(),
      graphqlResponse({ characterData: { character: null } }),
      graphqlResponse({ characterData: { character: null } }),
    ]);

    const client = new WCLClient();
    await client.getCharacterZoneRankings("Test", "test-server", "us");
    await client.getCharacterZoneRankings("Test", "test-server", "us");

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    // 1 token fetch + 2 GraphQL calls = 3 total
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("refreshes the token when it has expired", async () => {
    const expiredToken = tokenResponse({ expires_in: 0 });
    const freshToken = tokenResponse({ access_token: "fresh-token" });
    const gqlResp = graphqlResponse({ characterData: { character: null } });

    mockFetch([expiredToken, gqlResp, freshToken, gqlResp]);

    const client = new WCLClient();
    await client.getCharacterZoneRankings("Test", "test-server", "us");
    await client.getCharacterZoneRankings("Test", "test-server", "us");

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    // 2 token fetches + 2 GraphQL calls = 4 total
    expect(fetchMock).toHaveBeenCalledTimes(4);
    // Third call should be another token request
    expect(fetchMock.mock.calls[2][0]).toBe(
      "https://www.warcraftlogs.com/oauth/token"
    );
  });

  it("throws when the token request fails", async () => {
    mockFetch([
      {
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({}),
      },
    ]);

    const client = new WCLClient();
    await expect(
      client.getCharacterZoneRankings("Test", "test-server", "us")
    ).rejects.toThrow(/WCL token request failed.*401/);
  });
});

// ─── GraphQL error handling (Req 2.3, 2.4) ───

describe("WCLClient GraphQL error handling", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => { globalThis.fetch = originalFetch; });

  it("throws when the response contains a GraphQL errors field", async () => {
    mockFetch([
      tokenResponse(),
      {
        ok: true,
        status: 200,
        json: async () => ({
          errors: [{ message: "Character not found" }],
        }),
      },
    ]);

    const client = new WCLClient();
    await expect(
      client.query("{ characterData { character { name } } }")
    ).rejects.toThrow("Character not found");
  });

  it("throws when the API returns a non-200 HTTP status", async () => {
    mockFetch([
      tokenResponse(),
      {
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
        json: async () => ({}),
      },
    ]);

    const client = new WCLClient();
    await expect(
      client.query("{ characterData { character { name } } }")
    ).rejects.toThrow(/WCL API error.*503/);
  });
});

// ─── getCharacterZoneRankings returns null when no data (Req 3.6) ───

describe("WCLClient.getCharacterZoneRankings", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => { globalThis.fetch = originalFetch; });

  it("returns null when the API returns no character data", async () => {
    mockFetch([
      tokenResponse(),
      graphqlResponse({ characterData: { character: null } }),
    ]);

    const client = new WCLClient();
    const result = await client.getCharacterZoneRankings(
      "Unknown",
      "unknown-server",
      "us"
    );
    expect(result).toBeNull();
  });

  it("returns zone ranking data when available", async () => {
    const rawZoneRanking = {
      bestPerformanceAverage: 85.5,
      medianPerformanceAverage: 72.3,
      difficulty: 5,
      zone: 38,
      rankings: [],
    };

    mockFetch([
      tokenResponse(),
      graphqlResponse({
        characterData: {
          character: { zoneRankings: rawZoneRanking },
        },
      }),
    ]);

    const client = new WCLClient();
    const result = await client.getCharacterZoneRankings(
      "Arthas",
      "tichondrius",
      "us"
    );
    expect(result).toEqual({
      zoneName: "",
      zoneID: 38,
      bestPercentile: 85.5,
      medianPercentile: 72.3,
      difficulty: 5,
    });
  });
});

// ─── getCharacterEncounterRankings returns null when no data ───

describe("WCLClient.getCharacterEncounterRankings", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => { globalThis.fetch = originalFetch; });

  it("returns null when the API returns no character data", async () => {
    mockFetch([
      tokenResponse(),
      graphqlResponse({ characterData: { character: null } }),
    ]);

    const client = new WCLClient();
    const result = await client.getCharacterEncounterRankings(
      "Unknown",
      "unknown-server",
      "us"
    );
    expect(result).toBeNull();
  });
});
