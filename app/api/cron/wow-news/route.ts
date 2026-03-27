import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const WOW_NEWS_FEEDS = [
  { name: "Wowhead", url: "https://www.wowhead.com/news/rss" },
  { name: "Icy Veins", url: "https://www.icy-veins.com/wow/news.rss" },
  { name: "MMO-Champion", url: "https://www.mmo-champion.com/external.php?do=rss&type=newcontent&sectionid=1&days=1&count=20" },
  { name: "Raider.IO", url: "https://raider.io/news/rss" },
];

const RssItemSchema = z.object({
  title: z.string().min(1),
  link: z.string().url(),
  description: z.string().optional().default(""),
  pubDate: z.string().optional().default(""),
});

type RssItem = z.infer<typeof RssItemSchema> & { sourceName: string };

interface ClassifiedArticle {
  title: string;
  body: string;
  category: string;
  source_url: string;
  source_name: string;
  image_url: string | null;
  published_at: string;
}

function extractTag(xml: string, tag: string): string {
  const re = new RegExp(
    `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`
  );
  const m = xml.match(re);
  return (m?.[1] ?? m?.[2] ?? "").trim();
}

function parseRssItems(xml: string, sourceName: string): RssItem[] {
  const items: RssItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const raw = {
      title: extractTag(block, "title"),
      link: extractTag(block, "link"),
      description: extractTag(block, "description").replace(/<[^>]*>/g, "").slice(0, 500),
      pubDate: extractTag(block, "pubDate"),
    };
    const parsed = RssItemSchema.safeParse(raw);
    if (parsed.success) {
      items.push({ ...parsed.data, sourceName });
    }
  }
  return items;
}

function isWithin24Hours(dateStr: string): boolean {
  if (!dateStr) return true; // include if no date
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;
  const now = Date.now();
  return now - d.getTime() < 24 * 60 * 60 * 1000;
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function fetchFeed(feed: { name: string; url: string }): Promise<RssItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { "User-Agent": "Gamerphile/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRssItems(xml, feed.name).filter((item) => isWithin24Hours(item.pubDate));
  } catch {
    console.warn(`Failed to fetch feed: ${feed.name}`);
    return [];
  }
}

async function classifyArticles(items: RssItem[]): Promise<ClassifiedArticle[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("ANTHROPIC_API_KEY not set, skipping classification");
    return items.map((item) => ({
      title: item.title,
      body: item.description || "No summary available.",
      category: "general",
      source_url: item.link,
      source_name: item.sourceName,
      image_url: null,
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    }));
  }

  const client = new Anthropic({ apiKey });
  const prompt = `You are a World of Warcraft news editor. Given these RSS items, deduplicate (keep the most detailed if two cover the same story), classify each into exactly ONE category, and write a clean summary.

Categories (use the slug):
- patch-notes: official patch notes, hotfixes, maintenance
- raid-dungeon: raid tier info, dungeon changes, boss strategies
- pvp: arena, battlegrounds, rated PvP
- class-changes: talent reworks, balance tuning, spec updates
- mythic-plus: M+ season info, affix changes, dungeon pool
- race-world-first: RWF coverage, guild progress, kill announcements
- esports: AWC, MDI, tournament results
- lore: story developments, cinematics, book/comic tie-ins
- community: fan events, addons, community spotlights, conventions
- general: anything else

For each article return JSON with: title (clean headline), body (2-4 paragraph factual summary ending with "Source: [name] — [url]"), category (slug from above), source_url, source_name, published_at (ISO string).

Input items:
${JSON.stringify(items.map((i) => ({ title: i.title, link: i.link, description: i.description, pubDate: i.pubDate, source: i.sourceName })))}

Return ONLY a JSON array of classified articles. No markdown, no explanation.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]) as ClassifiedArticle[];
    return parsed.map((a) => ({
      ...a,
      published_at: a.published_at || new Date().toISOString(),
      image_url: a.image_url ?? null,
    }));
  } catch (e) {
    console.error("Claude classification failed:", e);
    return items.map((item) => ({
      title: item.title,
      body: item.description || "No summary available.",
      category: "general",
      source_url: item.link,
      source_name: item.sourceName,
      image_url: null,
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    }));
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch all feeds
  const allItems: RssItem[] = [];
  for (const feed of WOW_NEWS_FEEDS) {
    const items = await fetchFeed(feed);
    allItems.push(...items);
  }
  console.log(`Fetched ${allItems.length} items from ${WOW_NEWS_FEEDS.length} feeds`);

  if (allItems.length === 0) {
    return NextResponse.json({ success: true, inserted: 0, skipped: 0, errors: [] });
  }

  // Classify in batches of 20
  const classified: ClassifiedArticle[] = [];
  for (let i = 0; i < allItems.length; i += 20) {
    const batch = allItems.slice(i, i + 20);
    const result = await classifyArticles(batch);
    classified.push(...result);
  }

  // Fetch category map
  const { data: categories } = await supabase.from("article_categories").select("id, slug");
  const categoryMap = new Map((categories ?? []).map((c: { id: number; slug: string }) => [c.slug, c.id]));

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const article of classified) {
    const categoryId = categoryMap.get(article.category) ?? categoryMap.get("general");
    if (!categoryId) {
      errors.push(`No category found for: ${article.category}`);
      continue;
    }

    const slug = toSlug(article.title);
    const { error } = await supabase.from("articles").upsert(
      {
        title: article.title,
        slug,
        body: article.body,
        source_url: article.source_url,
        source_name: article.source_name,
        category_id: categoryId,
        author: "gamerbot",
        image_url: article.image_url,
        published_at: article.published_at,
      },
      { onConflict: "source_url", ignoreDuplicates: true }
    );

    if (error) {
      if (error.code === "23505") {
        skipped++;
      } else {
        errors.push(`Insert failed for "${article.title}": ${error.message}`);
      }
    } else {
      inserted++;
    }
  }

  console.log(`Inserted: ${inserted}, Skipped: ${skipped}, Errors: ${errors.length}`);
  return NextResponse.json({ success: true, inserted, skipped, errors });
}
