export { WoWApiClient } from "./client";
export type {
  WoWClientConfig,
  WoWRegion,
  WoWLocale,
  WoWApiToken,
  WoWApiResult,
  WoWApiError,
  CharacterProfile,
  CharacterMedia,
  Realm,
  RealmIndex,
  PlayableClass,
  PlayableClassIndex,
} from "./types";

import { WoWApiClient } from "./client";
import type { WoWRegion } from "./types";

/**
 * Pre-configured WoW API client instance.
 * Reads credentials from environment variables:
 *   BATTLENET_CLIENT_ID
 *   BATTLENET_CLIENT_SECRET
 *   WOW_API_REGION  (optional, defaults to "us")
 *   WOW_API_LOCALE  (optional, defaults to "en_US")
 */
export const wowApiClient = new WoWApiClient({
  clientId: process.env.BATTLENET_CLIENT_ID ?? "",
  clientSecret: process.env.BATTLENET_CLIENT_SECRET ?? "",
  region: (process.env.WOW_API_REGION as WoWRegion) ?? "us",
  locale: process.env.WOW_API_LOCALE ?? "en_US",
});
