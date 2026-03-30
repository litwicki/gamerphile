# Implementation Plan: Character Pages Redesign

## Overview

Decompose the monolithic character page into presentational sub-components (HeroSection, BentoGrid, RaidHistoryTable, MPlusHistoryTable, UserInterfacePlaceholder), rewrite the main page to compose them, update the loading skeleton, and add property-based and unit tests. All components are TypeScript/React server components using Tailwind CSS.

## Tasks

- [x] 1. Create HeroSection component
  - [x] 1.1 Create `app/characters/[realm]/[region]/[characterName]/hero-section.tsx`
    - Implement `HeroSectionProps` interface as defined in design
    - Render a `h-[40vh]` container with `overflow-hidden` and `relative` positioning
    - If `mainRawUrl` is provided, render an `img` with `object-cover absolute inset-0` and CSS parallax via `background-attachment: fixed` wrapper
    - If `mainRawUrl` is absent, render a gradient fallback using the class theme's primary color
    - Overlay character identity (name, spec, race, class, level, realm, region) at bottom-left with dark gradient scrim
    - Apply `classColor` to the character name text
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 1.2 Write property test for HeroSection asset selection (Property 1)
    - **Property 1: Asset selection with fallback**
    - Generate random arrays of `{key, value}` assets, some with "main-raw", some without
    - Verify hero uses main-raw URL when present, gradient fallback when absent
    - **Validates: Requirements 1.2, 1.4**

  - [x] 1.3 Write property test for HeroSection identity overlay (Property 2)
    - **Property 2: Hero overlay contains all character identity fields**
    - Generate random character profile objects with varying name/spec/race/class/level/realm/region
    - Verify all identity fields appear in rendered output
    - **Validates: Requirements 1.5**

  - [x] 1.4 Write property test for class-to-theme mapping (Property 3)
    - **Property 3: Class-to-theme mapping**
    - Generate random class names from the valid set of 13 playable classes
    - Verify each maps to the correct `theme-{class}` CSS class and `text-{class}` color class
    - **Validates: Requirements 1.6**

- [x] 2. Create BentoGrid component
  - [x] 2.1 Create `app/characters/[realm]/[region]/[characterName]/bento-grid.tsx`
    - Implement `BentoGridProps` interface as defined in design
    - Position with `-mt-16` to overlap hero section bottom
    - Use CSS Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (or `lg:grid-cols-3` when Twitch hidden)
    - Render RaidProgressWidget showing raid summary or "—" fallback
    - Render WarcraftLogsWidget showing "Coming Soon" placeholder
    - Render MPlusRatingWidget showing M+ score and highest key or "—" fallback
    - Conditionally render TwitchWidget based on `hasTwitchIntegration` prop
    - Each widget uses `bg-card/80 backdrop-blur-sm border border-border rounded-lg`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 2.2 Write property test for raid widget summary (Property 4)
    - **Property 4: Raid widget displays progression summary**
    - Generate random `RaidProgressionSummary` objects
    - Verify the widget displays the summary string of the current raid tier
    - **Validates: Requirements 2.3**

  - [x] 2.3 Write property test for M+ widget score and key (Property 5)
    - **Property 5: M+ widget displays score and highest key**
    - Generate random season scores and best run arrays
    - Verify widget displays current season score and highest key dungeon/level
    - **Validates: Requirements 2.5**

- [x] 3. Checkpoint - Verify hero and bento grid build
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create RaidHistoryTable component
  - [x] 4.1 Create `app/characters/[realm]/[region]/[characterName]/raid-history-table.tsx`
    - Implement `RaidHistoryTableProps` interface as defined in design
    - Render a table/list of raid tiers with columns: raid name, difficulty breakdown (N/H/M kills), summary
    - Each row links to the Raider.IO raid page for that character
    - Empty state: "No raid history available."
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.2 Write property test for raid history rows (Property 6)
    - **Property 6: Raid history rows contain all fields and link correctly**
    - Generate random `Record<string, RaidProgressionSummary>` objects
    - Verify each row contains raid name, boss kill counts, and links to external page
    - **Validates: Requirements 3.2, 3.3**

- [x] 5. Create MPlusHistoryTable component
  - [x] 5.1 Create `app/characters/[realm]/[region]/[characterName]/mplus-history-table.tsx`
    - Implement `MPlusHistoryTableProps` interface as defined in design
    - Render a table/list of M+ runs with columns: dungeon name, key level, time, upgrades, score
    - Each row links to the run URL from Raider.IO (`run.url`)
    - Empty state: "No M+ history available."
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 5.2 Write property test for M+ history rows (Property 7)
    - **Property 7: M+ history rows contain all fields and link correctly**
    - Generate random `MythicPlusBestRun` objects
    - Verify each row contains dungeon name, key level, time, upgrades, score, and links to run URL
    - **Validates: Requirements 4.2, 4.3**

- [x] 6. Create UserInterfacePlaceholder component
  - [x] 6.1 Create `app/characters/[realm]/[region]/[characterName]/user-placeholder.tsx`
    - Render a styled card matching the visual style of adjacent columns
    - Display "Coming Soon" heading and brief description text
    - Use same `card` styling pattern (border, background, shadow) as other sections
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 7. Checkpoint - Verify all sub-components build
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Rewrite main page.tsx to compose all new components
  - [x] 8.1 Rewrite `app/characters/[realm]/[region]/[characterName]/page.tsx`
    - Keep existing data fetching logic (WoW API + Raider.IO via `Promise.allSettled`)
    - Keep existing param validation and error handling
    - Extract `mainRawUrl` from media assets: `assets.find(a => a.key === "main-raw")?.value`
    - Derive `highestRun` from `mythic_plus_best_runs` (run with max `mythic_level`)
    - Replace inline JSX with composed sub-components: `HeroSection`, `BentoGrid`, `RaidHistoryTable`, `MPlusHistoryTable`, `UserInterfacePlaceholder`
    - Arrange detail section in three-column responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
    - Keep `CharacterTheme` client component usage
    - Keep "Back to Characters" link
    - _Requirements: 1.1, 1.2, 1.5, 1.6, 6.1, 6.2, 6.3, 7.2, 7.3_

  - [x] 8.2 Write property test for graceful degradation (Property 8)
    - **Property 8: Graceful degradation on partial API failure**
    - Generate random combinations of success/failure for each API call (profile success required)
    - Verify page renders without throwing and displays available data with inline error indicators for failed sections
    - **Validates: Requirements 7.2**

- [ ] 9. Update loading skeleton
  - [x] 9.1 Update `app/characters/[realm]/[region]/[characterName]/loading.tsx`
    - Hero skeleton: `h-[40vh]` animated pulse block
    - Bento grid skeleton: row of 3-4 cards with `-mt-16` negative margin overlap
    - Three-column skeleton below matching the detail section layout
    - _Requirements: 7.1_

- [x] 10. Write unit tests for all new components
  - [x] 10.1 Write unit tests in `__tests__/unit/character-pages.test.tsx`
    - Test HeroSection renders gradient fallback when no media assets exist
    - Test HeroSection renders with main-raw image when available
    - Test BentoGrid renders 3 widgets when Twitch is disabled
    - Test WarcraftLogs widget shows "Coming Soon"
    - Test RaidHistoryTable shows "No raid history available." for empty data
    - Test MPlusHistoryTable shows "No M+ history available." for empty data
    - Test UserInterfacePlaceholder renders "Coming Soon" text
    - Test loading skeleton matches new layout structure (hero + bento + three columns)
    - _Requirements: 1.2, 1.4, 2.4, 3.5, 4.5, 5.2, 7.1_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with Vitest (already in devDependencies)
- Property test file: `__tests__/property/character-pages-properties.test.tsx`
- Unit test file: `__tests__/unit/character-pages.test.tsx`
- All new sub-components are server components (no client-side state needed)
- Parallax effect uses pure CSS (`background-attachment: fixed`), no client-side scroll listeners
- Checkpoints ensure incremental validation throughout implementation
