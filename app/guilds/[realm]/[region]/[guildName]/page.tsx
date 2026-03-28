import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuildProfile } from "@/lib/raiderio/client";

const VALID_REGIONS: ReadonlySet<string> = new Set(["us", "eu", "kr", "tw"]);
const PARAM_PATTERN = /^[a-zA-Z0-9\- ']+$/;

const FACTION_COLORS: Record<string, string> = {
  alliance: "text-blue-400",
  horde: "text-red-500",
};

interface Props {
  params: Promise<{ realm: string; region: string; guildName: string }>;
}

export default async function GuildPage({ params }: Props) {
  const { realm, region, guildName } = await params;

  if (
    !VALID_REGIONS.has(region) ||
    !realm ||
    !guildName ||
    !PARAM_PATTERN.test(realm) ||
    !PARAM_PATTERN.test(guildName)
  ) {
    notFound();
  }

  let guild;
  try {
    guild = await getGuildProfile({
      region,
      realm,
      name: guildName,
      fields: "raid_progression,raid_rankings",
    });
  } catch {
    notFound();
  }

  const factionSlug = guild.faction.toLowerCase();
  const factionColor = FACTION_COLORS[factionSlug] ?? "text-foreground";

  const raidProg = guild.raid_progression ?? {};
  const raidRankings = guild.raid_rankings ?? {};
  const raidEntries = Object.entries(raidProg);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      {/* Hero */}
      <div className="flex flex-col gap-4 rounded-xl border border-border/50 bg-card/60 p-6 sm:flex-row sm:items-center">
        {guild.logo && (
          <img
            src={guild.logo}
            alt={guild.name}
            className="h-20 w-20 shrink-0 rounded-lg object-contain"
          />
        )}
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold">{guild.name}</h1>
          <p className={`text-sm font-medium capitalize ${factionColor}`}>
            {guild.faction}
          </p>
          <p className="text-sm text-muted-foreground">
            {guild.realm.name} &bull;{" "}
            <span className="uppercase">{guild.region.short_name}</span>
          </p>
          {guild.profile_url && (
            <a
              href={guild.profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 text-xs text-muted-foreground hover:underline"
            >
              View on Raider.IO &rarr;
            </a>
          )}
        </div>
      </div>

      {/* Raid Progression */}
      {raidEntries.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Raid Progression</h2>
          <div className="flex flex-col gap-3">
            {raidEntries.map(([slug, prog]) => {
              const rankings = raidRankings[slug];
              return (
                <div
                  key={slug}
                  className="rounded-xl border border-border/50 bg-card/60 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {slug.replace(/-/g, " ")}
                      </p>
                      <p className="mt-0.5 font-mono text-2xl font-bold">
                        {prog.summary}
                      </p>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>
                        N&nbsp;{prog.normal_bosses_killed}/{prog.total_bosses}
                      </span>
                      <span>
                        H&nbsp;{prog.heroic_bosses_killed}/{prog.total_bosses}
                      </span>
                      <span>
                        M&nbsp;{prog.mythic_bosses_killed}/{prog.total_bosses}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar (mythic) */}
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${(prog.mythic_bosses_killed / Math.max(prog.total_bosses, 1)) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Rankings */}
                  {rankings?.mythic && (
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span>
                        World{" "}
                        <span className="font-mono font-semibold text-foreground">
                          #{rankings.mythic.world}
                        </span>
                      </span>
                      <span>
                        Region{" "}
                        <span className="font-mono font-semibold text-foreground">
                          #{rankings.mythic.region}
                        </span>
                      </span>
                      <span>
                        Realm{" "}
                        <span className="font-mono font-semibold text-foreground">
                          #{rankings.mythic.realm}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <Link
        href="/"
        className="mt-8 inline-block text-sm text-muted-foreground hover:underline"
      >
        &larr; Back to Home
      </Link>
    </div>
  );
}
