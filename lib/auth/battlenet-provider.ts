import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers";

export interface BattleNetProfile {
  sub: string;
  id: number;
  battletag: string;
}

export default function BattleNetProvider(
  config: OAuthUserConfig<BattleNetProfile>
): OAuthConfig<BattleNetProfile> {
  return {
    id: "battlenet",
    name: "Battle.net",
    type: "oidc",
    issuer: "https://oauth.battle.net",
    authorization: {
      params: {
        scope: "openid wow.profile",
      },
    },
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.battletag,
        email: null,
        image: null,
      };
    },
    ...config,
  };
}
