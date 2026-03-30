import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-[var(--max-viewport)] px-4 py-8 sm:px-6">
        {/* Three-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Partner Logos */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <a
              href="https://raider.io"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Raider.IO"
            >
              <img
                src="https://cdn.raiderio.net/images/brand/Logo_2ColorWhite.svg"
                alt="Raider.IO logo"
                className="h-8 opacity-70 transition-opacity hover:opacity-100"
              />
            </a>
            <a
              href="https://warcraftlogs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <img
                src="https://assets.rpglogs.com/img/warcraft/header-logo.png"
                alt="WarcraftLogs logo"
                className="h-8 opacity-70 transition-opacity hover:opacity-100"
              />
              <span className="text-sm text-muted-foreground opacity-70 transition-opacity hover:opacity-100">
                WarcraftLogs
              </span>
            </a>
          </div>

          {/* Column 2: Patreon Widget */}
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm text-muted-foreground">
              Support Gamerphile
            </p>
            <a
              href="https://patreon.com/gamerphile"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Become a Patron
            </a>
          </div>

          {/* Column 3: Site Navigation */}
          <nav
            aria-label="Footer navigation"
            className="flex flex-col items-center md:items-end gap-2"
          >
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link href="/news" className="text-sm text-muted-foreground hover:text-foreground">
              News
            </Link>
            <Link href="/characters" className="text-sm text-muted-foreground hover:text-foreground">
              Characters
            </Link>
            <Link href="/ui" className="text-sm text-muted-foreground hover:text-foreground">
              UI
            </Link>
          </nav>
        </div>

        {/* Divider */}
        <hr className="my-6 border-border" />

        {/* Legal Section */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            © {year} Gamerphile ·{" "}
            <a href="/privacy" className="hover:text-foreground hover:underline">
              Privacy Policy
            </a>{" "}
            ·{" "}
            <a href="/terms" className="hover:text-foreground hover:underline">
              Terms and Conditions
            </a>
          </p>
          <p className="mt-2">
            World of Warcraft® is a registered trademark of Blizzard
            Entertainment. All game images and content belong to Blizzard
            Entertainment.
          </p>
        </div>
      </div>
    </footer>
  );
}
