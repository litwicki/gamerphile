# Implementation Plan: WCL Integration

## Overview

Incremental implementation of the Warcraft Logs client, RaiderIO score color coding, enhanced character page widgets, M+ history redesign, and responsive/ultrawide layout support. Each task builds on the previous, starting with data layer foundations and ending with UI wiring.

## Tasks

- [x] 1. WCL client and type definitions
  - [x] 1.1 Create WCL type definitions in `lib/wcl/types.ts`
    - Define `WCLCharacter`, `WCLEncounterRanking`, `WCLZoneRanking`, `WCLReport`, and `WCLCharacterResponse` interfaces matching the design document
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 1.2 Implement WCLClient class in `lib/wcl/client.ts`
    - Create `WCLClient` class mirroring the `WoWApiClient` OAuth2 pattern in `lib/wow-api/client.ts`
    - Implement `getAccessToken()` using client credentials grant to `https://www.warcraftlogs.com/oauth/token` reading `WCL_CLIENT_ID` and `WCL_CLIENT_SECRET` from env
    - Implement token caching with expiry check and automatic refresh
    - Implement `query<T>(query, variables)` generic GraphQL POST to `https://www.warcraftlogs.com/api/v2/client` with `Content-Type: application/json` and `Authorization: Bearer {token}`
    - Handle error responses: throw on `errors` field (first message), throw on non-200 status
    - Implement `getCharacterZoneRankings(name, serverSlug, serverRegion, zoneID?, difficulty?)` returning `WCLZoneRanking | null`
    - Implement `getCharacterEncounterRankings(name, serverSlug, serverRegion, zoneID?, difficulty?)` returning `WCLEncounterRanking[] | null`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 1.3 Write property test for WCL type round-trip consistency
    - **Property 1: WCL response round-trip**
    - Generate arbitrary valid WCL API response JSON, parse into typed interfaces, serialize back, and assert equivalence
    - **Validates: Requirements 4.5**

  - [x] 1.4 Write unit tests for WCLClient
    - Test token caching and refresh logic
    - Test GraphQL error handling (errors field, non-200 status)
    - Test `getCharacterZoneRankings` returns null when no data
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.3, 2.4, 3.6_

- [x] 2. RaiderIO score tiers and color resolution
  - [x] 2.1 Add score tier types and fetch function
    - Add `ScoreTier` interface to `lib/raiderio/types.ts` with `score` and `rgbHex` fields
    - Create `lib/raiderio/score-colors.ts` with `getScoreTiers()` function fetching from `/api/v1/mythic-plus/score-tiers` with 300s cache
    - Implement `resolveScoreColor(score, tiers)` pure function: find highest tier where `tier.score <= score`, return `rgbHex`; return empty string for score 0 or empty tiers
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.3_

  - [x] 2.2 Write property test for resolveScoreColor
    - **Property 2: Score color monotonicity**
    - For any sorted tier list and score, `resolveScoreColor` returns the color of the highest tier not exceeding the score
    - **Validates: Requirements 6.1, 6.3**

  - [x] 2.3 Write unit tests for getScoreTiers
    - Test successful fetch returns ScoreTier array
    - Test failed fetch returns empty array
    - _Requirements: 5.3, 5.4_

- [x] 3. Expand RaiderIO character profile fields
  - [x] 3.1 Add M+ rank and spec score types to `lib/raiderio/types.ts`
    - Add `MythicPlusRanks` interface with overall and per-spec `{ world, region, realm }` breakdowns
    - Add `MythicPlusSpecScore` interface with `spec`, `score`, and `ranks` fields
    - Extend `EnrichedCharacterProfile` with `mythic_plus_ranks`, `mythic_plus_scores_by_season` spec breakdown, and boss-level `raid_progression` detail
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [x] 3.2 Update `getCharacterProfile` in `lib/raiderio/client.ts`
    - Add `mythic_plus_ranks` to the fields string in the character page's `getCharacterProfile` call
    - Add `raid_progression` with boss-level detail
    - Add `mythic_plus_scores_by_season:current` with spec-level breakdown
    - _Requirements: 13.1, 13.2, 13.3_

- [x] 4. Checkpoint - Ensure data layer is solid
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. WCL API route
  - [x] 5.1 Create Next.js API route at `app/api/wcl/character/route.ts`
    - Accept `name`, `serverSlug`, `serverRegion` query parameters
    - Return 400 with JSON error if any required param is missing
    - Use `WCLClient` to fetch zone rankings and encounter rankings
    - Return JSON `{ zoneRankings, encounterRankings }` on success
    - Return 502 with JSON error on WCLClient failure
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [x] 5.2 Write unit tests for WCL API route
    - Test 400 response for missing parameters
    - Test 502 response when WCLClient throws
    - Test successful JSON response shape
    - _Requirements: 14.4, 14.5_

- [x] 6. Raid Progress widget enhancement
  - [x] 6.1 Update `RaidProgressWidget` in `app/[region]/[realm]/[characterName]/bento-grid.tsx`
    - Accept new props: `raidProgression`, `regionRank`, `worldRank`
    - Display region rank and world rank alongside the existing summary; show "—" when data is missing
    - Add "See More" button that expands to reveal a boss kill table
    - Implement Normal/Heroic/Mythic difficulty tabs using Radix Tabs
    - Disable tabs for difficulties with 0 boss kills
    - Render each boss name with killed/not-killed visual indicator for the selected difficulty
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [x] 6.2 Write unit tests for RaidProgressWidget
    - Test rank display with data and without data (dash fallback)
    - Test tab disabled state for zero-progress difficulties
    - Test boss kill table rendering
    - _Requirements: 7.2, 7.3, 7.7, 7.8_

- [x] 7. M+ Rating widget enhancement
  - [x] 7.1 Update `MPlusRatingWidget` in `app/[region]/[realm]/[characterName]/bento-grid.tsx`
    - Accept new props: `scoreColor`, `ranks`, `specScores`, `scoreTiers`
    - Display overall M+ score with resolved color from `resolveScoreColor`
    - Display Realm Rank, Region Rank, World Rank with score color applied
    - Show "—" for all ranks when no data
    - Render a Spec_Tab for each class spec using Radix Tabs with spec icon as background image
    - Clicking a spec tab updates displayed score and ranks to that spec's data
    - Disable spec tabs with score of 0
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 6.2, 6.4_

  - [x] 7.2 Write unit tests for MPlusRatingWidget
    - Test color application on score and ranks
    - Test spec tab switching updates displayed values
    - Test disabled state for specs with no data
    - _Requirements: 8.1, 8.4, 8.7_

- [x] 8. Warcraft Logs widget data integration
  - [x] 8.1 Update `WarcraftLogsWidget` in `app/[region]/[realm]/[characterName]/bento-grid.tsx`
    - Accept `characterName`, `serverSlug`, `serverRegion` props
    - Client-side fetch from `/api/wcl/character` on mount
    - Display best and median Parse_Percentile for current raid tier with WCL color coding (`resolveParseColor`)
    - Display per-encounter best Parse_Percentile list with color coding
    - Show "No Warcraft Logs data available" when WCL returns null
    - Fall back to "Coming Soon" on fetch error without exposing error details
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [x] 8.2 Write unit tests for WCLWidget
    - Test parse color mapping for each percentile range (grey, green, blue, purple, orange, pink, gold)
    - Test fallback states (no data, error)
    - _Requirements: 10.3, 10.5, 10.6_

- [x] 9. Checkpoint - Ensure all widget tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. M+ History table redesign
  - [x] 10.1 Redesign `MPlusHistoryTable` in `app/[region]/[realm]/[characterName]/mplus-history-table.tsx`
    - Render each run row with bold dungeon name + key level on first line, score + clear time on second line
    - Replace external raider.io link with click-to-expand behavior
    - On row click, expand to show a table of players in the run with name and spec
    - On player name click, open the `RunDetailModal`
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 10.2 Create `RunDetailModal` in `app/[region]/[realm]/[characterName]/run-detail-modal.tsx`
    - Use Radix Dialog for the modal
    - Display player role, character name, item level, trinkets, tier set pieces, talent summary, and score
    - Implement cog icon settings menu with actions: "Copy Talents" (clipboard API), "Character Profile" (navigate to Gamerphile character page), "View Gear" (display equipped items), "Videos" (display video links)
    - _Requirements: 9.5, 9.6, 9.7, 9.8, 9.9, 9.10_

  - [x] 10.3 Write unit tests for MPlusHistoryTable and RunDetailModal
    - Test row expand/collapse behavior
    - Test modal opens with correct player data
    - Test "Copy Talents" copies to clipboard
    - Test navigation to character profile
    - _Requirements: 9.3, 9.4, 9.5, 9.7, 9.8_

- [x] 11. Mobile responsive hero section
  - [x] 11.1 Update `HeroSection` in `app/[region]/[realm]/[characterName]/hero-section.tsx`
    - Add responsive styles: below 768px, render character image at 50vh height
    - Overlay character name, spec, race, class, realm/region text on the image at mobile breakpoint
    - Apply gradient scrim over lower portion for text readability on mobile
    - Preserve existing desktop layout at 768px and above
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 11.2 Write unit tests for mobile HeroSection
    - Test that mobile-specific CSS classes are applied
    - Test gradient scrim element is present
    - _Requirements: 11.1, 11.3_

- [x] 12. Ultrawide layout support
  - [x] 12.1 Update character page layout for ultrawide mode
    - In `app/[region]/[realm]/[characterName]/page.tsx`, use the `--max-viewport` CSS variable (set by `UltrawideProvider`) for `max-w` on the content container
    - Update `BentoGrid` to adjust grid layout for wider viewport
    - Update `MPlusHistoryTable` and `RaidProgressWidget` to expand to fill wider content area
    - Ensure 1280px constraint when ultrawide is disabled
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 12.2 Write unit tests for ultrawide layout
    - Test max-width changes when ultrawide is toggled
    - _Requirements: 12.1, 12.4_

- [x] 13. Wire everything together on the character page
  - [x] 13.1 Update `app/[region]/[realm]/[characterName]/page.tsx` to pass all new data
    - Fetch score tiers via `getScoreTiers()` in the server component
    - Resolve overall score color via `resolveScoreColor`
    - Pass `raidProgression`, `regionRank`, `worldRank` to `RaidProgressWidget`
    - Pass `scoreColor`, `ranks`, `specScores`, `scoreTiers` to `MPlusRatingWidget`
    - Pass `characterName`, `serverSlug`, `serverRegion` to `WCLWidget`
    - Apply score color to M+ score display in `MPlusHistoryTable` run scores
    - _Requirements: 6.2, 6.4, 7.1, 8.1, 10.1, 13.1, 13.2, 13.3_

- [x] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The WCLClient mirrors the existing WoWApiClient OAuth2 pattern in `lib/wow-api/client.ts`
- All TypeScript throughout — the design document uses TypeScript exclusively
- Property tests validate universal correctness properties; unit tests validate specific examples and edge cases
