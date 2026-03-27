"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { RssFeed } from "@/components/rss-card";
import { Leaderboard } from "@/components/leaderboard";
import { useRegion } from "@/components/region-provider";
import { User } from "lucide-react";

function BentoCard({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col rounded-xl border border-border bg-card/70 backdrop-blur-sm ${className ?? ""}`}>
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">{title}</h2>
      </div>
      <div className="flex-1 overflow-hidden p-4">{children}</div>
    </div>
  );
}

const CLASS_COLOR: Record<string, string> = {
  "Death Knight": "border-death-knight/50", "Demon Hunter": "border-demon-hunter/50",
  Druid: "border-druid/50", Evoker: "border-evoker/50", Hunter: "border-hunter/50",
  Mage: "border-mage/50", Monk: "border-monk/50", Paladin: "border-paladin/50",
  Priest: "border-priest/50", Rogue: "border-rogue/50", Shaman: "border-shaman/50",
  Warlock: "border-warlock/50", Warrior: "border-warrior/50",
};

interface MplusCharacter {
  name: string;
  realm_slug: string;
  region: string;
  class_name: string;
  score: number;
  mythic_level: number;
  thumbnail_url: string | null;
  profile_url: string;
}

function MplusGamerGrid({ region }: { region: string }) {
  const [chars, setChars] = useState<MplusCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const apiRegion = region === "World" ? "world" : region.toLowerCase();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/raiderio/mplus-leaderboard?region=${apiRegion}&limit=15`)
      .then((r) => r.json())
      .then((data) => setChars((data.characters ?? []).slice(0, 15)))
      .catch(() => setChars([]))
      .finally(() => setLoading(false));
  }, [apiRegion]);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {chars.map((char, i) => (
        <a
          key={`${char.region}-${char.realm_slug}-${char.name}-${i}`}
          href={char.profile_url}
          target="_blank"
          rel="noopener noreferrer"
          title={`${char.name} — +${char.mythic_level} (${char.score.toFixed(1)})`}
          className={`group relative aspect-square overflow-hidden rounded-lg border-2 ${CLASS_COLOR[char.class_name] ?? "border-border"} bg-muted transition-transform hover:scale-105 hover:z-10`}
        >
          {char.thumbnail_url ? (
            <img src={char.thumbnail_url} alt={char.name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1 pb-1 pt-3 opacity-0 transition-opacity group-hover:opacity-100">
            <p className="truncate text-[10px] font-bold text-white">{char.name}</p>
            <p className="text-[9px] text-white/70">+{char.mythic_level}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

/** Mobile tabbed view */
function MobileBento({ region }: { region: string }) {
  return (
    <Tabs.Root defaultValue="tracker" className="flex flex-col">
      <Tabs.List className="flex border-b border-border">
        {[
          { value: "tracker", label: "Blue Tracker" },
          { value: "leaderboards", label: "Leaderboards" },
          { value: "mplus", label: "Top M+" },
          { value: "ui", label: "UI" },
        ].map((tab) => (
          <Tabs.Trigger
            key={tab.value}
            value={tab.value}
            className="flex-1 px-2 py-2.5 text-xs font-semibold uppercase text-muted-foreground transition-colors data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground"
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value="tracker" className="min-h-[400px] p-4">
        <div className="max-h-[500px] overflow-y-auto">
          <RssFeed feedUrl="https://www.wowhead.com/blue-tracker?rss" maxItems={15} />
        </div>
      </Tabs.Content>

      <Tabs.Content value="leaderboards" className="min-h-[400px] p-4">
        <Leaderboard />
      </Tabs.Content>

      <Tabs.Content value="mplus" className="min-h-[400px] p-4">
        <MplusGamerGrid region={region} />
      </Tabs.Content>

      <Tabs.Content value="ui" className="min-h-[200px] p-4">
        <div className="flex h-full items-center justify-center">
          <Link
            href="/ui"
            className="rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            Explore UI Components →
          </Link>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
}

/** Desktop bento grid */
function DesktopBento({ region }: { region: string }) {
  return (
    <div className="grid auto-rows-[minmax(200px,auto)] grid-cols-3 gap-4 lg:grid-cols-4">
      <BentoCard title="Blue Tracker" className="row-span-2 col-span-1">
        <div className="h-full max-h-[600px] overflow-y-auto">
          <RssFeed feedUrl="https://www.wowhead.com/blue-tracker?rss" maxItems={15} />
        </div>
      </BentoCard>

      <BentoCard title={`Leaderboards — ${region}`} className="col-span-1 lg:col-span-2 min-h-[300px]">
        <Leaderboard />
      </BentoCard>

      <BentoCard title={`Top M+ — ${region}`} className="row-span-2 col-span-1">
        <MplusGamerGrid region={region} />
      </BentoCard>

      <BentoCard title="UI" className="col-span-1 lg:col-span-2">
        <div className="flex h-full items-center justify-center">
          <Link
            href="/ui"
            className="rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            Explore UI Components →
          </Link>
        </div>
      </BentoCard>
    </div>
  );
}

export default function HomePage() {
  const { region } = useRegion();

  return (
    <div className="mx-auto w-full max-w-[var(--max-viewport)] px-4 py-6 sm:px-6">
      {/* Mobile: tabbed layout */}
      <div className="rounded-xl border border-border bg-card/70 backdrop-blur-sm md:hidden">
        <MobileBento region={region} />
      </div>

      {/* Desktop: bento grid */}
      <div className="hidden md:block">
        <DesktopBento region={region} />
      </div>
    </div>
  );
}
