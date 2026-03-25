import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/account/linked
 *
 * Returns the linked accounts for the current user.
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("linked_accounts")
    .select(
      "provider, provider_account_id, provider_name, provider_email, provider_image"
    )
    .eq("user_id", session.user.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch linked accounts" },
      { status: 500 }
    );
  }

  return NextResponse.json({ accounts: data ?? [] });
}
