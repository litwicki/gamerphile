/**
 * Patreon OAuth helpers for account linking (not login).
 *
 * Users authenticate via Battle.net, then optionally link their Patreon
 * account so we can check their subscription status.
 */

const PATREON_AUTH_URL = "https://www.patreon.com/oauth2/authorize";
const PATREON_TOKEN_URL = "https://www.patreon.com/api/oauth2/token";
const PATREON_IDENTITY_URL =
  "https://www.patreon.com/api/oauth2/v2/identity?fields%5Buser%5D=email,full_name,image_url,vanity";

export interface PatreonTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface PatreonUser {
  id: string;
  email: string | null;
  full_name: string | null;
  image_url: string | null;
  vanity: string | null;
}

/**
 * Build the Patreon authorization URL that the user is redirected to.
 */
export function getPatreonAuthUrl(): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.PATREON_CLIENT_ID!,
    redirect_uri: getRedirectUri(),
    scope: "identity identity[email]",
  });
  return `${PATREON_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange an authorization code for tokens.
 */
export async function exchangePatreonCode(
  code: string
): Promise<PatreonTokens> {
  const res = await fetch(PATREON_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      client_id: process.env.PATREON_CLIENT_ID!,
      client_secret: process.env.PATREON_CLIENT_SECRET!,
      redirect_uri: getRedirectUri(),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Patreon token exchange failed: ${res.status} ${text}`);
  }

  return res.json();
}

/**
 * Fetch the authenticated Patreon user's identity.
 */
export async function getPatreonIdentity(
  accessToken: string
): Promise<PatreonUser> {
  const res = await fetch(PATREON_IDENTITY_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Patreon identity fetch failed: ${res.status}`);
  }

  const json = await res.json();
  const attrs = json.data?.attributes ?? {};

  return {
    id: json.data?.id ?? "",
    email: attrs.email ?? null,
    full_name: attrs.full_name ?? null,
    image_url: attrs.image_url ?? null,
    vanity: attrs.vanity ?? null,
  };
}

function getRedirectUri(): string {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return `${base}/api/auth/patreon/callback`;
}
