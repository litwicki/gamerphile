// ============================================================
// Warcraft Logs (WCL) API Response Types
// ============================================================

export interface WCLCharacter {
  name: string;
  serverSlug: string;
  serverRegion: string;
  classID: number;
}

export interface WCLEncounterRanking {
  encounterName: string;
  encounterID: number;
  percentile: number; // 0–100 Parse_Percentile
  spec: string;
  difficulty: number;
  reportCode: string;
}

export interface WCLZoneRanking {
  zoneName: string;
  zoneID: number;
  bestPercentile: number; // 0–100
  medianPercentile: number; // 0–100
  difficulty: number;
}

export interface WCLReport {
  code: string;
  title: string;
  startTime: number;
  endTime: number;
  zoneID: number;
}

export interface WCLCharacterResponse {
  zoneRankings: WCLZoneRanking | null;
  encounterRankings: WCLEncounterRanking[] | null;
}

// ── Raw WCL GraphQL JSON shapes (zoneRankings returns a JSON scalar) ──

/** Shape of a single ranking entry inside the zoneRankings JSON blob */
export interface WCLRawRankingEntry {
  encounter: { id: number; name: string };
  rankPercent: number;
  spec: string;
  difficulty: number;
  report?: { code: string };
  bestAmount?: number;
}

/** Shape of the zoneRankings JSON scalar returned by the WCL v2 API */
export interface WCLRawZoneRankings {
  bestPerformanceAverage: number | null;
  medianPerformanceAverage: number | null;
  difficulty: number;
  zone: number;
  rankings: WCLRawRankingEntry[];
}
