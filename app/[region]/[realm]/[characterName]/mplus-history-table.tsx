"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  MythicPlusBestRun,
  MythicPlusBestRunPlayer,
  EnrichedRunPlayer,
  ScoreTier,
} from "@/lib/raiderio/types";
import { resolveScoreColor } from "@/lib/raiderio/score-colors";
import { classColor } from "@/lib/class-colors";
import { RunDetailModal } from "./run-detail-modal";

export interface MPlusHistoryTableProps {
  bestRuns: MythicPlusBestRun[];
  scoreTiers?: ScoreTier[];
  onPlayerClick?: (player: MythicPlusBestRunPlayer, run: MythicPlusBestRun) => void;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Derive the RaiderIO season slug from a run URL */
function extractSeason(url: string): string | null {
  const match = url.match(/mythic-plus-runs\/(season-[^/]+)\//);
  return match?.[1] ?? null;
}

export function MPlusHistoryTable({ bestRuns, scoreTiers, onPlayerClick }: MPlusHistoryTableProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [rosterCache, setRosterCache] = useState<Record<number, EnrichedRunPlayer[]>>({});
  const [loadingRoster, setLoadingRoster] = useState<number | null>(null);

  // Modal state
  const [modalPlayer, setModalPlayer] = useState<EnrichedRunPlayer | null>(null);
  const [modalRun, setModalRun] = useState<MythicPlusBestRun | null>(null);

  const handleRowClick = useCallback((index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  }, []);

  const handlePlayerClick = useCallback(
    (player: EnrichedRunPlayer, run: MythicPlusBestRun) => {
      setModalPlayer(player);
      setModalRun(run);
      // Also fire the external callback if provided
      if (onPlayerClick) onPlayerClick(player, run);
    },
    [onPlayerClick],
  );

  const handleModalClose = useCallback(() => {
    setModalPlayer(null);
    setModalRun(null);
  }, []);

  // Fetch enriched roster when a run is expanded
  useEffect(() => {
    if (expandedIndex === null) return;
    const run = bestRuns[expandedIndex];
    if (!run) return;
    if (run.keystone_run_id && rosterCache[run.keystone_run_id]) return;
    if (!run.keystone_run_id) return;

    const season = extractSeason(run.url);
    if (!season) return;

    let cancelled = false;
    setLoadingRoster(expandedIndex);

    async function fetchRoster() {
      try {
        const params = new URLSearchParams({ season: season!, id: String(run.keystone_run_id) });
        const res = await fetch(`/api/raiderio/run-details?${params}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.roster) {
          setRosterCache((prev) => ({ ...prev, [run.keystone_run_id!]: data.roster }));
        }
      } finally {
        if (!cancelled) setLoadingRoster(null);
      }
    }

    fetchRoster();
    return () => { cancelled = true; };
  }, [expandedIndex, bestRuns, rosterCache]);

  if (!bestRuns || bestRuns.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
        No M+ history available.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card/60 shadow-md shadow-black/30 overflow-hidden">
        <h2 className="px-4 py-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground/60 border-b border-border">
          M+ History
        </h2>
        <div className="divide-y divide-border">
          {bestRuns.map((run, index) => {
            const roster: EnrichedRunPlayer[] | undefined = run.keystone_run_id
              ? rosterCache[run.keystone_run_id]
              : undefined;
            const isExpanded = expandedIndex === index;
            const isLoading = isExpanded && loadingRoster === index;

            return (
              <div key={`${run.dungeon}-${run.mythic_level}-${index}`}>
                <button
                  type="button"
                  onClick={() => handleRowClick(index)}
                  className="w-full px-4 py-3 text-left transition-colors hover:bg-accent/30 cursor-pointer"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-foreground">{run.dungeon}</span>
                      <span className="ml-2 text-xs font-semibold text-primary">+{run.mythic_level}</span>
                    </div>
                    <svg
                      className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span
                      className="font-mono font-semibold"
                      style={scoreTiers && scoreTiers.length > 0 ? { color: resolveScoreColor(run.score, scoreTiers) || undefined } : undefined}
                    >
                      {run.score.toFixed(1)}
                    </span>
                    <span>{formatTime(run.clear_time_ms)}</span>
                  </div>
                </button>

                {isExpanded && isLoading && (
                  <div className="border-t border-border bg-card/40 px-4 py-3 text-xs text-muted-foreground">
                    Loading roster…
                  </div>
                )}

                {isExpanded && !isLoading && roster && roster.length > 0 && (
                  <div className="border-t border-border bg-card/40 px-4 py-2">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-muted-foreground/60">
                          <th className="pb-1 text-left font-medium">Player</th>
                          <th className="pb-1 text-right font-medium">Spec</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {roster.map((player) => (
                          <tr key={player.character.id}>
                            <td className="py-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayerClick(player, run);
                                }}
                                className={`font-medium hover:underline cursor-pointer ${classColor(player.character.class?.name)}`}
                              >
                                {player.character.name}
                              </button>
                            </td>
                            <td className="py-1.5 text-right text-muted-foreground">
                              {player.character.spec?.name ?? player.role}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {isExpanded && !isLoading && (!roster || roster.length === 0) && (
                  <div className="border-t border-border bg-card/40 px-4 py-3 text-xs text-muted-foreground">
                    No player data available for this run.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {modalPlayer && modalRun && (
        <RunDetailModal
          player={modalPlayer}
          run={modalRun}
          open={true}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}
