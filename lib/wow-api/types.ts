// ============================================================
// WoW API Data Models (Task 2.1)
// ============================================================

export interface CharacterProfile {
  id: number;
  name: string;
  realm: { id: number; name: string; slug: string };
  level: number;
  character_class: { id: number; name: string };
  race: { id: number; name: string };
  gender: { type: string; name: string };
  faction: { type: string; name: string };
  achievement_points: number;
  last_login_timestamp: number;
}

export interface CharacterMedia {
  character: { id: number; name: string };
  assets: Array<{ key: string; value: string }>;
}

export interface Realm {
  id: number;
  name: string;
  slug: string;
  region: { id: number; name: string };
  category: string;
  locale: string;
  timezone: string;
  type: { type: string; name: string };
}

export interface RealmIndex {
  realms: Array<{ id: number; name: string; slug: string }>;
}

export interface PlayableClass {
  id: number;
  name: string;
  gender_name: { male: string; female: string };
  power_type: { id: number; name: string };
  specializations: Array<{ id: number; name: string }>;
  media: { id: number };
}

export interface PlayableClassIndex {
  classes: Array<{ id: number; name: string }>;
}

// ============================================================
// Client Configuration Types (Task 2.2)
// ============================================================

export type WoWRegion = "us" | "eu" | "kr" | "tw";

export type WoWLocale = string;

export interface WoWClientConfig {
  clientId: string;
  clientSecret: string;
  region: WoWRegion;
  locale?: WoWLocale;
}

export interface WoWApiError {
  status: number;
  message: string;
}

export type WoWApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: WoWApiError };

// ============================================================
// Token Management (Task 2.3)
// ============================================================

export interface WoWApiToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  sub: string;
  expires_at: number;
}
