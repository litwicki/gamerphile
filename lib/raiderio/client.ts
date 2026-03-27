import type {
  RaidRankingsParams,
  RaidRankingsResponse,
  MythicPlusRunsParams,
  MythicPlusRunsResponse,
  MythicPlusStaticDataResponse,
  RaidingStaticDataResponse,
  CharacterProfileParams,
  CharacterProfileResponse,
} from "./types";

const BASE_URL = "https://raider.io";

function buildUrl(path: string, params: Record<string, string | number | undefined>): string {
  const url = new URL(path, BASE_URL);
  const apiKey = process.env.RAIDERIO_API_KEY;
  if (apiKey) {
    url.searchParams.set("access_key", apiKey);
  }
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    throw new Error(`Raider.IO API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function getRaidRankings(params: RaidRankingsParams): Promise<RaidRankingsResponse> {
  const url = buildUrl("/api/v1/raiding/raid-rankings", {
    raid: params.raid,
    difficulty: params.difficulty,
    region: params.region,
    limit: params.limit,
    page: params.page,
  });
  return fetchJson<RaidRankingsResponse>(url);
}

export async function getMythicPlusStaticData(expansionId: number): Promise<MythicPlusStaticDataResponse> {
  const url = buildUrl("/api/v1/mythic-plus/static-data", {
    expansion_id: expansionId,
  });
  return fetchJson<MythicPlusStaticDataResponse>(url);
}

export async function getMythicPlusRuns(params: MythicPlusRunsParams): Promise<MythicPlusRunsResponse> {
  const url = buildUrl("/api/v1/mythic-plus/runs", {
    season: params.season,
    region: params.region,
    dungeon: params.dungeon,
    page: params.page,
  });
  return fetchJson<MythicPlusRunsResponse>(url);
}

export async function getCharacterProfile(params: CharacterProfileParams): Promise<CharacterProfileResponse> {
  const url = buildUrl("/api/v1/characters/profile", {
    region: params.region,
    realm: params.realm,
    name: params.name,
    fields: params.fields,
  });
  return fetchJson<CharacterProfileResponse>(url);
}

export async function getRaidingStaticData(expansionId: number): Promise<RaidingStaticDataResponse> {
  const url = buildUrl("/api/v1/raiding/static-data", {
    expansion_id: expansionId,
  });
  return fetchJson<RaidingStaticDataResponse>(url);
}
