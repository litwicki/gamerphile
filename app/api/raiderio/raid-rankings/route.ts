import { NextRequest, NextResponse } from "next/server";
import { getRaidRankings } from "@/lib/raiderio/client";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const raid = sp.get("raid") ?? "liberation-of-undermine";
  const difficulty = sp.get("difficulty") ?? "mythic";
  const region = sp.get("region") ?? "world";
  const limit = Number(sp.get("limit") ?? 10);
  const page = Number(sp.get("page") ?? 0);

  try {
    const data = await getRaidRankings({ raid, difficulty, region, limit, page });
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
