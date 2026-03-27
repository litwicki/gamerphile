"use client";

import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface WoWCharacter {
  name: string;
  id: number;
  realm: { name: string; slug: string; id: number };
  playable_class: { name: string; id: number };
  playable_race: { name: string; id: number };
  gender: { type: string; name: string };
  faction: { type: string; name: string };
  level: number;
  guild?: string;
  avatar_url?: string;
  inset_url?: string;
  item_level?: number;
  mplus_rating?: number;
  raid_progression?: string;
}

type SortField = "level" | "class" | "realm" | "mplus" | "progression";
type SortDir = "asc" | "desc";

/** Map class names to Tailwind color classes from our class-colors config */
const CLASS_COLOR_MAP: Record<string, string> = {
  "Death Knight": "text-death-knight",
  "Demon Hunter": "text-demon-hunter",
  Druid: "text-druid",
  Evoker: "text-evoker",
  Hunter: "text-hunter",
  Mage: "text-mage",
  Monk: "text-monk",
  Paladin: "text-paladin",
  Priest: "text-priest",
  Rogue: "text-rogue",
  Shaman: "text-shaman",
  Warlock: "text-warlock",
  Warrior: "text-warrior",
};

function classColor(className: string): string {
  return CLASS_COLOR_MAP[className] ?? "text-foreground";
}

/** Map class names to muted border color classes */
const CLASS_BORDER_MAP: Record<string, string> = {
  "Death Knight": "border-death-knight/40",
  "Demon Hunter": "border-demon-hunter/40",
  Druid: "border-druid/40",
  Evoker: "border-evoker/40",
  Hunter: "border-hunter/40",
  Mage: "border-mage/40",
  Monk: "border-monk/40",
  Paladin: "border-paladin/40",
  Priest: "border-priest/40",
  Rogue: "border-rogue/40",
  Shaman: "border-shaman/40",
  Warlock: "border-warlock/40",
  Warrior: "border-warrior/40",
};

function classBorder(className: string): string {
  return CLASS_BORDER_MAP[className] ?? "border-border";
}

/** Parse raid progression string like "8/8 M" into a sortable number */
function progressionScore(prog: string | undefined): number {
  if (!prog) return 0;
  const m = prog.match(/(\d+)\/(\d+)\s*(\w)?/);
  if (!m) return 0;
  const killed = Number(m[1]);
  const total = Number(m[2]);
  const diff = m[3]?.toUpperCase();
  const diffWeight = diff === "M" ? 3 : diff === "H" ? 2 : diff === "N" ? 1 : 0;
  return diffWeight * 100 + (killed / Math.max(total, 1)) * 99;
}

export default function CharactersPage() {
  const { status } = useSession();
  const [characters, setCharacters] = useState<WoWCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [levelFilter, setLevelFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [realmFilter, setRealmFilter] = useState("");
  const [guildFilter, setGuildFilter] = useState("");

  // Sort
  const [sortField, setSortField] = useState<SortField>("level");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }
    fetch("/api/wow/characters")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setCharacters(data.characters ?? []);
      })
      .catch(() => setError("Failed to load characters"))
      .finally(() => setLoading(false));
  }, [status]);

  // Derive unique filter options
  const classes = useMemo(
    () => [...new Set(characters.map((c) => c.playable_class.name))].sort(),
    [characters]
  );
  const realms = useMemo(
    () => [...new Set(characters.map((c) => c.realm.name))].sort(),
    [characters]
  );
  const guilds = useMemo(
    () => [...new Set(characters.filter((c) => c.guild).map((c) => c.guild!))].sort(),
    [characters]
  );

  // Apply filters
  const filtered = useMemo(() => {
    let result = characters;
    if (levelFilter) {
      const minLevel = Number(levelFilter);
      if (!isNaN(minLevel)) result = result.filter((c) => c.level >= minLevel);
    }
    if (classFilter) result = result.filter((c) => c.playable_class.name === classFilter);
    if (realmFilter) result = result.filter((c) => c.realm.name === realmFilter);
    if (guildFilter) result = result.filter((c) => c.guild === guildFilter);
    return result;
  }, [characters, levelFilter, classFilter, realmFilter, guildFilter]);

  // Apply sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortField === "level") cmp = a.level - b.level;
      else if (sortField === "class") cmp = a.playable_class.name.localeCompare(b.playable_class.name);
      else if (sortField === "realm") cmp = a.realm.name.localeCompare(b.realm.name);
      else if (sortField === "mplus") cmp = (a.mplus_rating ?? 0) - (b.mplus_rating ?? 0);
      else if (sortField === "progression") cmp = progressionScore(a.raid_progression) - progressionScore(b.raid_progression);
      return sortDir === "desc" ? -cmp : cmp;
    });
    return arr;
  }, [filtered, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  }

  const sortIndicator = (field: SortField) =>
    sortField === field ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">Sign in to view your characters.</p>
        <Link href="/signin" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Sign in
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold text-primary">Characters</h1>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  const selectClass = "rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Characters</h1>
        <span className="text-sm text-muted-foreground">{sorted.length} of {characters.length}</span>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-wrap gap-2">
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className={selectClass} aria-label="Filter by class">
            <option value="">All Classes</option>
            {classes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={realmFilter} onChange={(e) => setRealmFilter(e.target.value)} className={selectClass} aria-label="Filter by realm">
            <option value="">All Realms</option>
            {realms.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={guildFilter} onChange={(e) => setGuildFilter(e.target.value)} className={selectClass} aria-label="Filter by guild">
            <option value="">All Guilds</option>
            {guilds.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <input
            type="number"
            placeholder="Min level"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className={`${selectClass} w-20`}
            aria-label="Minimum level"
          />
        </div>

        {/* Sort buttons */}
        <div className="flex flex-wrap gap-1 sm:ml-auto">
          {(["level", "class", "realm", "mplus", "progression"] as SortField[]).map((f) => {
            const labels: Record<SortField, string> = { level: "Level", class: "Class", realm: "Realm", mplus: "M+", progression: "Prog" };
            return (
              <button
                key={f}
                onClick={() => toggleSort(f)}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  sortField === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {labels[f]}{sortIndicator(f)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Character Grid */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sorted.map((char) => (
          <Link
            key={char.id}
            href={`/${char.realm.slug}/us/${char.name.toLowerCase()}`}
            className={`group relative flex overflow-hidden rounded-lg border-2 ${classBorder(char.playable_class.name)} bg-card/70 shadow-lg shadow-black/20 transition-all hover:bg-accent/30 hover:shadow-xl hover:shadow-black/30`}
          >
            {/* Inset background image */}
            {char.inset_url && (
              <img
                src={char.inset_url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-20 transition-opacity group-hover:opacity-30"
              />
            )}
            <div className="relative flex w-full gap-3 p-3">
              {/* Avatar */}
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted">
                {char.avatar_url ? (
                  <img src={char.avatar_url} alt={char.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    {char.level}
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="flex flex-1 flex-col justify-center overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className={`truncate text-sm font-semibold ${classColor(char.playable_class.name)}`}>
                    {char.name}
                  </span>
                  <span className="ml-2 text-xs font-mono text-muted-foreground">{char.level}</span>
                </div>
                <span className={`text-xs ${classColor(char.playable_class.name)}`}>
                  {char.playable_race.name} {char.playable_class.name}
                </span>
                <span className="text-xs text-muted-foreground">{char.realm.name}</span>
                {char.guild && (
                  <span className="text-xs text-muted-foreground/70">&lt;{char.guild}&gt;</span>
                )}
                {/* Stats row */}
                {(char.item_level || char.mplus_rating || char.raid_progression) && (
                  <div className="mt-1 flex flex-wrap gap-2 text-xs">
                    {char.item_level != null && (
                      <span className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-foreground/80">
                        {char.item_level} ilvl
                      </span>
                    )}
                    {char.mplus_rating != null && char.mplus_rating > 0 && (
                      <span className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-foreground/80">
                        {Math.round(char.mplus_rating)} M+
                      </span>
                    )}
                    {char.raid_progression && (
                      <span className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-foreground/80">
                        {char.raid_progression}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {sorted.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">No characters match your filters.</p>
      )}
    </div>
  );
}
