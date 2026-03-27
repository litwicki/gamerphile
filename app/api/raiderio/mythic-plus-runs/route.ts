import { NextRequest, NextResponse } from "next/server";
import { getMythicPlusRuns } from "@/lib/raiderio/client";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const season = sp.get("season") ?? process.env.NEXT_PUBLIC_WOW_MPLUS_SEASON ?? "season-mn-1";
  const region = sp.get("region") ?? "world";
  const dungeon = sp.get("dungeon") ?? undefined;
  const page = Number(sp.get("page") ?? 0);

  try {
    const data = await getMythicPlusRuns({ season, region, dungeon, page });
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
