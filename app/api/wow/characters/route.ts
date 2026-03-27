import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import type { GamerphileSession } from "@/lib/auth/auth";

export interface WoWCharacterSummary {
  name: string;
  id: number;
  realm: { name: string; slug: string; id: number };
  playable_class: { name: string; id: number };
  playable_race: { name: string; id: number };
  gender: { type: string; name: string };
  faction: { type: string; name: string };
  level: number;
  guild?: string;
}

export async function GET() {
  const session = (await auth()) as GamerphileSession | null;
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const region = process.env.WOW_API_REGION ?? "us";
  const locale = process.env.WOW_API_LOCALE ?? "en_US";

  /** Extract a string from a value that may be a localized object or a plain string */
  function locStr(val: unknown): string {
    if (typeof val === "string") return val;
    if (val && typeof val === "object") {
      const obj = val as Record<string, string>;
      return obj[locale] ?? obj["en_US"] ?? Object.values(obj)[0] ?? "Unknown";
    }
    return "Unknown";
  }

  try {
    // Fetch the user's WoW profile (all accounts + characters)
    const profileRes = await fetch(
      `https://${region}.api.blizzard.com/profile/user/wow?namespace=profile-${region}`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    );

    if (!profileRes.ok) {
      return NextResponse.json(
        { error: `WoW API returned ${profileRes.status}` },
        { status: 502 }
      );
    }

    const profile = await profileRes.json();

    // Flatten all characters across all WoW accounts
    const characters: WoWCharacterSummary[] = [];

    for (const account of profile.wow_accounts ?? []) {
      for (const char of account.characters ?? []) {
        characters.push({
          name: typeof char.name === "string" ? char.name : locStr(char.name),
          id: char.id,
          realm: {
            name: locStr(char.realm?.name),
            slug: char.realm?.slug ?? "unknown",
            id: char.realm?.id ?? 0,
          },
          playable_class: {
            name: locStr(char.playable_class?.name),
            id: char.playable_class?.id ?? 0,
          },
          playable_race: {
            name: locStr(char.playable_race?.name),
            id: char.playable_race?.id ?? 0,
          },
          gender: {
            type: char.gender?.type ?? "MALE",
            name: locStr(char.gender?.name),
          },
          faction: {
            type: char.faction?.type ?? "HORDE",
            name: locStr(char.faction?.name),
          },
          level: char.level ?? 0,
          guild: char.guild ? locStr(char.guild.name) : undefined,
        });
      }
    }

    // Sort by level descending by default
    characters.sort((a, b) => b.level - a.level);

    return NextResponse.json({ characters });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
