export interface BentoGridProps {
  raidSummary: string | undefined;
  mplusScore: number;
  highestRun: { dungeon: string; level: number } | undefined;
  hasTwitchIntegration: boolean;
}

const widgetCard =
  "bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4";

function RaidProgressWidget({
  raidSummary,
}: {
  raidSummary: string | undefined;
}) {
  return (
    <div className={widgetCard}>
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
        Raid Progress
      </h3>
      <p className="mt-1 text-2xl font-bold text-foreground">
        {raidSummary ?? "—"}
      </p>
    </div>
  );
}

function WarcraftLogsWidget() {
  return (
    <div className={widgetCard}>
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
        Warcraft Logs
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">Coming Soon</p>
    </div>
  );
}

function MPlusRatingWidget({
  mplusScore,
  highestRun,
}: {
  mplusScore: number;
  highestRun: { dungeon: string; level: number } | undefined;
}) {
  return (
    <div className={widgetCard}>
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
        M+ Rating
      </h3>
      <p className="mt-1 text-2xl font-bold text-foreground">
        {mplusScore > 0 ? Math.round(mplusScore) : "—"}
      </p>
      {highestRun ? (
        <p className="mt-0.5 text-xs text-muted-foreground">
          {highestRun.dungeon} +{highestRun.level}
        </p>
      ) : (
        <p className="mt-0.5 text-xs text-muted-foreground">—</p>
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
  mplusScore,
  highestRun,
  hasTwitchIntegration,
}: BentoGridProps) {
  return (
    <div
      className={`relative z-10 -mt-16 mx-auto w-full max-w-4xl px-4 sm:px-6 grid gap-3 grid-cols-1 sm:grid-cols-2 ${
        hasTwitchIntegration ? "lg:grid-cols-4" : "lg:grid-cols-3"
      }`}
    >
      <RaidProgressWidget raidSummary={raidSummary} />
      <WarcraftLogsWidget />
      <MPlusRatingWidget mplusScore={mplusScore} highestRun={highestRun} />
      {hasTwitchIntegration && <TwitchWidget />}
    </div>
  );
}
