import { NextRequest, NextResponse } from "next/server";

const VALID_REGIONS = new Set(["us", "eu", "tw", "cn"]);

function nameToSlug(s: string): string {
  return s.toLowerCase().replace(/'/g, "").replace(/\s+/g, "-");
}

export interface CharacterSearchResult {
  name: string;
  realm: { name: string; slug: string };
  playable_class: string;
  level: number;
  thumbnail_url?: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim() ?? "";
  const region = (searchParams.get("region") ?? "us").toLowerCase();
  const debug = searchParams.has("debug");

  if (q.length < 2) return NextResponse.json({ results: [] });
  if (!VALID_REGIONS.has(region)) {
    return NextResponse.json({ error: "Invalid region" }, { status: 400 });
  }

  const apiKey = process.env.RAIDERIO_API_KEY;
  const debugLog: Record<string, unknown> = { q, region };

  // Detect "name-realm" format
  const dashIdx = q.lastIndexOf("-");
  const isNameRealm = dashIdx > 0;
  const namePart = (isNameRealm ? q.slice(0, dashIdx) : q).trim();
  const realmPart = isNameRealm
    ? q.slice(dashIdx + 1).trim().toLowerCase().replace(/\s+/g, "-")
    : "";

  const results: CharacterSearchResult[] = [];
  const seen = new Set<string>();

  // ── Strategy 1: probe Raider.io search endpoints ──────────────────────────
  // Raider.io's website search works but the endpoint isn't documented.
  // Try the most likely candidates.
  const candidates = [
    `https://raider.io/api/v1/characters/search?region=${region}&name=${encodeURIComponent(namePart)}&fields=class%2Cthumbnail${apiKey ? `&access_key=${apiKey}` : ""}`,
    `https://raider.io/api/v1/search?term=${encodeURIComponent(namePart)}&region=${region}&type=characters${apiKey ? `&access_key=${apiKey}` : ""}`,
  ];

  debugLog.candidates = candidates;

  for (const endpoint of candidates) {
    try {
      const res = await fetch(endpoint, { signal: AbortSignal.timeout(5000) });
      const contentType = res.headers.get("content-type") ?? "";
      const isJson = contentType.includes("application/json");
      debugLog[endpoint] = { status: res.status, contentType, isJson };

      if (res.ok && isJson) {
        const data = await res.json();
        debugLog.searchRaw = data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const chars: any[] = Array.isArray(data) ? data : (data.characters ?? data.results ?? []);
        for (const char of chars) {
          if (!char.name) continue;
          const realmSlug = char.realm_slug ?? nameToSlug(char.realm ?? "");
          const key = `${(char.name as string).toLowerCase()}-${realmSlug}`;
          if (seen.has(key)) continue;
          seen.add(key);
          results.push({
            name: char.name as string,
            realm: { name: (char.realm as string) ?? realmSlug, slug: realmSlug },
            playable_class: (char.class as string) ?? "",
            level: (char.level as number) ?? 0,
            thumbnail_url: char.thumbnail_url as string | undefined,
          });
        }
        if (results.length > 0) break;
      }
    } catch (e) {
      debugLog[endpoint] = { error: e instanceof Error ? e.message : String(e) };
    }
  }

  // ── Strategy 2: Raider.io direct profile lookup for "name-realm" format ────
  // Falls back to the documented endpoint when Strategy 1 returns nothing.
  if (results.length === 0 && isNameRealm && namePart && realmPart) {
    const url = new URL("https://raider.io/api/v1/characters/profile");
    url.searchParams.set("region", region);
    url.searchParams.set("realm", realmPart);
    url.searchParams.set("name", namePart);
    url.searchParams.set("fields", "class,thumbnail");
    if (apiKey) url.searchParams.set("access_key", apiKey);

    debugLog.profileUrl = url.toString();

    try {
      const res = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) });
      debugLog.profileStatus = res.status;

      if (res.ok) {
        const char = await res.json();
        debugLog.profileRaw = char;
        if (char.name) {
          const realmSlug = nameToSlug((char.realm as string) ?? realmPart);
          const key = `${(char.name as string).toLowerCase()}-${realmSlug}`;
          if (!seen.has(key)) {
            results.push({
              name: char.name as string,
              realm: { name: (char.realm as string) ?? realmPart, slug: realmSlug },
              playable_class: (char.class as string) ?? "",
              level: 0,
              thumbnail_url: char.thumbnail_url as string | undefined,
            });
          }
        }
      } else {
        debugLog.profileBody = await res.text();
      }
    } catch (e) {
      debugLog.profileError = e instanceof Error ? e.message : String(e);
    }
  }

  const payload: Record<string, unknown> = { results: results.slice(0, 10) };
  if (debug) payload.debug = debugLog;
  return NextResponse.json(payload);
}
