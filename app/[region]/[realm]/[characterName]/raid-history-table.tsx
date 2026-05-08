"use client";

import { useState, useEffect } from "react";
import type { RaidProgressionSummary, RaidProgressionDetail } from "@/lib/raiderio/types";
import type { WCLEncounterRanking, WCLCharacterResponse } from "@/lib/wcl/types";
import { resolveParseColor } from "@/lib/raiderio/score-colors";

type Difficulty = "normal" | "heroic" | "mythic";
type LogMode = "raids" | "mplus";

const DIFF_NUM: Record<Difficulty, number> = { normal: 3, heroic: 4, mythic: 5 };
const DIFF_LABELS: Difficulty[] = ["normal", "heroic", "mythic"];

export interface RaidHistoryTableProps {
  raidProgression: Record<string, RaidProgressionSummary | RaidProgressionDetail> | undefined;
  characterName: string;
  serverSlug: string;
  serverRegion: string;
}

function formatRaidSlug(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getKillCount(prog: RaidProgressionSummary | undefined, diff: Difficulty): number {
  if (!prog) return 0;
  if (diff === "normal") return prog.normal_bosses_killed;
  if (diff === "heroic") return prog.heroic_bosses_killed;
  return prog.mythic_bosses_killed;
}

export function RaidHistoryTable({
  raidProgression,
  characterName,
  serverSlug,
  serverRegion,
}: RaidHistoryTableProps) {
  const [mode, setMode] = useState<LogMode>("raids");
  const raidSlugs = raidProgression ? Object.keys(raidProgression) : [];
  const [selectedRaid, setSelectedRaid] = useState(raidSlugs[0] ?? "");
  const prog = raidProgression?.[selectedRaid];

  // Pick default difficulty: highest with kills
  const defaultDiff = (): Difficulty => {
    if (!prog) return "heroic";
    if (prog.mythic_bosses_killed > 0) return "mythic";
    if (prog.heroic_bosses_killed > 0) return "heroic";
    return "normal";
  };
  const [activeDiff, setActiveDiff] = useState<Difficulty>(defaultDiff);

  // WCL data
  const [encounters, setEncounters] = useState<WCLEncounterRanking[] | null>(null);
  const [wclLoading, setWclLoading] = useState(false);
  const [wclError, setWclError] = useState(false);

  // Reset difficulty when raid changes
  useEffect(() => {
    if (mode !== "raids") return;
    const p = raidProgression?.[selectedRaid];
    if (!p) return;
    if (p.mythic_bosses_killed > 0) setActiveDiff("mythic");
    else if (p.heroic_bosses_killed > 0) setActiveDiff("heroic");
    else setActiveDiff("normal");
  }, [selectedRaid, raidProgression, mode]);

  // Fetch WCL data when mode, difficulty, or raid changes
  useEffect(() => {
    if (!characterName || !serverSlug || !serverRegion) return;

    let cancelled = false;
    setWclLoading(true);
    setWclError(false);

    async function fetchWCL() {
      try {
        const params = new URLSearchParams({
          name: characterName,
          serverSlug,
          serverRegion,
        });

        if (mode === "raids") {
          params.set("difficulty", String(DIFF_NUM[activeDiff]));
          params.set("metric", "dps");
        } else {
          // M+ uses playerscore metric with no difficulty filter
          params.set("metric", "playerscore");
        }

        const res = await fetch(`/api/wcl/character?${params}`);
        if (!res.ok) throw new Error("fetch failed");
        const json: WCLCharacterResponse = await res.json();
        if (!cancelled) {
          setEncounters(json.encounterRankings ?? []);
        }
      } catch {
        if (!cancelled) setWclError(true);
      } finally {
        if (!cancelled) setWclLoading(false);
      }
    }

    fetchWCL();
    return () => { cancelled = true; };
  }, [characterName, serverSlug, serverRegion, activeDiff, mode]);

  if (!raidProgression || raidSlugs.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
        No raid history available.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card/60 shadow-md shadow-black/30 overflow-hidden">
      {/* Header with mode tabs */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex gap-0.5">
          <button
            type="button"
            onClick={() => setMode("raids")}
            className={`rounded-l px-3 py-1 text-xs font-semibold transition-colors ${
              mode === "raids"
                ? "bg-primary text-primary-foreground"
                : "bg-card/40 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
            }`}
          >
            Raids
          </button>
          <button
            type="button"
            onClick={() => setMode("mplus")}
            className={`rounded-r px-3 py-1 text-xs font-semibold transition-colors ${
              mode === "mplus"
                ? "bg-primary text-primary-foreground"
                : "bg-card/40 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
            }`}
          >
            M+
          </button>
        </div>
        {mode === "raids" && raidSlugs.length > 1 && (
          <select
            value={selectedRaid}
            onChange={(e) => setSelectedRaid(e.target.value)}
            className="rounded bg-card border border-border px-1.5 py-0.5 text-[10px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {raidSlugs.map((slug) => (
              <option key={slug} value={slug}>{formatRaidSlug(slug)}</option>
            ))}
          </select>
        )}
      </div>

      {/* Difficulty buttons (raids only) */}
      {mode === "raids" && (
        <div className="flex gap-1 px-4 py-2 border-b border-border">
          {DIFF_LABELS.map((diff) => {
            const kills = getKillCount(prog, diff);
            const disabled = kills === 0;
            const active = activeDiff === diff;
            return (
              <button
                key={diff}
                type="button"
                disabled={disabled}
                onClick={() => setActiveDiff(diff)}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : disabled
                      ? "bg-card/40 text-muted-foreground/30 cursor-not-allowed"
                      : "bg-card/40 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                }`}
              >
                {diff.charAt(0).toUpperCase()}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div className="divide-y divide-border">
        {wclLoading && (
          <div className="px-4 py-6 text-center text-xs text-muted-foreground">Loading logs…</div>
        )}

        {!wclLoading && wclError && (
          <div className="px-4 py-6 text-center text-xs text-muted-foreground">
            WCL data unavailable
          </div>
        )}

        {!wclLoading && !wclError && encounters && encounters.length > 0 && (
          encounters.map((enc) => (
            <div key={enc.encounterID} className="flex items-center justify-between px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium text-foreground truncate block">
                  {enc.encounterName}
                </span>
                {enc.reportCode && (
                  <a
                    href={`https://www.warcraftlogs.com/reports/${enc.reportCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-primary hover:underline"
                  >
                    View log
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-muted-foreground">{enc.spec}</span>
                <span
                  className="text-sm font-bold font-mono min-w-[2.5rem] text-right"
                  style={{ color: resolveParseColor(enc.percentile) }}
                >
                  {Math.round(enc.percentile)}
                </span>
              </div>
            </div>
          ))
        )}

        {!wclLoading && !wclError && (!encounters || encounters.length === 0) && (
          <div className="px-4 py-6 text-center text-xs text-muted-foreground">
            {mode === "raids"
              ? `No logs found for ${activeDiff} difficulty`
              : "No M+ logs found"}
          </div>
        )}
      </div>
    </div>
  );
}
