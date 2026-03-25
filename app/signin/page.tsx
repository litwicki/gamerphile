"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";

const regions = [
  { id: "us", label: "USA" },
  { id: "eu", label: "Europe" },
  { id: "kr", label: "Korea" },
  { id: "tw", label: "Taiwan" },
  { id: "cn", label: "China" },
] as const;

export default function SignInPage() {
  const [selected, setSelected] = useState<string>("us");

  function handleSignIn() {
    signIn("battlenet", { callbackUrl: `/?region=${selected}` });
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Battle.net banner */}
        <div className="flex items-center justify-center rounded-lg bg-[#1a1e23] px-8 py-8">
          <Image
            src="/battlenet_logo.png"
            alt="Battle.net"
            width={400}
            height={80}
            priority
          />
        </div>

        {/* Region selector */}
        <div className="flex gap-2">
          {regions.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSelected(id)}
              className={`flex-1 rounded border px-3 py-2 text-sm font-medium transition-colors ${
                selected === id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sign in button */}
        <button
          onClick={handleSignIn}
          className="w-full rounded-lg bg-[#00AEFF] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0090d0]"
        >
          Sign in with Battle.net ({regions.find((r) => r.id === selected)?.label})
        </button>
      </div>
    </div>
  );
}
