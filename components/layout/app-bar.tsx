"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AvatarMenu } from "@/components/layout/avatar-menu";
import { RegionSelector } from "@/components/layout/region-selector";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/characters", label: "Characters" },
  { href: "/ui", label: "UI" },
];

export function AppBar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-[var(--max-viewport)] items-center px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="mr-4 flex items-center gap-2 font-bold tracking-tight sm:mr-6" onClick={() => setMobileOpen(false)}>
          <span className="text-lg">🎮</span>
          <span className="text-primary">Gamerphile</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Desktop auth area */}
        <div className="hidden items-center gap-3 md:flex">
          {status === "loading" && (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" aria-hidden="true" />
          )}
          {status === "authenticated" && session?.user && <AvatarMenu />}
          {status === "unauthenticated" && (
            <>
              <RegionSelector />
              <Link href="/signin" className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                Sign in
              </Link>
            </>
          )}
        </div>

        {/* Mobile: auth + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          {status === "authenticated" && session?.user && <AvatarMenu />}
          {status === "unauthenticated" && (
            <Link href="/signin" className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground" onClick={() => setMobileOpen(false)}>
              Sign in
            </Link>
          )}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <nav className="border-t border-border bg-background/95 px-4 pb-4 pt-2 backdrop-blur md:hidden" aria-label="Mobile navigation">
          <div className="flex flex-col gap-1">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === href ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
                )}
              >
                {label}
              </Link>
            ))}
            {status === "unauthenticated" && (
              <div className="mt-2 flex items-center gap-2 border-t border-border pt-2">
                <RegionSelector />
                <span className="text-xs text-muted-foreground">Region</span>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
