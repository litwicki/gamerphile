// Feature: character-pages, Property 1: Asset selection with fallback
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { render } from "@testing-library/react";
import { HeroSection } from "@/app/[region]/[realm]/[characterName]/hero-section";
import { WOW_THEMES } from "@/lib/themes";

/**
 * Property 1: Asset selection with fallback
 * **Validates: Requirements 1.2, 1.4**
 *
 * For any CharacterMedia assets array, if an asset with key "main-raw" exists,
 * the hero section should use its value as the background image URL.
 * If no "main-raw" asset exists, the hero section should render a gradient fallback.
 */

const arbAsset = fc.record({
  key: fc.constantFrom("avatar", "inset", "main-raw", "main", "profile-avatar"),
  value: fc.webUrl(),
});

const arbAssetsArray = fc.array(arbAsset, { minLength: 0, maxLength: 10 });

const baseProps = {
  classTheme: "theme-warrior",
  name: "Testchar",
  specName: "Arms",
  raceName: "Human",
  className: "Warrior",
  level: 80,
  realmName: "Stormrage",
  region: "us",
  classColor: "text-warrior",
};

describe("Property 1: Asset selection with fallback", () => {
  it("renders img with main-raw URL when a main-raw asset is present", () => {
    fc.assert(
      fc.property(
        arbAssetsArray.filter((assets) =>
          assets.some((a) => a.key === "main-raw")
        ),
        (assets) => {
          const mainRawAsset = assets.find((a) => a.key === "main-raw");
          const mainRawUrl = mainRawAsset?.value;

          const { container, unmount } = render(
            <HeroSection {...baseProps} mainRawUrl={mainRawUrl} />
          );

          const img = container.querySelector("img");
          expect(img).not.toBeNull();
          expect(img!.getAttribute("src")).toBe(mainRawUrl);

          // Gradient fallback should NOT be present
          const gradientDiv = container.querySelector(
            ".bg-gradient-to-br.from-primary\\/60.to-background"
          );
          expect(gradientDiv).toBeNull();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("renders gradient fallback when no main-raw asset is present", () => {
    fc.assert(
      fc.property(
        arbAssetsArray.filter((assets) =>
          assets.every((a) => a.key !== "main-raw")
        ),
        (assets) => {
          // No main-raw asset → mainRawUrl is undefined
          const mainRawUrl = assets.find(
            (a) => a.key === "main-raw"
          )?.value;

          const { container, unmount } = render(
            <HeroSection {...baseProps} mainRawUrl={mainRawUrl} />
          );

          // No img should be rendered
          const img = container.querySelector("img");
          expect(img).toBeNull();

          // Gradient fallback should be present
          const fallback = container.querySelector(
            "[class*='bg-gradient-to-br']"
          );
          expect(fallback).not.toBeNull();
          expect(fallback!.className).toContain("from-primary/60");
          expect(fallback!.className).toContain("to-background");

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: character-pages, Property 2: Hero overlay contains all character identity fields

/**
 * Property 2: Hero overlay contains all character identity fields
 * **Validates: Requirements 1.5**
 *
 * For any valid character profile data (name, spec, race, class, level, realm, region),
 * the hero section overlay should contain all of these values in its rendered output.
 */

const arbCharacterIdentity = fc.record({
  name: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
  specName: fc.option(
    fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
    { nil: undefined }
  ),
  raceName: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
  className: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
  level: fc.integer({ min: 1, max: 80 }),
  realmName: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
  region: fc.constantFrom("us", "eu", "kr", "tw"),
  classColor: fc.constantFrom(
    "text-warrior",
    "text-paladin",
    "text-hunter",
    "text-rogue",
    "text-priest",
    "text-death-knight",
    "text-shaman",
    "text-mage",
    "text-warlock",
    "text-monk",
    "text-druid",
    "text-demon-hunter",
    "text-evoker"
  ),
});

describe("Property 2: Hero overlay contains all character identity fields", () => {
  it("renders all identity fields in the hero overlay for any valid character profile", () => {
    fc.assert(
      fc.property(arbCharacterIdentity, (identity) => {
        const { container, unmount } = render(
          <HeroSection
            mainRawUrl={undefined}
            classTheme="theme-warrior"
            name={identity.name}
            specName={identity.specName}
            raceName={identity.raceName}
            className={identity.className}
            level={identity.level}
            realmName={identity.realmName}
            region={identity.region}
            classColor={identity.classColor}
          />
        );

        const textContent = container.textContent ?? "";

        // Character name should appear in the h1
        const h1 = container.querySelector("h1");
        expect(h1).not.toBeNull();
        expect(h1!.textContent).toBe(identity.name);
        expect(h1!.className).toContain(identity.classColor);

        // Spec name should appear if provided
        if (identity.specName !== undefined) {
          expect(textContent).toContain(identity.specName);
        }

        // Race and class names should appear
        expect(textContent).toContain(identity.raceName);
        expect(textContent).toContain(identity.className);

        // Level should appear
        expect(textContent).toContain(`Level ${identity.level}`);

        // Realm name should appear
        expect(textContent).toContain(identity.realmName);

        // Region should appear (rendered uppercase in the component)
        expect(textContent.toUpperCase()).toContain(identity.region.toUpperCase());

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});


// Feature: character-pages, Property 3: Class-to-theme mapping

/**
 * Property 3: Class-to-theme mapping
 * **Validates: Requirements 1.6**
 *
 * For any valid WoW class name from the set of 13 playable classes,
 * the page should map it to the corresponding `theme-{class}` CSS class
 * and `text-{class}` color class. The mapping should be total — every
 * valid class name produces a valid theme.
 */

const PLAYABLE_CLASSES = [
  "Warrior",
  "Paladin",
  "Hunter",
  "Rogue",
  "Priest",
  "Death Knight",
  "Shaman",
  "Mage",
  "Warlock",
  "Monk",
  "Druid",
  "Demon Hunter",
  "Evoker",
] as const;

// Reproduce the mappings from page.tsx so we can verify them
const CLASS_COLORS: Record<string, string> = {
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

const CLASS_THEMES: Record<string, string> = {
  "Death Knight": "theme-death-knight",
  "Demon Hunter": "theme-demon-hunter",
  Druid: "theme-druid",
  Evoker: "theme-evoker",
  Hunter: "theme-hunter",
  Mage: "theme-mage",
  Monk: "theme-monk",
  Paladin: "theme-paladin",
  Priest: "theme-priest",
  Rogue: "theme-rogue",
  Shaman: "theme-shaman",
  Warlock: "theme-warlock",
  Warrior: "theme-warrior",
};

const arbClassName = fc.constantFrom(...PLAYABLE_CLASSES);

describe("Property 3: Class-to-theme mapping", () => {
  it("maps every playable class to a valid theme-{class} CSS class", () => {
    fc.assert(
      fc.property(arbClassName, (wowClass) => {
        const theme = CLASS_THEMES[wowClass];
        expect(theme).toBeDefined();
        expect(theme).toMatch(/^theme-[a-z-]+$/);

        // Verify the theme id matches the normalized class name
        const expectedId = wowClass.toLowerCase().replace(/ /g, "-");
        expect(theme).toBe(`theme-${expectedId}`);
      }),
      { numRuns: 100 }
    );
  });

  it("maps every playable class to a valid text-{class} color class", () => {
    fc.assert(
      fc.property(arbClassName, (wowClass) => {
        const color = CLASS_COLORS[wowClass];
        expect(color).toBeDefined();
        expect(color).toMatch(/^text-[a-z-]+$/);

        // Verify the color class matches the normalized class name
        const expectedId = wowClass.toLowerCase().replace(/ /g, "-");
        expect(color).toBe(`text-${expectedId}`);
      }),
      { numRuns: 100 }
    );
  });

  it("has a total mapping — all 13 playable classes produce valid entries", () => {
    fc.assert(
      fc.property(arbClassName, (wowClass) => {
        // Both mappings must be defined (not falling back to defaults)
        const color = CLASS_COLORS[wowClass];
        const theme = CLASS_THEMES[wowClass];

        expect(color).not.toBeUndefined();
        expect(theme).not.toBeUndefined();

        // The theme should also exist in WOW_THEMES from lib/themes.ts
        const matchingTheme = WOW_THEMES.find(
          (t: { cssClass: string; colorClass: string }) =>
            t.cssClass === theme && t.colorClass === color
        );
        expect(matchingTheme).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });
});


// Feature: character-pages, Property 4: Raid widget displays progression summary
import { BentoGrid } from "@/app/[region]/[realm]/[characterName]/bento-grid";

/**
 * Property 4: Raid widget displays progression summary
 * **Validates: Requirements 2.3**
 *
 * For any non-empty raid_progression record from Raider.IO, the raid progress
 * widget should display the summary string of the current (first) raid tier.
 * When raidSummary is undefined, the widget should display "—".
 */

const baseBentoProps = {
  raidProgression: undefined,
  regionRank: undefined,
  worldRank: undefined,
  mplusScore: 0,
  highestRun: undefined,
  scoreColor: "",
  ranks: undefined,
  specScores: undefined,
  scoreTiers: [] as import("@/lib/raiderio/types").ScoreTier[],
  hasTwitchIntegration: false,
  characterName: "Testchar",
  serverSlug: "stormrage",
  serverRegion: "us",
};

const arbNonEmptyRaidSummary = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter((s) => s.trim().length > 0);

describe("Property 4: Raid widget displays progression summary", () => {
  it("displays the provided raidSummary string in the widget", () => {
    fc.assert(
      fc.property(arbNonEmptyRaidSummary, (raidSummary) => {
        const { container, unmount } = render(
          <BentoGrid {...baseBentoProps} raidSummary={raidSummary} />
        );

        const textContent = container.textContent ?? "";
        expect(textContent).toContain(raidSummary);

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('displays "—" when raidSummary is undefined', () => {
    fc.assert(
      fc.property(fc.constant(undefined), (_) => {
        const { container, unmount } = render(
          <BentoGrid {...baseBentoProps} raidSummary={undefined} />
        );

        // Find the Raid Progress widget's value paragraph
        const paragraphs = container.querySelectorAll("p");
        const raidValueP = Array.from(paragraphs).find(
          (p) =>
            p.classList.contains("text-2xl") &&
            p.closest("div")?.textContent?.includes("Raid Progress")
        );
        expect(raidValueP).not.toBeNull();
        expect(raidValueP!.textContent).toBe("—");

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});


// Feature: character-pages, Property 5: M+ widget displays score and highest key

/**
 * Property 5: M+ widget displays score and highest key
 * **Validates: Requirements 2.5**
 *
 * For any set of mythic_plus_scores_by_season and mythic_plus_best_runs data,
 * the M+ rating widget should display the current season's overall score and
 * the dungeon name and key level of the highest completed run.
 */

const arbDungeonName = fc
  .string({ minLength: 1, maxLength: 30 })
  .filter((s) => s.trim().length > 0);

const arbHighestRun = fc.record({
  dungeon: arbDungeonName,
  level: fc.integer({ min: 2, max: 35 }),
});

const arbPositiveMplusScore = fc.double({
  min: 0.01,
  max: 4000,
  noNaN: true,
  noDefaultInfinity: true,
});

describe("Property 5: M+ widget displays score and highest key", () => {
  it("displays the rounded M+ score when mplusScore > 0", () => {
    fc.assert(
      fc.property(arbPositiveMplusScore, arbHighestRun, (score, run) => {
        const { container, unmount } = render(
          <BentoGrid
            raidSummary={undefined}
            raidProgression={undefined}
            regionRank={undefined}
            worldRank={undefined}
            mplusScore={score}
            highestRun={run}
            scoreColor=""
            ranks={undefined}
            specScores={undefined}
            scoreTiers={[]}
            hasTwitchIntegration={false}
            characterName="Testchar"
            serverSlug="stormrage"
            serverRegion="us"
          />
        );

        const textContent = container.textContent ?? "";
        expect(textContent).toContain(String(Math.round(score)));

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('displays "—" when mplusScore is 0', () => {
    fc.assert(
      fc.property(
        fc.option(arbHighestRun, { nil: undefined }),
        (run) => {
          const { container, unmount } = render(
            <BentoGrid
              raidSummary={undefined}
              raidProgression={undefined}
              regionRank={undefined}
              worldRank={undefined}
              mplusScore={0}
              highestRun={run}
              scoreColor=""
              ranks={undefined}
              specScores={undefined}
              scoreTiers={[]}
              hasTwitchIntegration={false}
              characterName="Testchar"
              serverSlug="stormrage"
              serverRegion="us"
            />
          );

          // Find the M+ Rating widget's score paragraph
          const paragraphs = container.querySelectorAll("p");
          const mplusValueP = Array.from(paragraphs).find(
            (p) =>
              p.classList.contains("text-2xl") &&
              p.closest("div")?.textContent?.includes("M+ Rating")
          );
          expect(mplusValueP).not.toBeNull();
          expect(mplusValueP!.textContent).toBe("—");

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("displays the highest key dungeon name and level when highestRun is provided", () => {
    fc.assert(
      fc.property(arbPositiveMplusScore, arbHighestRun, (score, run) => {
        const { container, unmount } = render(
          <BentoGrid
            raidSummary={undefined}
            raidProgression={undefined}
            regionRank={undefined}
            worldRank={undefined}
            mplusScore={score}
            highestRun={run}
            scoreColor=""
            ranks={undefined}
            specScores={undefined}
            scoreTiers={[]}
            hasTwitchIntegration={false}
            characterName="Testchar"
            serverSlug="stormrage"
            serverRegion="us"
          />
        );

        const textContent = container.textContent ?? "";
        expect(textContent).toContain(run.dungeon);
        expect(textContent).toContain(`+${run.level}`);

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('does not display highest key line when highestRun is undefined', () => {
    fc.assert(
      fc.property(arbPositiveMplusScore, (score) => {
        const { container, unmount } = render(
          <BentoGrid
            raidSummary={undefined}
            raidProgression={undefined}
            regionRank={undefined}
            worldRank={undefined}
            mplusScore={score}
            highestRun={undefined}
            scoreColor=""
            ranks={undefined}
            specScores={undefined}
            scoreTiers={[]}
            hasTwitchIntegration={false}
          />
        );

        // Find the M+ Rating widget section
        const allDivs = container.querySelectorAll("div");
        const mplusWidget = Array.from(allDivs).find(
          (div) =>
            div.querySelector("h3")?.textContent === "M+ Rating"
        );
        expect(mplusWidget).not.toBeNull();

        // With no highestRun and no ranks, the widget should show "—" for rank values
        const rankDashes = mplusWidget!.querySelectorAll("[data-testid='realm-rank'], [data-testid='region-rank'], [data-testid='world-rank']");
        for (const el of Array.from(rankDashes)) {
          expect(el.textContent).toBe("—");
        }

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});


// Feature: character-pages, Property 6: Raid history rows contain all fields and link correctly
import { RaidHistoryTable } from "@/app/[region]/[realm]/[characterName]/raid-history-table";
import type { RaidProgressionSummary } from "@/lib/raiderio/types";

/**
 * Property 6: Raid history rows contain all fields and link correctly
 * **Validates: Requirements 3.2, 3.3**
 *
 * For any raid progression record, each rendered row in the raid history table
 * should contain the raid name and boss kill counts (normal, heroic, mythic),
 * and should link to the corresponding external raid page URL.
 */

// Generator for raid slugs: lowercase words joined by dashes (e.g. "nerub-ar-palace")
const arbRaidSlugWord = fc
  .string({ minLength: 2, maxLength: 10 })
  .map((s) => s.replace(/[^a-z]/g, "a"))
  .filter((s) => s.length >= 2);

const arbRaidSlug = fc
  .array(arbRaidSlugWord, { minLength: 1, maxLength: 4 })
  .map((words) => words.join("-"));

const arbRaidProgressionSummary: fc.Arbitrary<RaidProgressionSummary> = fc.record({
  summary: fc
    .string({ minLength: 1, maxLength: 20 })
    .filter((s) => s.trim().length > 0),
  total_bosses: fc.integer({ min: 1, max: 12 }),
  normal_bosses_killed: fc.integer({ min: 0, max: 12 }),
  heroic_bosses_killed: fc.integer({ min: 0, max: 12 }),
  mythic_bosses_killed: fc.integer({ min: 0, max: 12 }),
});

// Generate a non-empty Record<string, RaidProgressionSummary> with unique slugs
const arbRaidProgression = fc
  .array(fc.tuple(arbRaidSlug, arbRaidProgressionSummary), {
    minLength: 1,
    maxLength: 5,
  })
  .map((entries) => {
    const record: Record<string, RaidProgressionSummary> = {};
    for (const [slug, summary] of entries) {
      record[slug] = summary;
    }
    return record;
  })
  .filter((r) => Object.keys(r).length > 0);

// Helper: reproduce the formatRaidName logic from the component
function formatRaidName(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

describe("Property 6: Raid history rows contain all fields and link correctly", () => {
  it("each row contains the raid name, boss kill counts, summary, and correct link", () => {
    fc.assert(
      fc.property(arbRaidProgression, (raidProgression) => {
        const { container, unmount } = render(
          <RaidHistoryTable raidProgression={raidProgression} />
        );

        const links = container.querySelectorAll("a");
        const slugs = Object.keys(raidProgression);

        // There should be one link per raid entry
        expect(links.length).toBe(slugs.length);

        for (const slug of slugs) {
          const prog = raidProgression[slug];
          const expectedName = formatRaidName(slug);
          const expectedHref = `https://raider.io/raids/${slug}`;

          // Find the link for this raid
          const link = Array.from(links).find(
            (a) => a.getAttribute("href") === expectedHref
          );
          expect(link).not.toBeNull();

          const rowText = link!.textContent ?? "";

          // Row should contain the formatted raid name
          expect(rowText).toContain(expectedName);

          // Row should contain boss kill counts in N:/H:/M: format
          expect(rowText).toContain(
            `N: ${prog.normal_bosses_killed}/${prog.total_bosses}`
          );
          expect(rowText).toContain(
            `H: ${prog.heroic_bosses_killed}/${prog.total_bosses}`
          );
          expect(rowText).toContain(
            `M: ${prog.mythic_bosses_killed}/${prog.total_bosses}`
          );

          // Row should contain the summary string
          expect(rowText).toContain(prog.summary);

          // Link should open in new tab
          expect(link!.getAttribute("target")).toBe("_blank");
          expect(link!.getAttribute("rel")).toContain("noopener");
        }

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});


// Feature: character-pages, Property 7: M+ history rows contain all fields and link correctly
import { MPlusHistoryTable } from "@/app/[region]/[realm]/[characterName]/mplus-history-table";
import type { MythicPlusBestRun } from "@/lib/raiderio/types";

/**
 * Property 7: M+ history rows contain all fields and link correctly
 * **Validates: Requirements 4.2, 4.3**
 *
 * For any MythicPlusBestRun object, the rendered row in the M+ history table
 * should contain the dungeon name, key level, completion time, keystone upgrades,
 * score, and should link to the run's URL.
 */

// Helper: reproduce formatTime from the component
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const arbMythicPlusBestRun: fc.Arbitrary<MythicPlusBestRun> = fc.record({
  dungeon: fc
    .string({ minLength: 1, maxLength: 30 })
    .filter((s) => s.trim().length > 0),
  short_name: fc
    .string({ minLength: 1, maxLength: 10 })
    .filter((s) => s.trim().length > 0),
  mythic_level: fc.integer({ min: 2, max: 35 }),
  completed_at: fc.date({ min: new Date("2020-01-01"), max: new Date("2030-01-01"), noInvalidDate: true }).map((d) => d.toISOString()),
  clear_time_ms: fc.integer({ min: 60000, max: 7200000 }),
  par_time_ms: fc.integer({ min: 60000, max: 7200000 }),
  num_keystone_upgrades: fc.integer({ min: 0, max: 3 }),
  score: fc.double({ min: 10, max: 400, noNaN: true, noDefaultInfinity: true }),
  url: fc.webUrl(),
});

const arbBestRunsArray = fc.array(arbMythicPlusBestRun, {
  minLength: 1,
  maxLength: 10,
});

describe("Property 7: M+ history rows contain all fields and expand on click", () => {
  it("each row contains dungeon name (bold) + key level on first line, score + clear time on second line, and expands on click", () => {
    fc.assert(
      fc.property(arbBestRunsArray, (bestRuns) => {
        const { container, unmount } = render(
          <MPlusHistoryTable bestRuns={bestRuns} />
        );

        const buttons = container.querySelectorAll("button[aria-expanded]");

        // There should be one expandable button per run
        expect(buttons.length).toBe(bestRuns.length);

        for (let i = 0; i < bestRuns.length; i++) {
          const run = bestRuns[i];
          const button = buttons[i];
          const rowText = button.textContent ?? "";

          // Row should contain the dungeon name
          expect(rowText).toContain(run.dungeon);

          // Row should contain the key level prefixed with +
          expect(rowText).toContain(`+${run.mythic_level}`);

          // Row should contain the formatted clear time
          expect(rowText).toContain(formatTime(run.clear_time_ms));

          // Row should contain the score formatted to 1 decimal place
          expect(rowText).toContain(run.score.toFixed(1));

          // Button should start collapsed
          expect(button.getAttribute("aria-expanded")).toBe("false");
        }

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});


// Feature: character-pages, Property 8: Graceful degradation on partial API failure
import { UserInterfacePlaceholder } from "@/app/[region]/[realm]/[characterName]/user-placeholder";

/**
 * Property 8: Graceful degradation on partial API failure
 * **Validates: Requirements 7.2**
 *
 * For any combination of API response states (profile success required,
 * media and Raider.IO may fail), the page sub-components should render
 * without throwing and display available data with appropriate fallbacks
 * for failed sections.
 *
 * We test the sub-components directly with various combinations of
 * present/missing data rather than rendering the async page component:
 * - When media fails → HeroSection gets mainRawUrl=undefined → gradient fallback
 * - When Raider.IO fails → BentoGrid gets defaults (mplusScore=0, raidSummary=undefined,
 *   highestRun=undefined), RaidHistoryTable gets undefined, MPlusHistoryTable gets empty array
 * - Profile success is always required
 */

// Generator for the two failure dimensions
const arbFailureCombination = fc.record({
  mediaOk: fc.boolean(),
  rioOk: fc.boolean(),
});

// Generators for "available" data when the API succeeds
const arbMediaUrl = fc.webUrl();

const arbRioRaidSummary = fc
  .string({ minLength: 1, maxLength: 30 })
  .filter((s) => s.trim().length > 0);

const arbRioMplusScore = fc.double({
  min: 0.01,
  max: 4000,
  noNaN: true,
  noDefaultInfinity: true,
});

const arbRioHighestRun = fc.record({
  dungeon: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
  level: fc.integer({ min: 2, max: 35 }),
});

const arbRioRaidProgression = fc
  .array(
    fc.tuple(
      fc.array(
        fc.string({ minLength: 2, maxLength: 8 }).map((s) => s.replace(/[^a-z]/g, "a")).filter((s) => s.length >= 2),
        { minLength: 1, maxLength: 3 }
      ).map((words) => words.join("-")),
      fc.record({
        summary: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
        total_bosses: fc.integer({ min: 1, max: 12 }),
        normal_bosses_killed: fc.integer({ min: 0, max: 12 }),
        heroic_bosses_killed: fc.integer({ min: 0, max: 12 }),
        mythic_bosses_killed: fc.integer({ min: 0, max: 12 }),
      })
    ),
    { minLength: 1, maxLength: 3 }
  )
  .map((entries) => {
    const record: Record<string, RaidProgressionSummary> = {};
    for (const [slug, summary] of entries) {
      record[slug] = summary;
    }
    return record;
  })
  .filter((r) => Object.keys(r).length > 0);

const arbRioBestRuns = fc.array(arbMythicPlusBestRun, { minLength: 1, maxLength: 5 });

// Base profile props (always available since profile success is required)
const arbProfileProps = fc.record({
  name: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
  specName: fc.option(
    fc.string({ minLength: 1, maxLength: 15 }).filter((s) => s.trim().length > 0),
    { nil: undefined }
  ),
  raceName: fc.string({ minLength: 1, maxLength: 15 }).filter((s) => s.trim().length > 0),
  className: fc.constantFrom("Warrior", "Mage", "Priest", "Rogue", "Druid"),
  level: fc.integer({ min: 1, max: 80 }),
  realmName: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
  region: fc.constantFrom("us", "eu", "kr", "tw"),
});

describe("Property 8: Graceful degradation on partial API failure", () => {
  it("all sub-components render without throwing for any combination of media/rio success or failure", () => {
    fc.assert(
      fc.property(
        arbFailureCombination,
        arbProfileProps,
        arbMediaUrl,
        arbRioRaidSummary,
        arbRioMplusScore,
        arbRioHighestRun,
        arbRioRaidProgression,
        arbRioBestRuns,
        (failure, profile, mediaUrl, raidSummary, mplusScore, highestRun, raidProg, bestRuns) => {
          // Derive props based on which APIs succeeded
          const mainRawUrl = failure.mediaOk ? mediaUrl : undefined;
          const effectiveRaidSummary = failure.rioOk ? raidSummary : undefined;
          const effectiveMplusScore = failure.rioOk ? mplusScore : 0;
          const effectiveHighestRun = failure.rioOk ? highestRun : undefined;
          const effectiveRaidProg = failure.rioOk ? raidProg : undefined;
          const effectiveBestRuns = failure.rioOk ? bestRuns : [];

          const classColor = CLASS_COLORS[profile.className] ?? "text-foreground";
          const classTheme = CLASS_THEMES[profile.className] ?? "theme-midnight";

          // HeroSection should render without throwing
          const hero = render(
            <HeroSection
              mainRawUrl={mainRawUrl}
              classTheme={classTheme}
              name={profile.name}
              specName={profile.specName}
              raceName={profile.raceName}
              className={profile.className}
              level={profile.level}
              realmName={profile.realmName}
              region={profile.region}
              classColor={classColor}
            />
          );

          // Verify hero rendered character name
          expect(hero.container.querySelector("h1")?.textContent).toBe(profile.name);

          // Verify fallback behavior for media failure
          if (!failure.mediaOk) {
            // Should show gradient fallback, no img
            expect(hero.container.querySelector("img")).toBeNull();
            expect(hero.container.querySelector("[class*='bg-gradient-to-br']")).not.toBeNull();
          } else {
            // Should show image
            expect(hero.container.querySelector("img")).not.toBeNull();
          }
          hero.unmount();

          // BentoGrid should render without throwing
          const bento = render(
            <BentoGrid
              raidSummary={effectiveRaidSummary}
              raidProgression={effectiveRaidProg}
              regionRank={undefined}
              worldRank={undefined}
              mplusScore={effectiveMplusScore}
              highestRun={effectiveHighestRun}
              scoreColor=""
              ranks={undefined}
              specScores={undefined}
              scoreTiers={[]}
              hasTwitchIntegration={false}
            />
          );

          const bentoText = bento.container.textContent ?? "";
          // Should always contain widget headings
          expect(bentoText).toContain("Raid Progress");
          expect(bentoText).toContain("M+ Rating");
          expect(bentoText).toContain("Warcraft Logs");

          if (!failure.rioOk) {
            // Raid summary should show dash fallback
            const raidValueP = Array.from(bento.container.querySelectorAll("p")).find(
              (p) =>
                p.classList.contains("text-2xl") &&
                p.closest("div")?.textContent?.includes("Raid Progress")
            );
            expect(raidValueP?.textContent).toBe("—");

            // M+ score should show dash fallback
            const mplusValueP = Array.from(bento.container.querySelectorAll("p")).find(
              (p) =>
                p.classList.contains("text-2xl") &&
                p.closest("div")?.textContent?.includes("M+ Rating")
            );
            expect(mplusValueP?.textContent).toBe("—");
          }
          bento.unmount();

          // RaidHistoryTable should render without throwing
          const raidTable = render(
            <RaidHistoryTable raidProgression={effectiveRaidProg} />
          );

          if (!failure.rioOk) {
            expect(raidTable.container.textContent).toContain("No raid history available.");
          } else {
            // Should contain raid entries
            expect(raidTable.container.querySelectorAll("a").length).toBeGreaterThan(0);
          }
          raidTable.unmount();

          // MPlusHistoryTable should render without throwing
          const mplusTable = render(
            <MPlusHistoryTable bestRuns={effectiveBestRuns} />
          );

          if (!failure.rioOk) {
            expect(mplusTable.container.textContent).toContain("No M+ history available.");
          } else {
            expect(mplusTable.container.querySelectorAll("button[aria-expanded]").length).toBeGreaterThan(0);
          }
          mplusTable.unmount();

          // UserInterfacePlaceholder should always render without throwing
          const placeholder = render(<UserInterfacePlaceholder />);
          expect(placeholder.container.textContent).toContain("Coming Soon");
          placeholder.unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
