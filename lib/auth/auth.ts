import NextAuth from "next-auth";
import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import BattleNetProvider from "./battlenet-provider";

// Extended JWT type with Battle.net fields
export interface ExtendedJWT extends JWT {
  accessToken?: string;
  battletag?: string;
  picture?: string | null;
}

// Extended session type with Battle.net fields
export interface GamerphileSession extends Session {
  accessToken?: string;
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
        token.accessToken = account.access_token;
        // Fetch WoW avatar on initial sign-in
        token.picture = await fetchWoWAvatarUrl(account.access_token);
      }
      if (profile?.battle_tag) {
        token.battletag = profile.battle_tag;
      }
      return token;
    },
    session({ session, token }: { session: any; token: JWT }) {
      const gamerphileSession = session as GamerphileSession;
      gamerphileSession.accessToken = token.accessToken as string | undefined;
      if (gamerphileSession.user) {
        gamerphileSession.user.battletag = token.battletag as string | undefined;
        gamerphileSession.user.image = (token.picture as string | undefined) ?? undefined;
      }
      return gamerphileSession;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
