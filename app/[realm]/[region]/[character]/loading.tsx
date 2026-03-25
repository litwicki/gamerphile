export default function CharacterLoading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading character data…</p>
      </div>
    </div>
  );
}
