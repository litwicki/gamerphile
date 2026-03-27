"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { AvatarMenu } from "@/components/layout/avatar-menu";
import { RegionSelector } from "@/components/layout/region-selector";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/ui", label: "UI Showcase" },
];

export function AppBar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6">
        <Link href="/" className="mr-6 flex items-center gap-2 font-bold tracking-tight">
          <span className="text-lg">🎮</span>
          <span className="text-primary">Gamerphile</span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          {status === "loading" && (
            <div
              className="h-8 w-8 animate-pulse rounded-full bg-muted"
              aria-hidden="true"
            />
          )}
          {status === "authenticated" && session?.user && (
            <AvatarMenu />
          )}
          {status === "unauthenticated" && (
            <>
              <RegionSelector />
              <Link
                href="/signin"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
