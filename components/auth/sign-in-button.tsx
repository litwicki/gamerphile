"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignInButton() {
  return (
    <Button onClick={() => signIn("battlenet")} variant="default">
      Sign in with Battle.net
    </Button>
  );
}
