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
  avatar_url?: string;
  inset_url?: string;
  item_level?: number;
  mplus_rating?: number;
  raid_progression?: string;
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

    // Fetch character media in parallel (avatar + inset images)
    const accessToken = session.accessToken;
    await Promise.all(
      characters.map(async (char) => {
        try {
          const name = char.name.toLowerCase();
          const realm = char.realm.slug;
          const res = await fetch(
            `https://${region}.api.blizzard.com/profile/wow/character/${realm}/${encodeURIComponent(name)}/character-media?namespace=profile-${region}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (!res.ok) return;
          const media = await res.json();
          const assets = media.assets as { key: string; value: string }[] | undefined;
          char.avatar_url = assets?.find((a) => a.key === "avatar")?.value;
          char.inset_url = assets?.find((a) => a.key === "inset")?.value;
        } catch {
          // silently skip media fetch failures
        }
      })
    );

    // Enrich max-level characters with Raider.IO data (ilvl, M+ rating, raid prog)
    const maxLevel = Math.max(...characters.map((c) => c.level), 0);
    const enrichTargets = characters.filter((c) => c.level >= maxLevel - 1);
    const rioApiKey = process.env.RAIDERIO_API_KEY;
    const rioKeyParam = rioApiKey ? `&access_key=${rioApiKey}` : "";

    // Batch in groups of 10 to respect rate limits
    for (let i = 0; i < enrichTargets.length; i += 10) {
      const batch = enrichTargets.slice(i, i + 10);
      await Promise.all(
        batch.map(async (char) => {
          try {
            const res = await fetch(
              `https://raider.io/api/v1/characters/profile?region=${region}&realm=${char.realm.slug}&name=${encodeURIComponent(char.name)}&fields=gear,mythic_plus_scores_by_season:current,raid_progression${rioKeyParam}`,
              { signal: AbortSignal.timeout(5000) }
            );
            if (!res.ok) return;
            const data = await res.json();
            char.item_level = data.gear?.item_level_equipped ?? undefined;
            const scores = data.mythic_plus_scores_by_season?.[0]?.scores;
            char.mplus_rating = scores?.all ?? undefined;
            // Get the most recent raid progression summary
            const raidProg = data.raid_progression;
            if (raidProg && typeof raidProg === "object") {
              const entries = Object.values(raidProg) as { summary?: string }[];
              const best = entries.find((e) => e.summary && e.summary.length > 0);
              char.raid_progression = best?.summary ?? undefined;
            }
          } catch {
            // silently skip Raider.IO failures
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
