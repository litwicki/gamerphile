"use client";

import { useEffect, useState } from "react";

interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
}

interface RssCardProps {
  feedUrl: string;
  maxItems?: number;
  region?: string;
}

/**
 * Extract the region slug ("us" or "eu") from a wowhead blue-tracker URL.
 * Returns null for non-blue-tracker links.
 */
function extractLinkRegion(url: string): string | null {
  const m = url.match(/\/blue-tracker\/(?:topic|news)\/(us|eu)\//);
  return m ? m[1] : null;
}

/**
 * Deduplicate blue-tracker items that share the same title,
 * keeping only the variant matching the preferred region.
 * Non-blue-tracker items pass through unchanged.
 */
function deduplicateByRegion(items: RssItem[], preferredRegion: string): RssItem[] {
  const seen = new Map<string, RssItem>();

  for (const item of items) {
    const linkRegion = extractLinkRegion(item.link);

    // Not a regionalized blue-tracker link — always keep
    if (!linkRegion) {
      seen.set(item.guid || item.link, item);
      continue;
    }

    // Use title as the dedup key (same post across regions shares the same title)
    const key = item.title;
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, item);
      continue;
    }

    const existingRegion = extractLinkRegion(existing.link);

    // Prefer the item matching the user's region
    if (linkRegion === preferredRegion && existingRegion !== preferredRegion) {
      seen.set(key, item);
    }
    // Otherwise keep the existing one
  }

  return Array.from(seen.values());
}

export function RssFeed({ feedUrl, maxItems = 10, region }: RssCardProps) {
  const [items, setItems] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/rss?url=${encodeURIComponent(feedUrl)}`);
        if (!res.ok) throw new Error("Failed to load feed");
        const data = await res.json();
        const raw: RssItem[] = data.items ?? [];
        const preferred = region === "eu" ? "eu" : "us";
        const deduped = deduplicateByRegion(raw, preferred);
        setItems(deduped.slice(0, maxItems));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load feed");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [feedUrl, maxItems, region]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-muted-foreground">{error}</p>;
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No items found.</p>;
  }

  return (
    <div className="space-y-2 overflow-y-auto">
      {items.map((item, i) => (
        <a
          key={item.guid || i}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-md border border-border bg-card/60 p-3 transition-colors hover:bg-accent/40"
        >
          <h4 className="text-sm font-medium text-card-foreground line-clamp-2">
            {item.title}
          </h4>
          {item.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}
          {item.pubDate && (
            <time className="mt-1 block text-xs text-muted-foreground/70">
              {new Date(item.pubDate).toLocaleDateString()}
            </time>
          )}
        </a>
      ))}
    </div>
  );
}
