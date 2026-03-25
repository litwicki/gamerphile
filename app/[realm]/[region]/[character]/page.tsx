import Link from "next/link";
import { notFound } from "next/navigation";
import { WoWApiClient } from "@/lib/wow-api";
import type { WoWRegion } from "@/lib/wow-api";

const VALID_REGIONS: ReadonlySet<string> = new Set<string>(["us", "eu", "kr", "tw"]);
const PARAM_PATTERN = /^[a-zA-Z0-9\- ]+$/;

interface CharacterPageProps {
  params: Promise<{ realm: string; region: string; character: string }>;
}

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { realm, region, character } = await params;

  // 7.4 — Validate URL parameters
  if (
    !VALID_REGIONS.has(region) ||
    !realm ||
    !character ||
    !PARAM_PATTERN.test(realm) ||
    !PARAM_PATTERN.test(character)
  ) {
    notFound();
  }

  // 7.1 — Create a region-specific WoW API client and fetch character profile
  const client = new WoWApiClient({
    clientId: process.env.BATTLENET_CLIENT_ID ?? "",
    clientSecret: process.env.BATTLENET_CLIENT_SECRET ?? "",
    region: region as WoWRegion,
  });

  const result = await client.getCharacterProfile(realm, character);

  // 7.3 — Error handling
  if (!result.ok) {
    if (result.error.status === 404) {
      notFound();
    }

    return (
      <div className="flex flex-1 flex-col items-center justify-center p-24">
        <h1 className="text-2xl font-bold text-destructive">Error</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Failed to load character: {result.error.message}
        </p>
        <Link
          href="/"
          className="mt-6 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Go home
        </Link>
      </div>
    );
  }

  // 7.2 — Display character profile
  const profile = result.data;

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">{profile.name}</h1>
      <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Realm</dt>
        <dd>{profile.realm.name}</dd>
        <dt className="text-muted-foreground">Level</dt>
        <dd>{profile.level}</dd>
        <dt className="text-muted-foreground">Race</dt>
        <dd>{profile.race.name}</dd>
        <dt className="text-muted-foreground">Class</dt>
        <dd>{profile.character_class.name}</dd>
      </dl>
      <Link href="/" className="mt-8 text-sm text-muted-foreground hover:underline">
        &larr; Back to Home
      </Link>
    </div>
  );
}
