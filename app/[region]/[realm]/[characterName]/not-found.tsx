import Link from "next/link";

export default function CharacterNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold">Character Not Found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The character you are looking for does not exist. Please check the
        realm, region, and character name.
      </p>
      <Link
        href="/characters"
        className="mt-6 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
      >
        Back to Characters
      </Link>
    </div>
  );
}
