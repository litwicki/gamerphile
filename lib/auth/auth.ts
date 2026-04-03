import NextAuth from "next-auth";
import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import BattleNetProvider from "./battlenet-provider";

// Extended JWT type with Battle.net fields
export interface ExtendedJWT extends JWT {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number; // unix timestamp in seconds
  battletag?: string;
  picture?: string | null;
  error?: "RefreshTokenError";
}

// Extended session type with Battle.net fields
export interface GamerphileSession extends Session {
  accessToken?: string;
  error?: "RefreshTokenError";
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    battletag?: string;
  };
}

/**
 * Fetch the user's WoW profile avatar URL using their OAuth access token.
 * Returns the avatar asset URL from the first character's media, or null on failure.
 */
export async function fetchWoWAvatarUrl(accessToken: string, region: string = "us"): Promise<string | null> {
  try {
    // Step 1: Get the user's WoW profile to find their first character
    const profileRes = await fetch(
      `https://${region}.api.blizzard.com/profile/user/wow?namespace=profile-${region}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!profileRes.ok) return null;

    const profile = await profileRes.json();

    // Find the first character across all WoW accounts
    const firstCharacter = profile.wow_accounts?.[0]?.characters?.[0];
    if (!firstCharacter) return null;

    const realmSlug = firstCharacter.realm?.slug;
    const characterName = firstCharacter.name?.toLowerCase();
    if (!realmSlug || !characterName) return null;

    // Step 2: Get the character's media to find the avatar asset
    const mediaRes = await fetch(
      `https://${region}.api.blizzard.com/profile/wow/character/${realmSlug}/${characterName}/character-media?namespace=profile-${region}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!mediaRes.ok) return null;

    const media = await mediaRes.json();

    // Find the "avatar" asset
    const avatarAsset = media.assets?.find((a: { key: string; value: string }) => a.key === "avatar");
    return avatarAsset?.value ?? null;
  } catch {
    return null;
  }
}

async function refreshBattleNetToken(token: ExtendedJWT): Promise<ExtendedJWT> {
  const credentials = Buffer.from(
    `${process.env.BATTLENET_CLIENT_ID}:${process.env.BATTLENET_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch("https://oauth.battle.net/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token.refreshToken!,
    }),
  });

  const refreshed = await response.json();
  if (!response.ok) throw refreshed;

  return {
    ...token,
    accessToken: refreshed.access_token,
    expiresAt: Math.floor(Date.now() / 1000) + refreshed.expires_in,
    // Some providers only issue a refresh token once; preserve the old one if not returned
    refreshToken: refreshed.refresh_token ?? token.refreshToken,
    error: undefined,
  };
}

const authConfig: NextAuthConfig = {
  debug: true,
  providers: [
    BattleNetProvider({
      clientId: process.env.BATTLENET_CLIENT_ID!,
      clientSecret: process.env.BATTLENET_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }: { token: JWT; account?: any; profile?: any }) {
      if (account) {
        // Initial sign-in: persist tokens and expiry from the account object
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at; // unix timestamp in seconds
        // Fetch WoW avatar on initial sign-in
        token.picture = await fetchWoWAvatarUrl(account.access_token);
      }
      if (profile?.battle_tag) {
        token.battletag = profile.battle_tag;
      }

      const ext = token as ExtendedJWT;

      // Token still valid — return as-is
      if (ext.expiresAt && Date.now() < ext.expiresAt * 1000) {
        return token;
      }

      // Token expired — attempt refresh
      if (!ext.refreshToken) {
        ext.error = "RefreshTokenError";
        return ext;
      }

      try {
        return await refreshBattleNetToken(ext);
      } catch {
        ext.error = "RefreshTokenError";
        return ext;
      }
    },
    session({ session, token }: { session: any; token: JWT }) {
      const gamerphileSession = session as GamerphileSession;
      const ext = token as ExtendedJWT;
      gamerphileSession.accessToken = ext.accessToken;
      gamerphileSession.error = ext.error;
      if (gamerphileSession.user) {
        gamerphileSession.user.battletag = ext.battletag as string | undefined;
        gamerphileSession.user.image = (ext.picture as string | undefined) ?? undefined;
      }
      return gamerphileSession;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
