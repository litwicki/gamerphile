import { NextRequest, NextResponse } from "next/server";
import { getRaidingStaticData } from "@/lib/raiderio/client";

export async function GET(request: NextRequest) {
  const raid = request.nextUrl.searchParams.get("raid") ?? process.env.NEXT_PUBLIC_WOW_RAID ?? "tier-mn-1";
  // Expansion 10 = The War Within, 11 = Midnight
  const expansionId = Number(request.nextUrl.searchParams.get("expansion_id") ?? 11);

  try {
    const data = await getRaidingStaticData(expansionId);
    const match = data.raids.find((r) => r.slug === raid);
    if (!match) {
      // Try previous expansion
      const fallback = await getRaidingStaticData(10);
      const fallbackMatch = fallback.raids.find((r) => r.slug === raid);
      if (!fallbackMatch) {
        return NextResponse.json({ error: "Raid not found" }, { status: 404 });
      }
      return NextResponse.json({
        slug: fallbackMatch.slug,
        name: fallbackMatch.name,
        encounterCount: fallbackMatch.encounters.length,
        encounters: fallbackMatch.encounters,
      });
    }
    return NextResponse.json({
      slug: match.slug,
      name: match.name,
      encounterCount: match.encounters.length,
      encounters: match.encounters,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
