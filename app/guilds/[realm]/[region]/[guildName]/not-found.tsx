import Link from "next/link";

export default function GuildNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold">Guild Not Found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The guild you are looking for does not exist. Please check the realm,
        region, and guild name.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
      >
        Go Home
      </Link>
    </div>
  );
}
