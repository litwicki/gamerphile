"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import * as Avatar from "@radix-ui/react-avatar";
import { User } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { WOW_THEMES } from "@/lib/themes";
import { getInitials } from "@/lib/utils";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">Sign in to view your profile.</p>
        <Link
          href="/signin"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const user = session?.user;
  const initials = getInitials(user?.name);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 p-8">
      <h1 className="text-2xl font-bold">Profile</h1>

      <section className="flex items-center gap-4 rounded-lg border border-border bg-card p-6">
        <Avatar.Root className="inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-muted">
          <Avatar.Image
            src={user?.image ?? undefined}
            alt={user?.name ?? "User avatar"}
            className="h-full w-full object-cover"
          />
          <Avatar.Fallback className="flex h-full w-full items-center justify-center text-lg font-medium text-muted-foreground">
            {user?.name ? initials : <User className="h-6 w-6" />}
          </Avatar.Fallback>
        </Avatar.Root>
        <div>
          <p className="text-lg font-semibold text-card-foreground">
            {user?.name ?? "Unknown"}
          </p>
          {user?.email && (
            <p className="text-sm text-muted-foreground">{user.email}</p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Theme</h2>
        <div className="rounded-lg border border-border bg-card p-4">
          <label htmlFor="theme-select" className="mb-2 block text-sm text-muted-foreground">
            Select a class theme
          </label>
          <select
            id="theme-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            {WOW_THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </section>
    </div>
  );
}
