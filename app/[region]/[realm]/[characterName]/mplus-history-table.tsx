import type { MythicPlusBestRun } from "@/lib/raiderio/types";

export interface MPlusHistoryTableProps {
  bestRuns: MythicPlusBestRun[];
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatUpgrades(count: number): string {
  if (count <= 0) return "—";
  return "+".repeat(count);
}

export function MPlusHistoryTable({ bestRuns }: MPlusHistoryTableProps) {
  if (!bestRuns || bestRuns.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
        No M+ history available.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card/60 shadow-md shadow-black/30 overflow-hidden">
      <h2 className="px-4 py-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground/60 border-b border-border">
        M+ History
      </h2>
      <div className="divide-y divide-border">
        {bestRuns.map((run, index) => (
          <a
            key={`${run.dungeon}-${run.mythic_level}-${index}`}
            href={run.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-accent/30"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {run.dungeon}
              </span>
              <span className="text-xs font-semibold text-primary">
                +{run.mythic_level}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{formatTime(run.clear_time_ms)}</span>
              <span>{formatUpgrades(run.num_keystone_upgrades)}</span>
              <span className="font-mono font-semibold text-foreground">
                {run.score.toFixed(1)}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
