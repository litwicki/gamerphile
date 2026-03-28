import Link from "next/link";
import { notFound } from "next/navigation";
import { WoWApiClient } from "@/lib/wow-api";
import type { WoWRegion } from "@/lib/wow-api";
import { getCharacterProfile } from "@/lib/raiderio/client";
import type { EnrichedCharacterProfile } from "@/lib/raiderio/types";
import { CharacterTheme } from "./character-theme";

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

function msToTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface Props {
  params: Promise<{ realm: string; region: string; characterName: string }>;
}

const card = "rounded-lg border border-border bg-card/60 shadow-md shadow-black/30";

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

  const [profileResult, mediaResult, rioResult] = await Promise.allSettled([
    client.getCharacterProfile(realm, characterName),
    client.getCharacterMedia(realm, characterName),
    getCharacterProfile({
      region,
      realm,
      name: characterName,
      fields:
        "gear,raid_progression,mythic_plus_scores_by_season:current,mythic_plus_best_runs:all",
    }),
  ]);

  const profileData =
    profileResult.status === "fulfilled" ? profileResult.value : null;
  const mediaData =
    mediaResult.status === "fulfilled" ? mediaResult.value : null;
  const rio =
    rioResult.status === "fulfilled"
      ? (rioResult.value as EnrichedCharacterProfile)
      : null;

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
  const avatarUrl = assets.find((a) => a.key === "avatar")?.value;
  const insetUrl = assets.find((a) => a.key === "inset")?.value;

  const className = profile.character_class.name;
  const classColor = CLASS_COLORS[className] ?? "text-foreground";
  const classCssTheme = CLASS_THEMES[className] ?? "theme-midnight";
  const currentSeason = rio?.mythic_plus_scores_by_season?.[0];
  const mplusScore = currentSeason?.scores.all ?? 0;
  const gear = rio?.gear;
  const raidProg = rio?.raid_progression;
  const latestRaid = raidProg ? Object.values(raidProg)[0] : null;
  const bestRuns = rio?.mythic_plus_best_runs?.slice(0, 6) ?? [];

  return (
    <>
      <CharacterTheme cssClass={classCssTheme} />
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">

        {/* Hero */}
        <div className={`relative overflow-hidden rounded-xl ${card}`}>
          {insetUrl && (
            <img
              src={insetUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-15"
            />
          )}
          <div className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-end">
            <div className={`h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-border bg-muted shadow-lg`}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
                  {profile.name[0]}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <h1 className={`text-4xl font-bold ${classColor}`}>
                {profile.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {rio?.active_spec_name ? `${rio.active_spec_name} ` : ""}
                {profile.race.name} {className}
              </p>
              <p className="text-sm text-muted-foreground">
                Level {profile.level} &bull; {profile.realm.name} &bull;{" "}
                <span className="uppercase">{region}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {gear && (
            <div className={`${card} px-4 py-3 text-center`}>
              <div className="font-mono text-2xl font-bold text-muted-foreground">
                {gear.item_level_equipped}
              </div>
              <div className="text-xs text-muted-foreground/60">Item Level</div>
            </div>
          )}
          {mplusScore > 0 && (
            <div className={`${card} px-4 py-3 text-center`}>
              <div className="font-mono text-2xl font-bold text-muted-foreground">
                {Math.round(mplusScore)}
              </div>
              <div className="text-xs text-muted-foreground/60">M+ Score</div>
            </div>
          )}
          {latestRaid && (
            <div className={`${card} px-4 py-3 text-center`}>
              <div className="font-mono text-2xl font-bold text-muted-foreground">
                {latestRaid.summary}
              </div>
              <div className="text-xs text-muted-foreground/60">Raid Prog</div>
            </div>
          )}
          <div className={`${card} px-4 py-3 text-center`}>
            <div className="font-mono text-2xl font-bold text-muted-foreground">
              {profile.achievement_points.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground/60">Achievements</div>
          </div>
        </div>

        {/* M+ Best Runs */}
        {bestRuns.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-lg font-semibold text-muted-foreground">Mythic+ Best Runs</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {bestRuns.map((run, i) => (
                <a
                  key={i}
                  href={run.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 ${card} px-3 py-2 transition-colors hover:bg-accent/30`}
                >
                  <span className="font-mono text-lg font-bold text-primary">
                    +{run.mythic_level}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-muted-foreground">
                      {run.dungeon}
                    </div>
                    <div className="text-xs text-muted-foreground/60">
                      {msToTime(run.clear_time_ms)}
                      {run.num_keystone_upgrades > 0 &&
                        ` · +${run.num_keystone_upgrades}`}
                    </div>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground/60">
                    {Math.round(run.score)}
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Raid Progression */}
        {raidProg && Object.keys(raidProg).length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-lg font-semibold text-muted-foreground">Raid Progression</h2>
            <div className="flex flex-col gap-2">
              {Object.entries(raidProg).map(([slug, prog]) => (
                <div
                  key={slug}
                  className={`flex items-center justify-between ${card} px-4 py-3`}
                >
                  <span className="text-sm capitalize text-muted-foreground">
                    {slug.replace(/-/g, " ")}
                  </span>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
                    <span>N: {prog.normal_bosses_killed}/{prog.total_bosses}</span>
                    <span>H: {prog.heroic_bosses_killed}/{prog.total_bosses}</span>
                    <span className="font-mono font-semibold text-muted-foreground">
                      {prog.summary}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
