"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";

const regions = [
  { id: "us", label: "USA", disabled: false },
  { id: "eu", label: "Europe", disabled: false },
  { id: "kr", label: "Korea", disabled: true },
  { id: "tw", label: "Taiwan", disabled: true },
  { id: "cn", label: "China", disabled: true },
];

export function getRegionCallbackUrl(regionId: string): string {
  return `/?region=${regionId}`;
}

export default function SignInPage() {
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

        {/* Region links */}
        <div className="flex gap-2">
          {regions.map(({ id, label, disabled }) =>
            disabled ? (
              <span
                key={id}
                role="button"
                aria-disabled="true"
                aria-label={`${label} region is unavailable`}
                className="flex-1 cursor-not-allowed rounded border border-border bg-muted px-3 py-2 text-center text-sm font-medium text-muted-foreground opacity-50"
              >
                {label}
              </span>
            ) : (
              <button
                key={id}
                onClick={() =>
                  signIn("battlenet", {
                    callbackUrl: getRegionCallbackUrl(id),
                  })
                }
                aria-label={`Sign in with ${label}`}
                className="flex-1 rounded border border-border bg-muted px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
