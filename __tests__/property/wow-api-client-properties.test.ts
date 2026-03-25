/**
 * Property 2: Structured Error on API Failure
 * Property 3: Region and Locale in Request URL
 * Property 4: Authorization Header on All Requests
 *
 * **Validates: Requirements 4.4, 4.5, 4.6, 4.7**
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import * as fc from "fast-check";
import { WoWApiClient } from "@/lib/wow-api/client";
import type { WoWRegion } from "@/lib/wow-api/types";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

function tokenResponse(token = "test-token") {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      access_token: token,
      token_type: "bearer",
      expires_in: 86400,
      sub: "client-id",
    }),
  } as unknown as Response;
}

const REGION_HOSTS: Record<WoWRegion, string> = {
  us: "us.api.blizzard.com",
  eu: "eu.api.blizzard.com",
  kr: "kr.api.blizzard.com",
  tw: "tw.api.blizzard.com",
};

const arbRegion: fc.Arbitrary<WoWRegion> = fc.constantFrom("us", "eu", "kr", "tw");

// ── Property 2: Structured Error on API Failure ──

describe("Property 2: Structured Error on API Failure", () => {
  it("returns { ok: false, error: { status, message } } for any HTTP error", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 400, max: 599 }),
        fc.stringMatching(/^[a-zA-Z0-9 ]{1,50}$/),
        async (statusCode, errorMessage) => {
          globalThis.fetch = vi.fn(async (url: string | URL | Request) => {
            const urlStr = typeof url === "string" ? url : url.toString();
            if (urlStr.includes("oauth.battle.net/token")) {
              return tokenResponse();
            }
            return {
              ok: false,
              status: statusCode,
              statusText: "Error",
              json: async () => ({ message: errorMessage }),
            } as unknown as Response;
          });

          const client = new WoWApiClient({
            clientId: "id",
            clientSecret: "secret",
            region: "us",
          });

          const result = await client.getRealms();
          expect(result.ok).toBe(false);
          if (!result.ok) {
            expect(result.error.status).toBe(statusCode);
            expect(result.error.message).toBe(errorMessage);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Property 3: Region and Locale in Request URL ──

describe("Property 3: Region and Locale in Request URL", () => {
  it("constructs URL with correct regional host and locale query param", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbRegion,
        fc.stringMatching(/^[a-z]{2}_[A-Z]{2}$/),
        async (region, locale) => {
          let capturedUrl = "";
          globalThis.fetch = vi.fn(async (url: string | URL | Request) => {
            const urlStr = typeof url === "string" ? url : url.toString();
            if (urlStr.includes("oauth.battle.net/token")) {
              return tokenResponse();
            }
            capturedUrl = urlStr;
            return {
              ok: true,
              status: 200,
              json: async () => ({ realms: [] }),
            } as unknown as Response;
          });

          const client = new WoWApiClient({
            clientId: "id",
            clientSecret: "secret",
            region,
            locale,
          });

          await client.getRealms();

          expect(capturedUrl).toContain(REGION_HOSTS[region]);
          const parsedUrl = new URL(capturedUrl);
          expect(parsedUrl.searchParams.get("locale")).toBe(locale);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Property 4: Authorization Header on All Requests ──

describe("Property 4: Authorization Header on All Requests", () => {
  const arbMethod = fc.constantFrom(
    "getRealms",
    "getPlayableClasses"
  ) as fc.Arbitrary<"getRealms" | "getPlayableClasses">;

  it("includes Authorization: Bearer <non-empty-token> on every API request", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbMethod,
        fc.stringMatching(/^[a-zA-Z0-9]{5,40}$/),
        async (method, token) => {
          let capturedHeaders: HeadersInit | undefined;
          globalThis.fetch = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
            const urlStr = typeof url === "string" ? url : url.toString();
            if (urlStr.includes("oauth.battle.net/token")) {
              return tokenResponse(token);
            }
            capturedHeaders = init?.headers;
            return {
              ok: true,
              status: 200,
              json: async () => ({}),
            } as unknown as Response;
          });

          const client = new WoWApiClient({
            clientId: "id",
            clientSecret: "secret",
            region: "us",
          });

          await client[method]();

          const authHeader = (capturedHeaders as Record<string, string>)?.Authorization;
          expect(authHeader).toBeDefined();
          expect(authHeader).toBe(`Bearer ${token}`);
          expect(token.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
