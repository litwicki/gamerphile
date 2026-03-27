"use client";

import Link from "next/link";
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
    <div
      className={`flex flex-col rounded-xl border border-border bg-card/70 backdrop-blur-sm ${className ?? ""}`}
    >
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
          {title}
        </h2>
      </div>
      <div className="flex-1 overflow-hidden p-4">{children}</div>
    </div>
  );
}

function CharacterPlaceholder({ index }: { index: number }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <User className="h-5 w-5 text-muted-foreground" />
      </div>
      <span className="mt-1 text-xs text-muted-foreground">Gamer {index}</span>
    </div>
  );
}

export default function HomePage() {
  const { region } = useRegion();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <div className="grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {/* Left column — Blue Tracker (tall) */}
        <BentoCard title="Blue Tracker" className="md:row-span-2 md:col-span-1">
          <div className="h-full max-h-[600px] overflow-y-auto">
            <RssFeed
              feedUrl="https://www.wowhead.com/blue-tracker?rss"
              maxItems={15}
            />
          </div>
        </BentoCard>

        {/* Middle top — Leaderboards */}
        <BentoCard title={`Leaderboards — ${region}`} className="md:col-span-1 lg:col-span-2 min-h-[300px]">
          <Leaderboard />
        </BentoCard>

        {/* Right column — Gamers (tall) */}
        <BentoCard title="Gamers" className="md:row-span-2 md:col-span-1">
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <CharacterPlaceholder key={i} index={i + 1} />
            ))}
          </div>
        </BentoCard>

        {/* Middle bottom — UI */}
        <BentoCard title="UI" className="md:col-span-1 lg:col-span-2">
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
    </div>
  );
}
