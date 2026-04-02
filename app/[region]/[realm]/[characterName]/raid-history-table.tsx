import type { RaidProgressionSummary } from "@/lib/raiderio/types";

export interface RaidHistoryTableProps {
  raidProgression: Record<string, RaidProgressionSummary> | undefined;
}

function formatRaidName(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function RaidHistoryTable({ raidProgression }: RaidHistoryTableProps) {
  if (!raidProgression || Object.keys(raidProgression).length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
        No raid history available.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card/60 shadow-md shadow-black/30 overflow-hidden">
      <h2 className="px-4 py-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground/60 border-b border-border">
        Raid History
      </h2>
      <div className="divide-y divide-border">
        {Object.entries(raidProgression).map(([slug, prog]) => (
          <a
            key={slug}
            href={`https://raider.io/raids/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-accent/30"
          >
            <span className="text-sm font-medium text-foreground">
              {formatRaidName(slug)}
            </span>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>N: {prog.normal_bosses_killed}/{prog.total_bosses}</span>
              <span>H: {prog.heroic_bosses_killed}/{prog.total_bosses}</span>
              <span>M: {prog.mythic_bosses_killed}/{prog.total_bosses}</span>
              <span className="font-mono font-semibold text-foreground">
                {prog.summary}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
