import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://raider.io";

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapGearItem(item: any) {
  if (!item) return null;
  return {
    item_id: item.item_id ?? 0,
    item_level: item.item_level ?? 0,
    name: item.name ?? "",
    icon: item.icon ?? "",
    item_quality: item.item_quality ?? 0,
    tier: item.tier ?? null,
    enchants_detail: (item.enchants_detail ?? []).map((e: any) => ({
      name: e.name ?? "",
    })),
    gems_detail: (item.gems_detail ?? []).map((g: any) => ({
      name: g.name ?? "",
    })),
  };
}

function mapRosterMember(p: any) {
  const char = p.character ?? {};
  const items = p.items ?? {};
  const gearSlots = items.items ?? {};
  const talent = char.talentLoadout ?? {};

  return {
    character: {
      id: char.id ?? 0,
      name: char.name ?? "Unknown",
      realm: char.realm ?? { slug: "" },
      region: char.region ?? { slug: "" },
      class: char.class ?? { name: "Unknown", slug: "unknown" },
      spec: char.spec ?? undefined,
    },
    role: p.role ?? "dps",
    itemLevel: items.item_level_equipped ?? null,
    ranks: p.ranks ?? null,
    talentLoadoutText: talent.loadoutText ?? null,
    gear: {
      head: mapGearItem(gearSlots.head),
      neck: mapGearItem(gearSlots.neck),
      shoulder: mapGearItem(gearSlots.shoulder),
      back: mapGearItem(gearSlots.back),
      chest: mapGearItem(gearSlots.chest),
      waist: mapGearItem(gearSlots.waist),
      wrist: mapGearItem(gearSlots.wrist),
      hands: mapGearItem(gearSlots.hands),
      legs: mapGearItem(gearSlots.legs),
      feet: mapGearItem(gearSlots.feet),
      finger1: mapGearItem(gearSlots.finger1),
      finger2: mapGearItem(gearSlots.finger2),
      trinket1: mapGearItem(gearSlots.trinket1),
      trinket2: mapGearItem(gearSlots.trinket2),
      mainhand: mapGearItem(gearSlots.mainhand),
      offhand: mapGearItem(gearSlots.offhand),
    },
  };
}

async function fetchThumbnail(
  region: string,
  realm: string,
  name: string,
  apiKey: string | undefined,
): Promise<string | null> {
  try {
    const url = new URL("/api/v1/characters/profile", BASE_URL);
    url.searchParams.set("region", region);
    url.searchParams.set("realm", realm);
    url.searchParams.set("name", name);
    if (apiKey) url.searchParams.set("access_key", apiKey);
    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.thumbnail_url as string) ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const season = searchParams.get("season");
  const id = searchParams.get("id");

  if (!season || !id) {
    return NextResponse.json(
      { error: "Missing required parameter(s): season, id" },
      { status: 400 }
    );
  }

  try {
    const apiKey = process.env.RAIDERIO_API_KEY;

    const url = new URL("/api/v1/mythic-plus/run-details", BASE_URL);
    url.searchParams.set("season", season);
    url.searchParams.set("id", id);
    if (apiKey) url.searchParams.set("access_key", apiKey);

    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: `RaiderIO API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const rawRoster = (data.roster ?? []).map(mapRosterMember);

    // Fetch thumbnails in parallel for all roster members
    const thumbnails = await Promise.all(
      rawRoster.map((p: any) =>
        fetchThumbnail(
          p.character.region?.slug ?? "",
          p.character.realm?.slug ?? "",
          p.character.name ?? "",
          apiKey,
        ),
      ),
    );

    const roster = rawRoster.map((p: any, i: number) => ({
      ...p,
      thumbnailUrl: thumbnails[i],
    }));

    return NextResponse.json({ roster });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
