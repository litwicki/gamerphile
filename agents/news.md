# TASK
Build a comic book industry news aggregator that runs as a daily Vercel Cron job.
It fetches, summarizes, categorizes, and persists news articles to Supabase,
then surfaces them as a news section on this Next.js site.

## CONTEXT

- Framework: Next.js (App Router) deployed on Vercel
- Database: Supabase (Postgres)
- Cron schedule: daily at 06:00 UTC via vercel.json
- The author for all aggregated articles must be a system user: nerdbot
  (Ensure this user exists in your users table, or create a seed for it, before inserting articles)

## SOURCES TO AGGREGATE

Fetch from the following RSS feeds and public APIs — parse all available items
published in the last 24 hours:

RSS Feeds (parse with rss-parser or fast-xml-parser):

- https://www.comicsbeat.com/feed/
- https://bleedingcool.com/comics/feed/
- https://www.cbr.com/feed/
- https://icv2.com/articles/news/rss.xml
- https://www.previewsworld.com/SiteFiles/rss/newreleases.xml
- https://www.newsarama.com/comics/rss/index.xml
- https://www.popculture.com/comics/rss/index.xml

Optional / supplemental (if accessible):

- Marvel.com news RSS (if available)
- DC Comics news RSS (if available)
- Diamond Comic Distributors announcements (if public RSS exists)

## CATEGORIZATION

After fetching, use the Claude API (claude-sonnet-4-20250514) to:

1. Deduplicate articles: if two sources cover the same story, keep the most detailed version
   and note the other source(s) in the body. Use title similarity + published date as signal.
1. Classify each article into exactly ONE of these categories:
- new-releases       — solicitations, on-sale dates, issue announcements
- industry-deals      — contracts, licensing, acquisitions, partnerships
- exclusives          — retailer exclusives, variant covers, limited editions
- market-trends       — sales data, market share, Diamond/Lunar/UCS charts
- creator-news        — signings, departures, interviews, creator spotlights
- adaptations         — film, TV, animation, game adaptations of comic IP
- events-crossovers   — major story events, crossovers, universe reboots
- reviews             — issue or collection reviews
- community           — conventions, fan events, crowdfunding, awards
- general             — anything that doesn’t fit the above
1. For each article, extract or synthesize:
- title: clean, human-readable headline (rewrite if the source title is clickbait or truncated)
- body: a factual 2–4 paragraph summary of the article in a neutral journalistic tone.
  Always include: what happened, who is involved, why it matters to comic book fans.
  End the body with: “Source: [Publication Name] — [original URL]”
  If the original author’s name is bylined, include: “Originally reported by [Author Name].”
- author: always set to the nerdbot user’s UUID from the users table
- category: one of the slugs listed above

## DATABASE SCHEMA

Apply the following migration if the tables don’t already exist:

– See schema block below for the full SQL –

Follow these rules strictly:

- Use upsert (ON CONFLICT DO NOTHING) keyed on source_url to prevent duplicates across runs
- Never insert an article without a valid category_id foreign key
- Seed the article_categories table with all 10 slugs above on first run (idempotent)
- Seed the nerdbot user (role: ‘system’, email: nerdbot@[yourdomain].com) if not present

## CRON HANDLER

Create app/api/cron/comic-news/route.ts as the cron endpoint:

- Protect the route: verify the CRON_SECRET header matches process.env.CRON_SECRET
- Fetch, deduplicate, classify, and persist in a single run
- Log a summary to console: sources fetched, items found, items inserted, items skipped (duplicates)
- Return a JSON response: { success: true, inserted: N, skipped: N, errors: […] }
- Gracefully handle per-article errors: if one article fails to classify or insert, log it and continue
- Total Claude API calls should be batched: classify up to 20 articles per request using a
  structured JSON prompt to minimize latency and cost

Register the cron in vercel.json:
“crons”: [{ “path”: “/api/cron/comic-news”, “schedule”: “0 6 * * *” }]

## NEXT.JS NEWS SECTION

Create a app/news/page.tsx that:

- Server-renders a paginated list of articles (20 per page)
- Supports filtering by category via a ?category= query param
- Shows: article title, category badge, publication date, and a truncated summary (first 200 chars of body)
- Links each article to a app/news/[slug]/page.tsx detail page
  (derive slug from title: lowercase, hyphenated, max 80 chars)
- The detail page renders the full body, source attribution line, and category

## ENVIRONMENT VARIABLES REQUIRED

Add these to .env.local and Vercel project settings:

- ANTHROPIC_API_KEY         — for Claude classification calls

## QUALITY & CONSTRAINTS

- TypeScript throughout — no any types
- Use zod to validate all external feed data before processing
- Handle feed fetch failures silently per-source (one bad feed must not abort the run)
- Write a brief README.md section documenting how to test the cron locally
  using: curl -H “Authorization: Bearer $CRON_SECRET” localhost:3000/api/cron/comic-news