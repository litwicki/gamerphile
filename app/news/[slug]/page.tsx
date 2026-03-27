import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*, article_categories(slug, label)")
    .eq("slug", slug)
    .single();

  if (!article) notFound();

  const cat = article.article_categories as { slug: string; label: string } | null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/news"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to News
      </Link>

      <article className="mt-6">
        <div className="flex items-center gap-3">
          {cat && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {cat.label}
            </span>
          )}
          <time className="text-xs text-muted-foreground">
            {new Date(article.published_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>

        <h1 className="mt-3 text-2xl font-bold text-foreground">
          {article.title}
        </h1>

        <p className="mt-1 text-xs text-muted-foreground">
          via {article.source_name}
        </p>

        <div className="prose prose-sm prose-invert mt-6 max-w-none text-foreground/90">
          {article.body.split("\n").map((p: string, i: number) => (
            <p key={i} className="mb-4">{p}</p>
          ))}
        </div>

        {article.source_url && (
          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-sm text-primary hover:underline"
          >
            Read original article →
          </a>
        )}
      </article>
    </div>
  );
}
