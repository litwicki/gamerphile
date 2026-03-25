"use client";

import Link from "next/link";

export default function CharacterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold text-destructive">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {error.message || "An unexpected error occurred while loading the character."}
      </p>
      <div className="mt-6 flex gap-4">
        <button
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-input px-4 py-2 text-sm hover:bg-accent"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
