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

  if (!process.env.WCL_CLIENT_ID || !process.env.WCL_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "WCL API credentials not configured" },
      { status: 503 }
    );
  }

  try {
    const client = new WCLClient();
    const difficulty = searchParams.get("difficulty")
      ? Number(searchParams.get("difficulty"))
      : undefined;

    const [zoneRankings, encounterRankings] = await Promise.all([
      client.getCharacterZoneRankings(name, serverSlug, serverRegion, undefined, difficulty),
      client.getCharacterEncounterRankings(name, serverSlug, serverRegion, undefined, difficulty),
    ]);

    return NextResponse.json({ zoneRankings, encounterRankings });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
