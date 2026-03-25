"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignOutPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-bold">Sign out</h1>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to sign out of your Battle.net account?
        </p>
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => signOut({ callbackUrl: "/" })}
            variant="destructive"
            className="w-full"
            size="lg"
          >
            Sign out
          </Button>
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
