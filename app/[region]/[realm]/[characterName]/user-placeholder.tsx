export function UserInterfacePlaceholder() {
  return (
    <div className="rounded-lg border border-border bg-card/60 shadow-md shadow-black/30 overflow-hidden">
      <h2 className="px-4 py-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground/60 border-b border-border">
        User Content
      </h2>
      <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
        <p className="text-lg font-semibold text-foreground">Coming Soon</p>
        <p className="mt-2 text-sm text-muted-foreground">
          User-configurable content will be available in a future update.
        </p>
      </div>
    </div>
  );
}
