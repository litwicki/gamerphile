import type { OIDCConfig, OIDCUserConfig } from "next-auth/providers";

export interface BattleNetProfile {
  sub: string;
  id: number;
  battle_tag: string;
}

export default function BattleNetProvider(
  config: OIDCUserConfig<BattleNetProfile>
): OIDCConfig<BattleNetProfile> {
  return {
    id: "battlenet",
    name: "Battle.net",
    type: "oidc",
    issuer: "https://oauth.battle.net",
    checks: ["nonce", "state"],
    authorization: {
      params: {
        scope: "openid wow.profile",
      },
    },
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.battle_tag,
        email: null,
        image: null,
      };
    },
    ...config,
  };
}
