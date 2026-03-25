import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { exchangePatreonCode, getPatreonIdentity } from "@/lib/auth/patreon";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/auth/patreon/callback
 *
 * Handles the Patreon OAuth callback after the user authorizes.
 * Exchanges the code for tokens, fetches the Patreon identity,
 * and stores the link in Supabase.
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(
      new URL("/signin?error=not_authenticated", request.url)
    );
  }

  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/account?error=patreon_denied", request.url)
    );
  }

  try {
    const tokens = await exchangePatreonCode(code);
    const patreonUser = await getPatreonIdentity(tokens.access_token);

    const supabase = await createClient();

    // Upsert the linked Patreon account
    const { error } = await supabase.from("linked_accounts").upsert(
      {
        user_id: session.user.id,
        provider: "patreon",
        provider_account_id: patreonUser.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
        provider_email: patreonUser.email,
        provider_name: patreonUser.full_name,
        provider_image: patreonUser.image_url,
      },
      { onConflict: "user_id,provider" }
    );

    if (error) {
      console.error("Failed to store Patreon link:", error);
      return NextResponse.redirect(
        new URL("/account?error=patreon_save_failed", request.url)
      );
    }

    return NextResponse.redirect(new URL("/account?patreon=linked", request.url));
  } catch (err) {
    console.error("Patreon callback error:", err);
    return NextResponse.redirect(
      new URL("/account?error=patreon_failed", request.url)
    );
  }
}
