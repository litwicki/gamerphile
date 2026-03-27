import { NextRequest, NextResponse } from "next/server";

export interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return (match?.[1] ?? match?.[2] ?? "").trim();
}

function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    items.push({
      title: extractTag(block, "title"),
      link: extractTag(block, "link"),
      description: extractTag(block, "description").replace(/<[^>]*>/g, "").slice(0, 200),
      pubDate: extractTag(block, "pubDate"),
    });
  }
  return items;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      next: { revalidate: 600 },
      headers: { "User-Agent": "Gamerphile/1.0" },
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Feed returned ${res.status}` }, { status: 502 });
    }
    const xml = await res.text();
    const items = parseRss(xml);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 502 });
  }
}
