export default function CharacterDetailLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="relative h-[40vh] animate-pulse bg-muted" />

      {/* Bento grid skeleton */}
      <div className="relative z-10 -mt-16 mx-auto w-full max-w-4xl px-4 sm:px-6 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg bg-muted border border-border"
          />
        ))}
      </div>

      {/* Three-column detail skeleton */}
      <div className="mx-auto mt-8 w-full max-w-4xl px-4 sm:px-6">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-lg bg-muted border border-border"
            />
          ))}
        </div>
      </div>
    </>
  );
}
