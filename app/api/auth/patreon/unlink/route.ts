import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/patreon/unlink
 *
 * Removes the linked Patreon account for the current user.
 */
export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("linked_accounts")
    .delete()
    .eq("user_id", session.user.id)
    .eq("provider", "patreon");

  if (error) {
    return NextResponse.json(
      { error: "Failed to unlink Patreon account" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
