export function Footer() {
  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 text-sm text-muted-foreground sm:px-6">
        <span>&copy; {new Date().getFullYear()} Gamerphile</span>
        <div className="flex items-center gap-4">
          <a href="https://raider.io" target="_blank" rel="noopener noreferrer" aria-label="Raider.IO">
            <img
              src="https://cdn.raiderio.net/images/brand/Logo_2ColorWhite.svg"
              alt="Raider.IO"
              style={{ maxHeight: 40 }}
              className="opacity-70 transition-opacity hover:opacity-100"
            />
          </a>
          <a href="https://warcraftlogs.com" target="_blank" rel="noopener noreferrer" aria-label="Warcraft Logs">
            <img
              src="https://assets.rpglogs.com/img/warcraft/header-logo.png"
              alt="Warcraft Logs"
              style={{ maxHeight: 40 }}
              className="opacity-70 transition-opacity hover:opacity-100"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
