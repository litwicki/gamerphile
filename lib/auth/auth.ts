import NextAuth from "next-auth";
import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import BattleNetProvider from "./battlenet-provider";

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

const authConfig: NextAuthConfig = {
  providers: [
    BattleNetProvider({
      clientId: process.env.BATTLENET_CLIENT_ID!,
      clientSecret: process.env.BATTLENET_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    jwt({ token, account, profile }: { token: JWT; account?: any; profile?: any }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile?.battletag) {
        token.battletag = profile.battletag;
      }
      return token;
    },
    session({ session, token }: { session: any; token: JWT }) {
      const gamerphileSession = session as GamerphileSession;
      gamerphileSession.accessToken = token.accessToken as string | undefined;
      if (gamerphileSession.user) {
        gamerphileSession.user.battletag = token.battletag as string | undefined;
      }
      return gamerphileSession;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
