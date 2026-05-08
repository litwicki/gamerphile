"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useRegion } from "@/components/region-provider";
import { cn } from "@/lib/utils";

type SearchRegion = "us" | "eu" | "tw" | "cn";

interface CharacterResult {
  name: string;
  realm: { name: string; slug: string };
  playable_class: string;
  level: number;
  thumbnail_url?: string;
}

const SEARCH_REGIONS: { label: string; value: SearchRegion }[] = [
  { label: "US", value: "us" },
  { label: "EU", value: "eu" },
  { label: "TW", value: "tw" },
  { label: "CN", value: "cn" },
];

const CLASS_COLORS: Record<string, string> = {
  "Death Knight": "text-death-knight",
  "Demon Hunter": "text-demon-hunter",
  "Druid": "text-druid",
  "Evoker": "text-evoker",
  "Hunter": "text-hunter",
  "Mage": "text-mage",
  "Monk": "text-monk",
  "Paladin": "text-paladin",
  "Priest": "text-priest",
  "Rogue": "text-rogue",
  "Shaman": "text-shaman",
  "Warlock": "text-warlock",
  "Warrior": "text-warrior",
};

function profileRegionToSearch(profileRegion: string): SearchRegion {
  const lower = profileRegion.toLowerCase();
  if (lower === "eu" || lower.startsWith("eu-") || ["french", "german", "italian", "russian"].includes(lower)) return "eu";
  if (lower === "tw") return "tw";
  if (lower === "cn") return "cn";
  return "us";
}

export function CharacterSearch() {
  const router = useRouter();
  const { region: profileRegion } = useRegion();

  const [searchRegion, setSearchRegion] = useState<SearchRegion>(() =>
    profileRegionToSearch(profileRegion)
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CharacterResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchRegion(profileRegionToSearch(profileRegion));
  }, [profileRegion]);

  const search = useCallback(async (q: string, region: SearchRegion) => {
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/wow/character-search?q=${encodeURIComponent(q)}&region=${region}`
      );
      const data = await res.json();
      const chars = data.results ?? [];
      setResults(chars);
      setOpen(chars.length > 0);
      setActiveIndex(-1);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val, searchRegion), 350);
  };

  const handleSelect = (char: CharacterResult) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/${searchRegion}/${char.realm.slug}/${char.name.toLowerCase()}`);
  };

  // Allow Enter to navigate when query is in "name-realm" format
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (open && results.length > 0) setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (open && results.length > 0) setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && activeIndex >= 0 && results[activeIndex]) {
        handleSelect(results[activeIndex]);
      } else {
        // Direct navigation: parse "name-realm" input
        const dash = query.lastIndexOf("-");
        if (dash > 0) {
          const name = query.slice(0, dash).trim().toLowerCase();
          const realm = query.slice(dash + 1).trim().toLowerCase().replace(/\s+/g, "-");
          if (name && realm) {
            setOpen(false);
            setQuery("");
            router.push(`/${searchRegion}/${realm}/${name}`);
          }
        }
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative flex items-stretch">
      {/* Region select — left side of button group */}
      <select
        value={searchRegion}
        onChange={(e) => {
          const r = e.target.value as SearchRegion;
          setSearchRegion(r);
          if (query.length >= 2) search(query, r);
        }}
        aria-label="Search region"
        className="flex h-8 cursor-pointer appearance-none items-center rounded-l-md border border-border bg-muted px-2 pr-5 text-xs font-medium text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none' viewBox='0 0 10 6'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M1 1l4 4 4-4'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 4px center" }}
      >
        {SEARCH_REGIONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      {/* Search input — right side of button group */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          placeholder="Search characters..."
          className="h-8 w-48 rounded-r-md border border-l-0 border-border bg-background px-3 pr-7 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="Search characters"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-haspopup="listbox"
          role="combobox"
        />
        <Search
          className={cn(
            "pointer-events-none absolute right-2 h-3.5 w-3.5 text-muted-foreground",
            loading && "animate-pulse"
          )}
        />
      </div>

      {/* Autocomplete dropdown */}
      {open && results.length > 0 && (
        <ul
          role="listbox"
          aria-label="Character suggestions"
          className="absolute left-0 top-full z-50 mt-1 max-h-64 w-full min-w-[260px] overflow-y-auto rounded-md border border-border bg-popover py-1 shadow-md"
        >
          {results.map((char, i) => (
            <li
              key={`${char.name}-${char.realm.slug}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(char);
              }}
              className={cn(
                "flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm",
                i === activeIndex
                  ? "bg-accent text-accent-foreground"
                  : "text-popover-foreground hover:bg-accent/50"
              )}
            >
              {char.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={char.thumbnail_url}
                  alt=""
                  aria-hidden="true"
                  className="h-8 w-8 shrink-0 rounded object-cover"
                />
              )}
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{char.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {char.realm.name}
                  {char.playable_class && (
                    <>
                      {" · "}
                      <span className={CLASS_COLORS[char.playable_class] ?? "text-muted-foreground"}>
                        {char.playable_class}
                      </span>
                    </>
                  )}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
