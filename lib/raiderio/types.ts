export interface RaidRankingsParams {
  raid: string;
  difficulty: string;
  region: string;
  limit?: number;
  page?: number;
}

export interface MythicPlusRunsParams {
  season: string;
  region: string;
  dungeon?: string;
  page?: number;
}

export interface CharacterProfileParams {
  region: string;
  realm: string;
  name: string;
  fields?: string;
}

export interface RaidRankingEntry {
  rank: number;
  region: string;
  guild: {
    id: number;
    name: string;
    faction: string;
    realm: {
      id: number;
      name: string;
      slug: string;
      altName?: string;
      locale: string;
      isConnected: boolean;
    };
    region: {
      name: string;
      slug: string;
      short_name: string;
    };
    path: string;
    logo?: string;
    color?: string;
  };
  encountersDefeated: {
    slug: string;
    name: string;
    defeatedAt: string;
  }[];
  encountersTotal: number;
  area?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface RaidRankingsResponse {
  raidRankings: RaidRankingEntry[];
}

export interface MythicPlusRun {
  summary: string;
  dungeon: {
    id: number;
    name: string;
    short_name: string;
    slug: string;
    expansion_id: number;
    icon_url?: string;
  };
  mythic_level: number;
  clear_time_ms: number;
  completed_at: string;
  num_keystone_upgrades: number;
  score: number;
  roster: {
    character: {
      id: number;
      name: string;
      realm: { slug: string };
      region: { slug: string };
      class: { name: string; slug: string };
      spec?: { name: string; slug: string };
    };
    role: string;
  }[];
}

export interface MythicPlusRunsResponse {
  rankings: MythicPlusRun[];
  leaderboard_url?: string;
}

export interface MythicPlusStaticDataResponse {
  seasons: {
    slug: string;
    name: string;
    short_name: string;
    starts: Record<string, string>;
    ends: Record<string, string>;
    dungeons: {
      id: number;
      challenge_mode_id: number;
      slug: string;
      name: string;
      short_name: string;
    }[];
  }[];
}

export interface RaidingStaticDataResponse {
  raids: {
    id: number;
    slug: string;
    name: string;
    short_name: string;
    icon: string;
    starts: Record<string, string>;
    ends: Record<string, string>;
    encounters: {
      id: number;
      slug: string;
      name: string;
    }[];
  }[];
}

export interface CharacterProfileResponse {
  name: string;
  race: string;
  class: string;
  active_spec_name: string;
  active_spec_role: string;
  gender: string;
  faction: string;
  achievement_points: number;
  thumbnail_url: string;
  region: string;
  realm: string;
  profile_url: string;
  [key: string]: unknown;
}
