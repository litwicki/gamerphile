"use client";

import { useState, useEffect } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import type {
  RaidProgressionDetail,
  RaidProgressionSummary,
  MythicPlusRanks,
  MythicPlusSpecScore,
  ScoreTier,
} from "@/lib/raiderio/types";
import type {
  WCLCharacterResponse,
} from "@/lib/wcl/types";
import { resolveScoreColor, resolveParseColor } from "@/lib/raiderio/score-colors";

export interface RaidProgressWidgetProps {
  raidSummary: string | undefined;
  raidProgression: Record<string, RaidProgressionSummary | RaidProgressionDetail> | undefined;
  regionRank: number | undefined;
  worldRank: number | undefined;
}

export interface MPlusRatingWidgetProps {
  mplusScore: number;
  highestRun: { dungeon: string; level: number } | undefined;
  scoreColor: string;
  ranks: MythicPlusRanks | undefined;
  specScores: MythicPlusSpecScore[] | undefined;
  scoreTiers: ScoreTier[];
}

export interface WarcraftLogsWidgetProps {
  characterName: string;
  serverSlug: string;
  serverRegion: string;
}

export interface BentoGridProps {
  raidSummary: string | undefined;
  raidProgression: Record<string, RaidProgressionSummary | RaidProgressionDetail> | undefined;
  regionRank: number | undefined;
  worldRank: number | undefined;
  mplusScore: number;
  highestRun: { dungeon: string; level: number } | undefined;
  scoreColor: string;
  ranks: MythicPlusRanks | undefined;
  specScores: MythicPlusSpecScore[] | undefined;
  scoreTiers: ScoreTier[];
  hasTwitchIntegration: boolean;
  characterName: string;
  serverSlug: string;
  serverRegion: string;
}

const widgetCard =
  "bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4";

type Difficulty = "normal" | "heroic" | "mythic";

function getFirstRaidDetail(
  progression: Record<string, RaidProgressionSummary | RaidProgressionDetail> | undefined
): RaidProgressionDetail | undefined {
  if (!progression) return undefined;
  const first = Object.values(progression)[0];
  return first as RaidProgressionDetail | undefined;
}

function getKillCount(detail: RaidProgressionDetail | undefined, diff: Difficulty): number {
  if (!detail) return 0;
  if (diff === "normal") return detail.normal_bosses_killed;
  if (diff === "heroic") return detail.heroic_bosses_killed;
  return detail.mythic_bosses_killed;
}

function getBossList(detail: RaidProgressionDetail | undefined, diff: Difficulty) {
  return detail?.bosses?.[diff] ?? [];
}

export function RaidProgressWidget({
  raidSummary,
  raidProgression,
  regionRank,
  worldRank,
}: RaidProgressWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const detail = getFirstRaidDetail(raidProgression);

  const difficulties: Difficulty[] = ["normal", "heroic", "mythic"];
  const killCounts: Record<Difficulty, number> = {
    normal: getKillCount(detail, "normal"),
    heroic: getKillCount(detail, "heroic"),
    mythic: getKillCount(detail, "mythic"),
  };

  // Default to the highest difficulty that has kills, or "normal"
  const defaultTab =
    difficulties.filter((d) => killCounts[d] > 0).pop() ?? "normal";

  return (
    <div className={widgetCard}>
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
        Raid Progress
      </h3>
      <p className="mt-1 text-2xl font-bold text-foreground">
        {raidSummary ?? "—"}
      </p>

      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
        <span>
          Region: <span className="font-semibold text-foreground">{regionRank != null ? `#${regionRank}` : "—"}</span>
        </span>
        <span>
          World: <span className="font-semibold text-foreground">{worldRank != null ? `#${worldRank}` : "—"}</span>
        </span>
      </div>

      {detail?.bosses && (
        <>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-2 text-xs font-medium text-primary hover:underline"
          >
            {expanded ? "See Less" : "See More"}
          </button>

          {expanded && (
            <Tabs.Root defaultValue={defaultTab} className="mt-3">
              <Tabs.List className="flex gap-1 border-b border-border pb-1">
                {difficulties.map((diff) => {
                  const disabled = killCounts[diff] === 0;
                  return (
                    <Tabs.Trigger
                      key={diff}
                      value={diff}
                      disabled={disabled}
                      className="rounded-t px-2 py-1 text-xs font-medium capitalize transition-colors data-[state=active]:bg-accent data-[state=active]:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {diff}
                    </Tabs.Trigger>
                  );
                })}
              </Tabs.List>

              {difficulties.map((diff) => {
                const bosses = getBossList(detail, diff);
                return (
                  <Tabs.Content key={diff} value={diff} className="mt-2 space-y-1">
                    {bosses.length > 0 ? (
                      bosses.map((boss) => (
                        <div
                          key={boss.slug}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-foreground">{boss.name}</span>
                          {boss.defeatedAt ? (
                            <span className="text-green-500" aria-label="Killed">✓</span>
                          ) : (
                            <span className="text-muted-foreground/40" aria-label="Not killed">✗</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">No kills</p>
                    )}
                  </Tabs.Content>
                );
              })}
            </Tabs.Root>
          )}
        </>
      )}
    </div>
  );
}

function WarcraftLogsWidget({ characterName, serverSlug, serverRegion }: WarcraftLogsWidgetProps) {
  const [data, setData] = useState<WCLCharacterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!characterName || !serverSlug || !serverRegion) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchWCL() {
      try {
        const params = new URLSearchParams({
          name: characterName,
          serverSlug,
          serverRegion,
        });
        const res = await fetch(`/api/wcl/character?${params.toString()}`);
        if (!res.ok) throw new Error("fetch failed");
        const json: WCLCharacterResponse = await res.json();
        if (!cancelled) {
          setData(json);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchWCL();
    return () => { cancelled = true; };
  }, [characterName, serverSlug, serverRegion]);

  // Error state — fall back to "Coming Soon" without exposing details
  if (error) {
    return (
      <div className={widgetCard} data-testid="wcl-widget">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
          Warcraft Logs
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">Coming Soon</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={widgetCard} data-testid="wcl-widget">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
          Warcraft Logs
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  // No data from WCL
  const hasZone = data?.zoneRankings != null;
  const hasEncounters = data?.encounterRankings != null && data.encounterRankings.length > 0;

  if (!hasZone && !hasEncounters) {
    return (
      <div className={widgetCard} data-testid="wcl-widget">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
          Warcraft Logs
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">No Warcraft Logs data available</p>
      </div>
    );
  }

  const zone = data!.zoneRankings;
  const encounters = data!.encounterRankings ?? [];

  return (
    <div className={widgetCard} data-testid="wcl-widget">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
        Warcraft Logs
      </h3>

      {zone && (
        <div className="mt-1 flex gap-4">
          <div>
            <span className="text-xs text-muted-foreground">Best</span>
            <p
              className="text-2xl font-bold"
              style={{ color: resolveParseColor(zone.bestPercentile) }}
              data-testid="wcl-best"
            >
              {Math.round(zone.bestPercentile)}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Median</span>
            <p
              className="text-2xl font-bold"
              style={{ color: resolveParseColor(zone.medianPercentile) }}
              data-testid="wcl-median"
            >
              {Math.round(zone.medianPercentile)}
            </p>
          </div>
        </div>
      )}

      {encounters.length > 0 && (
        <div className="mt-2 space-y-1">
          {encounters.map((enc) => (
            <div key={enc.encounterID} className="flex items-center justify-between text-xs">
              <span className="text-foreground truncate mr-2">{enc.encounterName}</span>
              <span
                className="font-semibold"
                style={{ color: resolveParseColor(enc.percentile) }}
              >
                {Math.round(enc.percentile)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Build a spec icon URL from the spec name.
 * Uses the Blizzard-style media path via RaiderIO CDN.
 */
function specIconUrl(specName: string): string {
  const slug = specName.toLowerCase().replace(/\s+/g, "-");
  return `https://cdnassets.raider.io/images/wow/icons/medium/spec_${slug}.jpg`;
}

export function MPlusRatingWidget({
  mplusScore,
  highestRun,
  scoreColor,
  ranks,
  specScores,
  scoreTiers,
}: MPlusRatingWidgetProps) {
  const [activeSpec, setActiveSpec] = useState<string | null>(null);

  // Determine displayed score and ranks based on active spec
  const activeSpecData = activeSpec
    ? specScores?.find((s) => s.spec === activeSpec)
    : null;

  const displayedScore = activeSpecData ? activeSpecData.score : mplusScore;
  const displayedColor = activeSpecData
    ? resolveScoreColor(activeSpecData.score, scoreTiers)
    : scoreColor;
  const displayedRanks = activeSpecData
    ? activeSpecData.ranks
    : ranks?.overall;

  const colorStyle = displayedColor ? { color: displayedColor } : undefined;

  return (
    <div className={widgetCard}>
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
        M+ Rating
      </h3>
      <p
        className="mt-1 text-2xl font-bold"
        style={colorStyle}
        data-testid="mplus-score"
      >
        {displayedScore > 0 ? Math.round(displayedScore) : "—"}
      </p>
      {highestRun && !activeSpec ? (
        <p className="mt-0.5 text-xs text-muted-foreground">
          {highestRun.dungeon} +{highestRun.level}
        </p>
      ) : null}

      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
        <span>
          Realm:{" "}
          <span className="font-semibold" style={colorStyle} data-testid="realm-rank">
            {displayedRanks?.realm != null ? `#${displayedRanks.realm}` : "—"}
          </span>
        </span>
        <span>
          Region:{" "}
          <span className="font-semibold" style={colorStyle} data-testid="region-rank">
            {displayedRanks?.region != null ? `#${displayedRanks.region}` : "—"}
          </span>
        </span>
        <span>
          World:{" "}
          <span className="font-semibold" style={colorStyle} data-testid="world-rank">
            {displayedRanks?.world != null ? `#${displayedRanks.world}` : "—"}
          </span>
        </span>
      </div>

      {specScores && specScores.length > 0 && (
        <Tabs.Root
          value={activeSpec ?? "overall"}
          onValueChange={(val) => setActiveSpec(val === "overall" ? null : val)}
          className="mt-3"
        >
          <Tabs.List className="flex gap-1 border-b border-border pb-1" aria-label="Spec tabs">
            <Tabs.Trigger
              value="overall"
              className="rounded-t px-2 py-1 text-xs font-medium transition-colors data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              All
            </Tabs.Trigger>
            {specScores.map((specScore) => {
              const disabled = specScore.score === 0;
              return (
                <Tabs.Trigger
                  key={specScore.spec}
                  value={specScore.spec}
                  disabled={disabled}
                  className="relative rounded-t px-2 py-1 text-xs font-medium transition-colors data-[state=active]:bg-accent data-[state=active]:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    backgroundImage: `url(${specIconUrl(specScore.spec)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  title={specScore.spec}
                  aria-label={specScore.spec}
                >
                  <span className="relative z-10 mix-blend-difference">
                    {specScore.spec.slice(0, 3)}
                  </span>
                </Tabs.Trigger>
              );
            })}
          </Tabs.List>
        </Tabs.Root>
      )}
    </div>
  );
}

function TwitchWidget() {
  return (
    <div className={widgetCard}>
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
        Twitch
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">Stream embed</p>
    </div>
  );
}

export function BentoGrid({
  raidSummary,
  raidProgression,
  regionRank,
  worldRank,
  mplusScore,
  highestRun,
  scoreColor,
  ranks,
  specScores,
  scoreTiers,
  hasTwitchIntegration,
  characterName,
  serverSlug,
  serverRegion,
}: BentoGridProps) {
  return (
    <div
      className={`relative z-10 -mt-16 mx-auto w-full max-w-[var(--max-viewport)] px-4 sm:px-6 grid gap-3 grid-cols-1 sm:grid-cols-2 ${
        hasTwitchIntegration ? "lg:grid-cols-4" : "lg:grid-cols-3"
      }`}
    >
      <RaidProgressWidget
        raidSummary={raidSummary}
        raidProgression={raidProgression}
        regionRank={regionRank}
        worldRank={worldRank}
      />
      <WarcraftLogsWidget
        characterName={characterName}
        serverSlug={serverSlug}
        serverRegion={serverRegion}
      />
      <MPlusRatingWidget
        mplusScore={mplusScore}
        highestRun={highestRun}
        scoreColor={scoreColor}
        ranks={ranks}
        specScores={specScores}
        scoreTiers={scoreTiers}
      />
      {hasTwitchIntegration && <TwitchWidget />}
    </div>
  );
}
