import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Gamerphile</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        World of Warcraft character lookup and community features
      </p>
      <nav className="mt-8 flex gap-4">
        <Link
          href="/news"
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          News
        </Link>
        <Link
          href="/ui"
          className="rounded-md border border-input px-4 py-2 hover:bg-accent"
        >
          UI Showcase
        </Link>
      </nav>
    </main>
  );
}
