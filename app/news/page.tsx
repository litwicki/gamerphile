import Link from "next/link";

export default function NewsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">News</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Latest World of Warcraft news and updates.
      </p>
      <Link href="/" className="mt-8 text-sm text-muted-foreground hover:underline">
        &larr; Back to Home
      </Link>
    </main>
  );
}
