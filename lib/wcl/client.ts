import type {
  WCLEncounterRanking,
  WCLZoneRanking,
  WCLRawZoneRankings,
} from "./types";

const TOKEN_URL = "https://www.warcraftlogs.com/oauth/token";
const GRAPHQL_URL = "https://www.warcraftlogs.com/api/v2/client";

/**
 * Warcraft Logs v2 GraphQL API client.
 * Mirrors the WoWApiClient OAuth2 client-credentials pattern.
 */
export class WCLClient {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.clientId = process.env.WCL_CLIENT_ID ?? "";
    this.clientSecret = process.env.WCL_CLIENT_SECRET ?? "";
  }

  // ---------------------------------------------------------------------------
  // Token management
  // ---------------------------------------------------------------------------

  /**
   * Obtain an access token using the OAuth2 client credentials flow.
   */
  private async getAccessToken(): Promise<string> {
    const body = new URLSearchParams({ grant_type: "client_credentials" });

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64"),
      },
      body,
    });

    if (!response.ok) {
      throw new Error(
        `WCL token request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000;

    return this.accessToken!;
  }

  /**
   * Return a valid access token, refreshing automatically when expired.
   */
  private async refreshToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }
    return this.getAccessToken();
  }

  // ---------------------------------------------------------------------------
  // GraphQL query execution
  // ---------------------------------------------------------------------------

  /**
   * Execute an authenticated GraphQL query against the WCL v2 API.
   */
  async query<T>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    const token = await this.refreshToken();

    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(
        `WCL API error: ${response.status} ${response.statusText}`
      );
    }

    const json = await response.json();

    if (json.errors && json.errors.length > 0) {
      throw new Error(json.errors[0].message);
    }

    return json.data as T;
  }

  // ---------------------------------------------------------------------------
  // Character data queries
  // ---------------------------------------------------------------------------

  /**
   * Fetch zone rankings for a character (best/median percentiles for a raid tier).
   * The WCL v2 API returns zoneRankings as a JSON scalar; we map it to our types.
   */
  async getCharacterZoneRankings(
    name: string,
    serverSlug: string,
    serverRegion: string,
    zoneID?: number,
    difficulty?: number,
    metric: string = "dps"
  ): Promise<WCLZoneRanking | null> {
    const zoneArg = zoneID != null ? `, zoneID: ${zoneID}` : "";
    const diffArg = difficulty != null ? `, difficulty: ${difficulty}` : "";

    const gql = `
      query {
        characterData {
          character(name: "${name}", serverSlug: "${serverSlug}", serverRegion: "${serverRegion}") {
            zoneRankings(metric: ${metric}${zoneArg}${diffArg})
          }
        }
      }
    `;

    const data = await this.query<{
      characterData: {
        character: { zoneRankings: WCLRawZoneRankings } | null;
      };
    }>(gql);

    const raw = data.characterData.character?.zoneRankings;
    if (!raw) return null;

    return {
      zoneName: "",
      zoneID: raw.zone ?? 0,
      bestPercentile: raw.bestPerformanceAverage ?? 0,
      medianPercentile: raw.medianPerformanceAverage ?? 0,
      difficulty: raw.difficulty ?? 0,
    };
  }

  /**
   * Fetch per-encounter rankings for a character from the zoneRankings JSON blob.
   * The WCL v2 encounterRankings field requires an encounterID, so we extract
   * per-boss data from zoneRankings.rankings instead.
   */
  async getCharacterEncounterRankings(
    name: string,
    serverSlug: string,
    serverRegion: string,
    zoneID?: number,
    difficulty?: number,
    metric: string = "dps"
  ): Promise<WCLEncounterRanking[] | null> {
    const zoneArg = zoneID != null ? `, zoneID: ${zoneID}` : "";
    const diffArg = difficulty != null ? `, difficulty: ${difficulty}` : "";

    const gql = `
      query {
        characterData {
          character(name: "${name}", serverSlug: "${serverSlug}", serverRegion: "${serverRegion}") {
            zoneRankings(metric: ${metric}${zoneArg}${diffArg})
          }
        }
      }
    `;

    const data = await this.query<{
      characterData: {
        character: { zoneRankings: WCLRawZoneRankings } | null;
      };
    }>(gql);

    const raw = data.characterData.character?.zoneRankings;
    if (!raw?.rankings || raw.rankings.length === 0) return null;

    return raw.rankings.map((r) => ({
      encounterName: r.encounter.name,
      encounterID: r.encounter.id,
      percentile: r.rankPercent ?? 0,
      spec: r.spec ?? "",
      difficulty: r.difficulty ?? raw.difficulty ?? 0,
      reportCode: r.report?.code ?? "",
    }));
  }
}
