import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const ITEMS_PER_PAGE = 20;

interface PageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categoryFilter = params.category;
  const page = Math.max(1, Number(params.page ?? 1));
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const supabase = await createClient();

  // Fetch categories for filter tabs
  const { data: categories } = await supabase
    .from("article_categories")
    .select("id, slug, label")
    .order("slug");

  // Build article query
  let query = supabase
    .from("articles")
    .select("id, title, slug, body, source_name, published_at, category_id, article_categories(slug, label)", { count: "exact" })
    .order("published_at", { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  if (categoryFilter) {
    const cat = (categories ?? []).find((c: { slug: string }) => c.slug === categoryFilter);
    if (cat) {
      query = query.eq("category_id", cat.id);
    }
  }

  const { data: articles, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / ITEMS_PER_PAGE);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold text-primary">WoW News</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Latest World of Warcraft news aggregated from top sources.
      </p>

      {/* Category filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/news"
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !categoryFilter
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          All
        </Link>
        {(categories ?? []).map((cat: { slug: string; label: string }) => (
          <Link
            key={cat.slug}
            href={`/news?category=${cat.slug}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              categoryFilter === cat.slug
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Articles */}
      <div className="mt-6 space-y-4">
        {(!articles || articles.length === 0) && (
          <p className="text-sm text-muted-foreground">
            No articles found. Run the news cron to populate.
          </p>
        )}
        {(articles ?? []).map((article: Record<string, unknown>) => {
          const cat = article.article_categories as { slug: string; label: string } | null;
          return (
            <Link
              key={article.id as number}
              href={`/news/${article.slug as string}`}
              className="block rounded-lg border border-border bg-card/70 p-4 transition-colors hover:bg-accent/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-card-foreground">
                    {article.title as string}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {(article.body as string).slice(0, 200)}…
                  </p>
                </div>
                {cat && (
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {cat.label}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{article.source_name as string}</span>
                <span>·</span>
                <time>{new Date(article.published_at as string).toLocaleDateString()}</time>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/news?${categoryFilter ? `category=${categoryFilter}&` : ""}page=${page - 1}`}
              className="rounded-md bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
            >
              ← Prev
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/news?${categoryFilter ? `category=${categoryFilter}&` : ""}page=${page + 1}`}
              className="rounded-md bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
