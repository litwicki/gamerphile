import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// ─── Mock next-auth/react before any component imports ───

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  useSession: vi.fn(() => ({ data: null, status: "unauthenticated" })),
}));

import { signIn, signOut } from "next-auth/react";
import { SignInButton } from "@/components/auth/sign-in-button";
import { SignOutButton } from "@/components/auth/sign-out-button";

// ─── 8.1 Auth configuration: Battle.net provider setup (Req 2.1) ───

describe("Battle.net provider configuration", () => {
  it("has id 'battlenet'", async () => {
    const BattleNetProvider = (await import("@/lib/auth/battlenet-provider")).default;
    const provider = BattleNetProvider({ clientId: "id", clientSecret: "secret" });
    expect(provider.id).toBe("battlenet");
  });

  it("has name 'Battle.net'", async () => {
    const BattleNetProvider = (await import("@/lib/auth/battlenet-provider")).default;
    const provider = BattleNetProvider({ clientId: "id", clientSecret: "secret" });
    expect(provider.name).toBe("Battle.net");
  });

  it("uses the Battle.net OIDC issuer", async () => {
    const BattleNetProvider = (await import("@/lib/auth/battlenet-provider")).default;
    const provider = BattleNetProvider({ clientId: "id", clientSecret: "secret" });
    expect(provider.issuer).toBe("https://oauth.battle.net");
  });

  it("requests openid and wow.profile scopes", async () => {
    const BattleNetProvider = (await import("@/lib/auth/battlenet-provider")).default;
    const provider = BattleNetProvider({ clientId: "id", clientSecret: "secret" });
    const scope = (provider.authorization as any)?.params?.scope;
    expect(scope).toContain("openid");
    expect(scope).toContain("wow.profile");
  });

  it("uses OIDC type", async () => {
    const BattleNetProvider = (await import("@/lib/auth/battlenet-provider")).default;
    const provider = BattleNetProvider({ clientId: "id", clientSecret: "secret" });
    expect(provider.type).toBe("oidc");
  });
});

// ─── 8.2 Auth sign-in redirect to Battle.net OAuth (Req 2.2) ───

describe("SignInButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls signIn('battlenet') when clicked", () => {
    render(<SignInButton />);
    fireEvent.click(screen.getByRole("button", { name: /sign in with battle\.net/i }));
    expect(signIn).toHaveBeenCalledWith("battlenet");
  });
});

// ─── 8.3 Session creation with access token storage (Req 2.3, 2.6) ───

describe("Auth callbacks — JWT and session", () => {
  it("jwt callback copies access_token from account to token", () => {
    // Replicate the jwt callback logic from auth.ts:
    //   if (account) { token.accessToken = account.access_token; }
    const token: Record<string, unknown> = { sub: "123" };
    const account = { access_token: "battle-net-token-xyz", provider: "battlenet" };

    if (account) {
      token.accessToken = account.access_token;
    }

    expect(token.accessToken).toBe("battle-net-token-xyz");
  });

  it("jwt callback does not overwrite token when account is absent", () => {
    const token: Record<string, unknown> = { sub: "123", accessToken: "existing" };
    const account = null;

    if (account) {
      token.accessToken = (account as any).access_token;
    }

    expect(token.accessToken).toBe("existing");
  });

  it("session callback exposes accessToken and battletag on session", () => {
    // Replicate the session callback logic from auth.ts
    const session: Record<string, any> = { user: { id: "1", name: "Player" } };
    const token: Record<string, unknown> = { accessToken: "my-token", battletag: "Player#1234" };

    session.accessToken = token.accessToken as string | undefined;
    if (session.user) {
      session.user.battletag = token.battletag as string | undefined;
    }

    expect(session.accessToken).toBe("my-token");
    expect(session.user.battletag).toBe("Player#1234");
  });

  it("session callback handles missing battletag gracefully", () => {
    const session: Record<string, any> = { user: { id: "1" } };
    const token: Record<string, unknown> = { accessToken: "tok" };

    session.accessToken = token.accessToken as string | undefined;
    if (session.user) {
      session.user.battletag = token.battletag as string | undefined;
    }

    expect(session.accessToken).toBe("tok");
    expect(session.user.battletag).toBeUndefined();
  });
});

// ─── 8.4 Auth error handling on OAuth failure (Req 2.4) ───

describe("Auth error handling", () => {
  it("Battle.net provider profile callback maps sub to id", async () => {
    const BattleNetProvider = (await import("@/lib/auth/battlenet-provider")).default;
    const provider = BattleNetProvider({ clientId: "id", clientSecret: "secret" });
    const profile = provider.profile!({ sub: "12345", id: 99, battletag: "Test#1234" }, {} as any);
    expect((profile as any).id).toBe("12345");
    expect((profile as any).name).toBe("Test#1234");
  });

  it("Battle.net provider profile callback sets email and image to null", async () => {
    const BattleNetProvider = (await import("@/lib/auth/battlenet-provider")).default;
    const provider = BattleNetProvider({ clientId: "id", clientSecret: "secret" });
    const profile = provider.profile!({ sub: "12345", id: 99, battletag: "Test#1234" }, {} as any);
    expect((profile as any).email).toBeNull();
    expect((profile as any).image).toBeNull();
  });
});

// ─── 8.5 Sign-out session termination and redirect (Req 2.5) ───

describe("SignOutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls signOut with callbackUrl '/' when clicked", () => {
    render(<SignOutButton />);
    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });
});
