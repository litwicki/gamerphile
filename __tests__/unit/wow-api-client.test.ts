import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WoWApiClient } from "@/lib/wow-api/client";

// ─── 8.6 WoW API Client token refresh on expiry (Req 4.8) ───

describe("WoWApiClient token refresh", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function mockFetch(responses: Array<{ ok: boolean; status?: number; json: () => Promise<any> }>) {
    let callIndex = 0;
    globalThis.fetch = vi.fn(async () => {
      const resp = responses[callIndex] ?? responses[responses.length - 1];
      callIndex++;
      return resp as Response;
    });
  }

  it("fetches a new token on the first API call", async () => {
    const tokenResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        access_token: "fresh-token",
        token_type: "bearer",
        expires_in: 86400,
        sub: "client-id",
      }),
    };
    const apiResponse = {
      ok: true,
      status: 200,
      json: async () => ({ realms: [] }),
    };

    mockFetch([tokenResponse, apiResponse]);

    const client = new WoWApiClient({
      clientId: "test-id",
      clientSecret: "test-secret",
      region: "us",
    });

    const result = await client.getRealms();
    expect(result.ok).toBe(true);

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    // First call = token request, second call = API request
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe("https://oauth.battle.net/token");
  });

  it("reuses a valid (non-expired) token without re-fetching", async () => {
    const tokenResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        access_token: "reusable-token",
        token_type: "bearer",
        expires_in: 86400,
        sub: "client-id",
      }),
    };
    const apiResponse = {
      ok: true,
      status: 200,
      json: async () => ({ realms: [] }),
    };

    mockFetch([tokenResponse, apiResponse, apiResponse]);

    const client = new WoWApiClient({
      clientId: "test-id",
      clientSecret: "test-secret",
      region: "us",
    });

    await client.getRealms();
    await client.getRealms();

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    // 1 token fetch + 2 API calls = 3 total (token is reused)
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("refreshes the token when it has expired", async () => {
    const client = new WoWApiClient({
      clientId: "test-id",
      clientSecret: "test-secret",
      region: "us",
    });

    // First: return a token that expires immediately (expires_in: 0)
    const expiredTokenResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        access_token: "expired-token",
        token_type: "bearer",
        expires_in: 0, // expires immediately
        sub: "client-id",
      }),
    };
    const freshTokenResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        access_token: "fresh-token",
        token_type: "bearer",
        expires_in: 86400,
        sub: "client-id",
      }),
    };
    const apiResponse = {
      ok: true,
      status: 200,
      json: async () => ({ realms: [] }),
    };

    mockFetch([expiredTokenResponse, apiResponse, freshTokenResponse, apiResponse]);

    await client.getRealms(); // uses expired-token (just obtained, expires_at = now + 0*1000)
    await client.getRealms(); // should refresh because token expired

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    // 2 token fetches + 2 API calls = 4 total
    expect(fetchMock).toHaveBeenCalledTimes(4);
    // The third call should be another token request
    expect(fetchMock.mock.calls[2][0]).toBe("https://oauth.battle.net/token");
  });
});

// ─── 8.9 WoW API Client endpoint method coverage (Req 4.2) ───

describe("WoWApiClient endpoint methods", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function setupMockFetch(apiJsonResponse: any = {}) {
    const tokenResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        access_token: "test-token",
        token_type: "bearer",
        expires_in: 86400,
        sub: "client-id",
      }),
    };
    const apiResponse = {
      ok: true,
      status: 200,
      json: async () => apiJsonResponse,
    };

    globalThis.fetch = vi.fn(async (url: string | URL | Request) => {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("oauth.battle.net/token")) {
        return tokenResponse as Response;
      }
      return apiResponse as Response;
    });
  }

  const client = new WoWApiClient({
    clientId: "test-id",
    clientSecret: "test-secret",
    region: "us",
  });

  it("has getCharacterProfile method that calls the correct endpoint", async () => {
    setupMockFetch({ id: 1, name: "Arthas" });
    await client.getCharacterProfile("tichondrius", "arthas");

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const apiCall = fetchMock.mock.calls.find(
      (c: any[]) => !c[0].toString().includes("oauth.battle.net")
    );
    expect(apiCall).toBeDefined();
    expect(apiCall![0]).toContain("/profile/wow/character/tichondrius/arthas");
  });

  it("has getCharacterMedia method that calls the correct endpoint", async () => {
    setupMockFetch({ character: { id: 1 }, assets: [] });
    await client.getCharacterMedia("tichondrius", "arthas");

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const apiCall = fetchMock.mock.calls.find(
      (c: any[]) => !c[0].toString().includes("oauth.battle.net")
    );
    expect(apiCall).toBeDefined();
    expect(apiCall![0]).toContain("/profile/wow/character/tichondrius/arthas/character-media");
  });

  it("has getRealms method that calls the correct endpoint", async () => {
    setupMockFetch({ realms: [] });
    await client.getRealms();

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const apiCall = fetchMock.mock.calls.find(
      (c: any[]) => !c[0].toString().includes("oauth.battle.net")
    );
    expect(apiCall).toBeDefined();
    expect(apiCall![0]).toContain("/data/wow/realm/index");
  });

  it("has getRealm method that calls the correct endpoint", async () => {
    setupMockFetch({ id: 1, name: "Tichondrius", slug: "tichondrius" });
    await client.getRealm("tichondrius");

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const apiCall = fetchMock.mock.calls.find(
      (c: any[]) => !c[0].toString().includes("oauth.battle.net")
    );
    expect(apiCall).toBeDefined();
    expect(apiCall![0]).toContain("/data/wow/realm/tichondrius");
  });

  it("has getPlayableClasses method that calls the correct endpoint", async () => {
    setupMockFetch({ classes: [] });
    await client.getPlayableClasses();

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const apiCall = fetchMock.mock.calls.find(
      (c: any[]) => !c[0].toString().includes("oauth.battle.net")
    );
    expect(apiCall).toBeDefined();
    expect(apiCall![0]).toContain("/data/wow/playable-class/index");
  });

  it("has getPlayableClass method that calls the correct endpoint", async () => {
    setupMockFetch({ id: 6, name: "Death Knight" });
    await client.getPlayableClass(6);

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const apiCall = fetchMock.mock.calls.find(
      (c: any[]) => !c[0].toString().includes("oauth.battle.net")
    );
    expect(apiCall).toBeDefined();
    expect(apiCall![0]).toContain("/data/wow/playable-class/6");
  });
});
