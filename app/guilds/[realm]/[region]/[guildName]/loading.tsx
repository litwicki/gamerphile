export default function GuildLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
      <div className="mt-6">
        <div className="mb-3 h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
