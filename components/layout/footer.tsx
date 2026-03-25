export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 text-sm text-muted-foreground sm:px-6">
        <span>&copy; {new Date().getFullYear()} Gamerphile</span>
        <span>World of Warcraft character lookup</span>
      </div>
    </footer>
  );
}
