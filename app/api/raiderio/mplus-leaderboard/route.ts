import { NextRequest, NextResponse } from "next/server";

interface LeaderboardCharacter {
  name: string;
  realm_slug: string;
  realm_name: string;
  region: string;
  class_name: string;
  spec_name: string;
  score: number;
  mythic_level: number;
  thumbnail_url: string | null;
  profile_url: string;
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const region = sp.get("region") ?? "world";
  const season = sp.get("season") ?? process.env.NEXT_PUBLIC_WOW_MPLUS_SEASON ?? "season-mn-1";
  const limit = Math.min(Number(sp.get("limit") ?? 30), 50);
  const rioKey = process.env.RAIDERIO_API_KEY;
  const keyParam = rioKey ? `&access_key=${rioKey}` : "";

  try {
    // Fetch enough pages of top runs to get unique characters
    const pages = Math.ceil(limit / 10);
    const allRankings: Array<{ score: number; run: Record<string, unknown> }> = [];

    for (let page = 0; page < pages; page++) {
      const res = await fetch(
        `https://raider.io/api/v1/mythic-plus/runs?season=${season}&region=${region}&page=${page}${keyParam}`,
        { next: { revalidate: 300 } }
      );
      if (!res.ok) break;
      const data = await res.json();
      allRankings.push(...(data.rankings ?? []));
    }

    // Extract unique characters from top runs
    const seen = new Set<string>();
    const characters: LeaderboardCharacter[] = [];

    for (const ranking of allRankings) {
      const run = ranking.run as {
        mythic_level: number;
        roster: Array<{
          character: {
            name: string;
            realm: { slug: string; name?: string };
            region: { slug: string };
            class: { name: string };
            spec?: { name: string };
            path?: string;
          };
          role: string;
        }>;
      };

      for (const member of run.roster ?? []) {
        const c = member.character;
        const key = `${c.region?.slug}-${c.realm?.slug}-${c.name}`.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        characters.push({
          name: c.name,
          realm_slug: c.realm?.slug ?? "",
          realm_name: c.realm?.name ?? c.realm?.slug ?? "",
          region: c.region?.slug ?? region,
          class_name: c.class?.name ?? "Unknown",
          spec_name: c.spec?.name ?? "",
          score: ranking.score,
          mythic_level: run.mythic_level,
          thumbnail_url: null,
          profile_url: `https://raider.io${c.path ?? ""}`,
        });

        if (characters.length >= limit) break;
      }
      if (characters.length >= limit) break;
    }

    // Fetch thumbnails from Raider.IO character profiles in parallel batches
    for (let i = 0; i < characters.length; i += 10) {
      const batch = characters.slice(i, i + 10);
      await Promise.all(
        batch.map(async (char) => {
          try {
            const url = `https://raider.io/api/v1/characters/profile?region=${char.region}&realm=${char.realm_slug}&name=${encodeURIComponent(char.name)}${keyParam}`;
            const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
            if (!res.ok) return;
            const data = await res.json();
            char.thumbnail_url = data.thumbnail_url ?? null;
          } catch {
            // skip failures
          }
        })
      );
    }

    return NextResponse.json({ characters });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
