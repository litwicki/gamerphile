"use client";

import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface LinkedAccount {
  provider: string;
  provider_account_id: string;
  provider_name: string | null;
  provider_email: string | null;
  provider_image: string | null;
}

function AccountContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [patreonAccount, setPatreonAccount] = useState<LinkedAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlinking, setUnlinking] = useState(false);

  const patreonStatus = searchParams.get("patreon");
  const error = searchParams.get("error");

  const fetchLinkedAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/account/linked");
      if (res.ok) {
        const data = await res.json();
        const patreon = data.accounts?.find(
          (a: LinkedAccount) => a.provider === "patreon"
        );
        setPatreonAccount(patreon ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchLinkedAccounts();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, fetchLinkedAccounts]);

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">Sign in to manage your account.</p>
        <Link
          href="/signin"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Sign in
        </Link>
      </div>
    );
  }

  async function handleUnlink() {
    setUnlinking(true);
    try {
      const res = await fetch("/api/auth/patreon/unlink", { method: "POST" });
      if (res.ok) {
        setPatreonAccount(null);
        router.replace("/account");
      }
    } finally {
      setUnlinking(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 p-8">
      <h1 className="text-2xl font-bold">Account</h1>

      {/* Status messages */}
      {patreonStatus === "linked" && (
        <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
          Patreon account linked successfully.
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          {error === "patreon_denied" && "Patreon authorization was denied."}
          {error === "patreon_failed" && "Failed to link Patreon account. Please try again."}
          {error === "patreon_save_failed" && "Failed to save Patreon link. Please try again."}
          {error === "not_authenticated" && "You must be signed in first."}
        </div>
      )}

      {/* Battle.net section */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Battle.net</h2>
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium">
              {session?.user?.name ?? "Connected"}
            </p>
            <p className="text-xs text-muted-foreground">Primary login</p>
          </div>
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            Connected
          </span>
        </div>
      </section>

      {/* Patreon section */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Patreon</h2>
        {patreonAccount ? (
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium">
                {patreonAccount.provider_name ?? patreonAccount.provider_email ?? "Linked"}
              </p>
              {patreonAccount.provider_email && (
                <p className="text-xs text-muted-foreground">
                  {patreonAccount.provider_email}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Linked
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnlink}
                disabled={unlinking}
              >
                {unlinking ? "Unlinking…" : "Unlink"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-dashed border-border p-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Link your Patreon account to track your subscription.
              </p>
            </div>
            <a
              href="/api/auth/patreon/link"
              className="rounded-md bg-[#FF424D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#e03a44]"
            >
              Link Patreon
            </a>
          </div>
        )}
      </section>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <span className="text-sm text-muted-foreground">Loading…</span>
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
