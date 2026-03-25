import type {
  WoWClientConfig,
  WoWRegion,
  WoWApiToken,
  WoWApiResult,
  WoWApiError,
  CharacterProfile,
  CharacterMedia,
  RealmIndex,
  Realm,
  PlayableClassIndex,
  PlayableClass,
} from "./types";

const REGION_HOSTS: Record<WoWRegion, string> = {
  us: "us.api.blizzard.com",
  eu: "eu.api.blizzard.com",
  kr: "kr.api.blizzard.com",
  tw: "tw.api.blizzard.com",
};

const TOKEN_URL = "https://oauth.battle.net/token";

/**
 * WoW API Client — typed wrapper around the Battle.net WoW Community API.
 * Handles OAuth client-credentials token management and regional routing.
 */
export class WoWApiClient {
  private clientId: string;
  private clientSecret: string;
  private region: WoWRegion;
  private locale: string;
  private token: WoWApiToken | null = null;

  constructor(config: WoWClientConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.region = config.region;
    this.locale = config.locale ?? "en_US";
  }

  // ---------------------------------------------------------------------------
  // Token management
  // ---------------------------------------------------------------------------

  /**
   * Obtain an access token using the OAuth client credentials flow.
   * POST https://oauth.battle.net/token with grant_type=client_credentials.
   */
  private async getAccessToken(): Promise<string> {
    const body = new URLSearchParams({ grant_type: "client_credentials" });

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
            "base64"
          ),
      },
      body,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to obtain access token: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    this.token = {
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      sub: data.sub ?? "",
      expires_at: Date.now() + data.expires_in * 1000,
    };

    return this.token.access_token;
  }

  /**
   * Return a valid access token, refreshing automatically when expired.
   */
  private async refreshToken(): Promise<string> {
    if (this.token && Date.now() < this.token.expires_at) {
      return this.token.access_token;
    }
    return this.getAccessToken();
  }

  // ---------------------------------------------------------------------------
  // Generic request helper
  // ---------------------------------------------------------------------------

  /**
   * Execute an authenticated GET request against the regional WoW API.
   *
   * - Constructs the URL from the configured region host
   * - Attaches the Bearer token via Authorization header
   * - Appends the locale as a query parameter
   * - Returns a discriminated WoWApiResult union
   */
  private async request<T>(path: string): Promise<WoWApiResult<T>> {
    const accessToken = await this.refreshToken();
    const host = REGION_HOSTS[this.region];
    const url = new URL(`https://${host}${path}`);
    url.searchParams.set("namespace", `profile-${this.region}`);
    url.searchParams.set("locale", this.locale);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      let message: string;
      try {
        const errorBody = await response.json();
        message = errorBody.detail ?? errorBody.message ?? response.statusText;
      } catch {
        message = response.statusText;
      }
      return { ok: false, error: { status: response.status, message } };
    }

    const data: T = await response.json();
    return { ok: true, data };
  }

  /**
   * Same as request() but uses the "static" namespace (for game-data endpoints).
   */
  private async requestStatic<T>(path: string): Promise<WoWApiResult<T>> {
    const accessToken = await this.refreshToken();
    const host = REGION_HOSTS[this.region];
    const url = new URL(`https://${host}${path}`);
    url.searchParams.set("namespace", `static-${this.region}`);
    url.searchParams.set("locale", this.locale);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      let message: string;
      try {
        const errorBody = await response.json();
        message = errorBody.detail ?? errorBody.message ?? response.statusText;
      } catch {
        message = response.statusText;
      }
      return { ok: false, error: { status: response.status, message } };
    }

    const data: T = await response.json();
    return { ok: true, data };
  }

  // ---------------------------------------------------------------------------
  // Character Profile endpoints
  // ---------------------------------------------------------------------------

  async getCharacterProfile(
    realm: string,
    characterName: string
  ): Promise<WoWApiResult<CharacterProfile>> {
    const realmSlug = realm.toLowerCase();
    const name = characterName.toLowerCase();
    return this.request<CharacterProfile>(
      `/profile/wow/character/${realmSlug}/${name}`
    );
  }

  async getCharacterMedia(
    realm: string,
    characterName: string
  ): Promise<WoWApiResult<CharacterMedia>> {
    const realmSlug = realm.toLowerCase();
    const name = characterName.toLowerCase();
    return this.request<CharacterMedia>(
      `/profile/wow/character/${realmSlug}/${name}/character-media`
    );
  }

  // ---------------------------------------------------------------------------
  // Realm endpoints
  // ---------------------------------------------------------------------------

  async getRealms(): Promise<WoWApiResult<RealmIndex>> {
    return this.requestStatic<RealmIndex>("/data/wow/realm/index");
  }

  async getRealm(realmSlug: string): Promise<WoWApiResult<Realm>> {
    return this.requestStatic<Realm>(
      `/data/wow/realm/${realmSlug.toLowerCase()}`
    );
  }

  // ---------------------------------------------------------------------------
  // Playable Class endpoints
  // ---------------------------------------------------------------------------

  async getPlayableClasses(): Promise<WoWApiResult<PlayableClassIndex>> {
    return this.requestStatic<PlayableClassIndex>(
      "/data/wow/playable-class/index"
    );
  }

  async getPlayableClass(
    classId: number
  ): Promise<WoWApiResult<PlayableClass>> {
    return this.requestStatic<PlayableClass>(
      `/data/wow/playable-class/${classId}`
    );
  }
}
