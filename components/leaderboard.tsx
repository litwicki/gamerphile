"use client";

import { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { useRegion } from "@/components/region-provider";

const WOW_SEASON = process.env.NEXT_PUBLIC_WOW_SEASON ?? "season-tww-3";

interface RaidEntry {
  rank: number;
  guild: {
    name: string;
    faction: string;
    realm: { name: string };
    region: { short_name: string };
  };
  encountersDefeated: { slug: string; firstDefeated: string }[];
}

interface MplusEntry {
  rank: number;
  score: number;
  run: {
    dungeon: { name: string; short_name: string };
    mythic_level: number;
    clear_time_ms: number;
    num_chests: number;
  };
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Map display region names to Raider.IO API region slugs */
function toApiRegion(region: string): string {
  const map: Record<string, string> = {
    World: "world", US: "us", EU: "eu", KR: "kr", TW: "tw",
    English: "english", French: "french", German: "german",
    Italian: "italian", Oceanic: "oceanic", Russian: "russian",
    Spanish: "spanish", "EU-English": "eu-english",
    "EU-Portuguese": "eu-portuguese", "EU-Spanish": "eu-spanish",
    "US-English": "us-english", Brazil: "brazil",
    "US-Spanish": "us-spanish", "US-Central": "us-central",
    "US-Eastern": "us-eastern", "US-Mountain": "us-mountain",
    "US-Pacific": "us-pacific",
  };
  return map[region] ?? "world";
}

function RaidRankings({ region }: { region: string }) {
  const [entries, setEntries] = useState<RaidEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const apiRegion = toApiRegion(region);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/raiderio/raid-rankings?raid=tier-mn-1&difficulty=mythic&region=${apiRegion}&limit=10`)
      .then((r) => r.json())
      .then((data) => setEntries(data.raidRankings ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [apiRegion]);

  if (loading) return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-muted" />)}</div>;

  return (
    <div className="space-y-1 overflow-y-auto">
      {entries.map((e, i) => (
        <div key={i} className="flex items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-accent/30">
          <span className="w-6 text-right font-mono font-bold text-primary">{e.rank}</span>
          <span className="flex-1 truncate font-medium text-muted-foreground">{e.guild.name}</span>
          <span className="text-muted-foreground">{e.guild.realm.name}</span>
          <span className="w-12 text-right text-foreground">
            {e.encountersDefeated.length}/9
          </span>
        </div>
      ))}
      {entries.length === 0 && <p className="text-xs text-muted-foreground">No data available</p>}
    </div>
  );
}

function MythicPlusRuns({ region }: { region: string }) {
  const [entries, setEntries] = useState<MplusEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const apiRegion = toApiRegion(region);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/raiderio/mythic-plus-runs?season=${WOW_SEASON}&region=${apiRegion}`)
      .then((r) => r.json())
      .then((data) => setEntries((data.rankings ?? []).slice(0, 10)))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [apiRegion]);

  if (loading) return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-muted" />)}</div>;

  return (
    <div className="space-y-1 overflow-y-auto">
      {entries.map((e, i) => (
        <div key={i} className="flex items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-accent/30">
          <span className="w-6 text-right font-mono font-bold text-primary">+{e.run.mythic_level}</span>
          <span className="flex-1 truncate font-medium text-muted-foreground">{e.run.dungeon.short_name}</span>
          <span className="text-muted-foreground">{formatTime(e.run.clear_time_ms)}</span>
          <span className="w-10 text-right font-mono text-foreground">{e.score.toFixed(1)}</span>
        </div>
      ))}
      {entries.length === 0 && <p className="text-xs text-muted-foreground">No data available</p>}
    </div>
  );
}

export function Leaderboard() {
  const { region } = useRegion();

  return (
    <Tabs.Root defaultValue="raid" className="flex h-full flex-col">
      <Tabs.List className="flex border-b border-border">
        <Tabs.Trigger
          value="raid"
          className="flex-1 px-3 py-2 text-xs font-semibold uppercase text-muted-foreground transition-colors data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground"
        >
          Raid
        </Tabs.Trigger>
        <Tabs.Trigger
          value="mplus"
          className="flex-1 px-3 py-2 text-xs font-semibold uppercase text-muted-foreground transition-colors data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground"
        >
          M+
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="raid" className="flex-1 overflow-hidden pt-2">
        <RaidRankings region={region} />
      </Tabs.Content>
      <Tabs.Content value="mplus" className="flex-1 overflow-hidden pt-2">
        <MythicPlusRuns region={region} />
      </Tabs.Content>
    </Tabs.Root>
  );
}
