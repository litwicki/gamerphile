import { NextRequest, NextResponse } from "next/server";
import { WCLClient } from "@/lib/wcl/client";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get("name");
  const serverSlug = searchParams.get("serverSlug");
  const serverRegion = searchParams.get("serverRegion");

  if (!name || !serverSlug || !serverRegion) {
    const missing = [
      !name && "name",
      !serverSlug && "serverSlug",
      !serverRegion && "serverRegion",
    ].filter(Boolean);

    return NextResponse.json(
      { error: `Missing required parameter(s): ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const client = new WCLClient();

    const [zoneRankings, encounterRankings] = await Promise.all([
      client.getCharacterZoneRankings(name, serverSlug, serverRegion),
      client.getCharacterEncounterRankings(name, serverSlug, serverRegion),
    ]);

    return NextResponse.json({ zoneRankings, encounterRankings });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
