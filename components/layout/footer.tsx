export function Footer() {
  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-[var(--max-viewport)] flex-col items-center gap-3 px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6 sm:py-0 sm:h-14">
        <span>&copy; {new Date().getFullYear()} Gamerphile</span>
        <div className="flex items-center gap-4">
          <a href="https://raider.io" target="_blank" rel="noopener noreferrer" aria-label="Raider.IO">
            <img
              src="https://cdn.raiderio.net/images/brand/Logo_2ColorWhite.svg"
              alt="Raider.IO"
              className="h-6 opacity-70 transition-opacity hover:opacity-100 sm:h-8"
            />
          </a>
          <a href="https://warcraftlogs.com" target="_blank" rel="noopener noreferrer" aria-label="Warcraft Logs">
            <img
              src="https://assets.rpglogs.com/img/warcraft/header-logo.png"
              alt="Warcraft Logs"
              className="h-6 opacity-70 transition-opacity hover:opacity-100 sm:h-8"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
