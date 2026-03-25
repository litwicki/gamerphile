import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getPatreonAuthUrl } from "@/lib/auth/patreon";

/**
 * GET /api/auth/patreon/link
 *
 * Initiates the Patreon OAuth flow for account linking.
 * Requires the user to be authenticated via Battle.net first.
 */
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "You must be signed in to link a Patreon account." },
      { status: 401 }
    );
  }

  return NextResponse.redirect(getPatreonAuthUrl());
}
