"use client";

import { useEffect, useState } from "react";

interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

interface RssCardProps {
  feedUrl: string;
  maxItems?: number;
}

export function RssFeed({ feedUrl, maxItems = 10 }: RssCardProps) {
  const [items, setItems] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/rss?url=${encodeURIComponent(feedUrl)}`);
        if (!res.ok) throw new Error("Failed to load feed");
        const data = await res.json();
        setItems((data.items ?? []).slice(0, maxItems));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load feed");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [feedUrl, maxItems]);

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
          key={i}
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
