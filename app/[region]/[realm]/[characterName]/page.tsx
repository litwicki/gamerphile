import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WoWApiClient } from "@/lib/wow-api";
import type { WoWRegion } from "@/lib/wow-api";
import { getCharacterProfile } from "@/lib/raiderio/client";
import type { EnrichedCharacterProfile } from "@/lib/raiderio/types";
import { getScoreTiers, resolveScoreColor } from "@/lib/raiderio/score-colors";
import { CharacterTheme } from "./character-theme";
import { HeroSection } from "./hero-section";
import { BentoGrid } from "./bento-grid";
import { RaidHistoryTable } from "./raid-history-table";
import { MPlusHistoryTable } from "./mplus-history-table";
import { UserInterfacePlaceholder } from "./user-placeholder";

const VALID_REGIONS: ReadonlySet<string> = new Set(["us", "eu", "kr", "tw"]);
const PARAM_PATTERN = /^[a-zA-Z0-9\- ]+$/;

const CLASS_COLORS: Record<string, string> = {
  "Death Knight": "text-death-knight",
  "Demon Hunter": "text-demon-hunter",
  Druid: "text-druid",
  Evoker: "text-evoker",
  Hunter: "text-hunter",
  Mage: "text-mage",
  Monk: "text-monk",
  Paladin: "text-paladin",
  Priest: "text-priest",
  Rogue: "text-rogue",
  Shaman: "text-shaman",
  Warlock: "text-warlock",
  Warrior: "text-warrior",
};

const CLASS_THEMES: Record<string, string> = {
  "Death Knight": "theme-death-knight",
  "Demon Hunter": "theme-demon-hunter",
  Druid: "theme-druid",
  Evoker: "theme-evoker",
  Hunter: "theme-hunter",
  Mage: "theme-mage",
  Monk: "theme-monk",
  Paladin: "theme-paladin",
  Priest: "theme-priest",
  Rogue: "theme-rogue",
  Shaman: "theme-shaman",
  Warlock: "theme-warlock",
  Warrior: "theme-warrior",
};


interface Props {
  params: Promise<{ realm: string; region: string; characterName: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { realm, region, characterName } = await params;

  if (
    !VALID_REGIONS.has(region) ||
    !realm ||
    !characterName ||
    !PARAM_PATTERN.test(realm) ||
    !PARAM_PATTERN.test(characterName)
  ) {
    return {};
  }

  const client = new WoWApiClient({
    clientId: process.env.BATTLENET_CLIENT_ID ?? "",
    clientSecret: process.env.BATTLENET_CLIENT_SECRET ?? "",
    region: region as WoWRegion,
  });

  const [profileResult, mediaResult] = await Promise.allSettled([
    client.getCharacterProfile(realm, characterName),
    client.getCharacterMedia(realm, characterName),
  ]);

  const profileData =
    profileResult.status === "fulfilled" ? profileResult.value : null;

  if (!profileData?.ok) {
    return {};
  }

  const profile = profileData.data;
  const regionUpper = region.toUpperCase();
  const title = `${profile.name} - ${profile.realm.name} (${regionUpper}) | Gamerphile`;
  const description = `Level ${profile.level} ${profile.race.name} ${profile.character_class.name} on ${profile.realm.name} (${regionUpper})`;

  const mediaData =
    mediaResult.status === "fulfilled" ? mediaResult.value : null;
  const mainRawUrl = mediaData?.ok
    ? mediaData.data.assets.find((a) => a.key === "main-raw")?.value
    : undefined;

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      siteName: "Gamerphile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };

  if (mainRawUrl) {
    metadata.openGraph!.images = [
      {
        url: mainRawUrl,
        width: 1024,
        height: 1024,
        alt: `${profile.name} character render`,
      },
    ];
    metadata.twitter!.images = [mainRawUrl];
  }

  return metadata;
}

export default async function CharacterDetailPage({ params }: Props) {
  const { realm, region, characterName } = await params;

  if (
    !VALID_REGIONS.has(region) ||
    !realm ||
    !characterName ||
    !PARAM_PATTERN.test(realm) ||
    !PARAM_PATTERN.test(characterName)
  ) {
    notFound();
  }

  const client = new WoWApiClient({
    clientId: process.env.BATTLENET_CLIENT_ID ?? "",
    clientSecret: process.env.BATTLENET_CLIENT_SECRET ?? "",
    region: region as WoWRegion,
  });

  const [profileResult, mediaResult, rioResult, scoreTiersResult] = await Promise.allSettled([
    client.getCharacterProfile(realm, characterName),
    client.getCharacterMedia(realm, characterName),
    getCharacterProfile({
      region,
      realm,
      name: characterName,
      fields:
        "gear,raid_progression,mythic_plus_ranks,mythic_plus_scores_by_season:current,mythic_plus_best_runs:all",
    }),
    getScoreTiers(),
  ]);

  const profileData =
    profileResult.status === "fulfilled" ? profileResult.value : null;
  const mediaData =
    mediaResult.status === "fulfilled" ? mediaResult.value : null;
  const rio =
    rioResult.status === "fulfilled"
      ? (rioResult.value as EnrichedCharacterProfile)
      : null;
  const scoreTiers =
    scoreTiersResult.status === "fulfilled" ? scoreTiersResult.value : [];

  if (!profileData?.ok) {
    if (!profileData || profileData.error.status === 404) notFound();
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-24">
        <h1 className="text-2xl font-bold text-destructive">Error</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Failed to load character: {profileData.error.message}
        </p>
        <Link
          href="/characters"
          className="mt-6 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Back to Characters
        </Link>
      </div>
    );
  }

  const profile = profileData.data;
  const assets = mediaData?.ok ? mediaData.data.assets : [];
  const mainRawUrl = assets.find((a) => a.key === "main-raw")?.value;

  const className = profile.character_class.name;
  const classColor = CLASS_COLORS[className] ?? "text-foreground";
  const classCssTheme = CLASS_THEMES[className] ?? "theme-midnight";

  const mplusScore = rio?.mythic_plus_scores_by_season?.[0]?.scores.all ?? 0;
  const scoreColor = resolveScoreColor(mplusScore, scoreTiers);
  const mplusRanks = rio?.mythic_plus_ranks;
  const specScores = rio?.mythic_plus_scores_by_season_specs;
  const raidProg = rio?.raid_progression;
  const raidSummary = raidProg
    ? Object.values(raidProg)[0]?.summary
    : undefined;
  const bestRuns = rio?.mythic_plus_best_runs ?? [];
  const highestRun = bestRuns.length > 0
    ? bestRuns.reduce((best, run) =>
        run.mythic_level > best.mythic_level ? run : best
      )
    : undefined;

  return (
    <>
      <CharacterTheme cssClass={classCssTheme} />

      <HeroSection
        mainRawUrl={mainRawUrl}
        classTheme={classCssTheme}
        name={profile.name}
        specName={rio?.active_spec_name}
        raceName={profile.race.name}
        className={className}
        level={profile.level}
        realmName={profile.realm.name}
        region={region}
        classColor={classColor}
      />

      <BentoGrid
        raidSummary={raidSummary}
        raidProgression={raidProg}
        regionRank={undefined}
        worldRank={undefined}
        mplusScore={mplusScore}
        highestRun={
          highestRun
            ? { dungeon: highestRun.dungeon, level: highestRun.mythic_level }
            : undefined
        }
        scoreColor={scoreColor}
        ranks={mplusRanks}
        specScores={specScores}
        scoreTiers={scoreTiers}
        hasTwitchIntegration={false}
        characterName={characterName}
        serverSlug={realm}
        serverRegion={region}
      />

      <div className="mx-auto mt-8 w-full max-w-[var(--max-viewport)] px-4 sm:px-6">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <RaidHistoryTable raidProgression={raidProg} />
          <MPlusHistoryTable bestRuns={bestRuns} scoreTiers={scoreTiers} />
          <UserInterfacePlaceholder />
        </div>

        <Link
          href="/characters"
          className="mt-8 inline-block text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to Characters
        </Link>
      </div>
    </>
  );
}