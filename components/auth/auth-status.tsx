"use client";

import { useSession } from "next-auth/react";
import { SignInButton } from "./sign-in-button";
import { SignOutButton } from "./sign-out-button";

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="text-sm text-muted-foreground">Loading...</span>;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm">{session.user.name ?? "Authenticated"}</span>
        <SignOutButton />
      </div>
    );
  }

  return <SignInButton />;
}
