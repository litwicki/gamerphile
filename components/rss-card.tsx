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

const MONTH_NAMES =
  "january|february|march|april|may|june|july|august|september|october|november|december|" +
  "jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec";

/**
 * Normalize a title for deduplication:
 * - Strips trailing " (EU)" / " (US)" region labels
 * - Canonicalizes trailing date suffixes to "Month D" format so that
 *   "- 7 April" and "- April 7" (and "(EU)"/"(US)" variants) all map
 *   to the same key.
 */
function normalizeTitle(title: string): string {
  let t = title.replace(/\s*\((eu|us)\)\s*$/i, "").trim();

  // "- D Month[,] [Year]" → "- Month D"  (EU style)
  t = t.replace(
    new RegExp(`\\s*-\\s*(\\d{1,2})\\s+(${MONTH_NAMES})(?:\\s+\\d{4})?\\s*$`, "i"),
    (_, day, month) => ` - ${capitalize(month)} ${parseInt(day, 10)}`
  );

  // "- Month D[,] [Year]" → "- Month D"  (US style, normalise spacing/year)
  t = t.replace(
    new RegExp(`\\s*-\\s*(${MONTH_NAMES})\\s+(\\d{1,2})(?:[,\\s]+\\d{4})?\\s*$`, "i"),
    (_, month, day) => ` - ${capitalize(month)} ${parseInt(day, 10)}`
  );

  return t.trim();
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
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
 * Filter and deduplicate RSS items:
 * - Blue-tracker posts with a region in their URL are kept only if
 *   that region matches the user's preferred region.
 * - Titles are normalized before dedup so date-format differences
 *   between EU ("7 April") and US ("April 7") are treated as the
 *   same story.
 * - Non-blue-tracker items always pass through, deduped by guid/link.
 */
function filterAndDedup(items: RssItem[], preferredRegion: string): RssItem[] {
  const seen = new Map<string, RssItem>();

  for (const item of items) {
    const linkRegion = extractLinkRegion(item.link);

    // Regional blue-tracker post: drop if it doesn't match preferred region
    if (linkRegion && linkRegion !== preferredRegion) {
      continue;
    }

    // Dedup key: normalized title for regional posts, guid/link otherwise
    const key = linkRegion ? normalizeTitle(item.title) : (item.guid || item.link);
    if (!seen.has(key)) {
      seen.set(key, item);
    }
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
        const deduped = filterAndDedup(raw, preferred);
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
