# Character Route Restructure Bugfix Design

## Overview

The character detail pages use an incorrect URL structure. Two route directories exist with realm-before-region ordering: `app/characters/[realm]/[region]/[characterName]` (full-featured page) and `app/[realm]/[region]/[character]` (basic page). The characters list page constructs links as `/{realm}/us/{name}`, routing to the basic page instead of the full-featured one. The fix restructures all character routes to `/{region}/{realm}/{characterName}` — region first, no `/characters` prefix — and consolidates both route directories into a single `app/[region]/[realm]/[characterName]` directory.

## Glossary

- **Bug_Condition (C)**: Any URL or internal link that uses the old character route patterns (`/characters/{realm}/{region}/{characterName}` or `/{realm}/{region}/{character}`)
- **Property (P)**: All character detail URLs and internal links use the pattern `/{region}/{realm}/{characterName}` with region first and no prefix
- **Preservation**: The characters list page at `/characters`, non-character routes, character data fetching, parameter validation, and all component rendering must remain unchanged
- **CharacterDetailPage**: The full-featured page component in `app/characters/[realm]/[region]/[characterName]/page.tsx` with hero section, bento grid, raid/M+ tables
- **CharacterPage**: The basic page component in `app/[realm]/[region]/[character]/page.tsx` with simple profile display
- **VALID_REGIONS**: The set `{"us", "eu", "kr", "tw"}` used for URL parameter validation

## Bug Details

### Bug Condition

The bug manifests when any character detail URL is constructed or navigated to. The file-system routing directories place `[realm]` before `[region]`, and the full-featured page is nested under a `/characters` prefix. The characters list page links to the basic page instead of the full-featured one.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { url: string, source: "route_directory" | "internal_link" }
  OUTPUT: boolean

  IF input.source == "route_directory" THEN
    RETURN input.url MATCHES "/characters/[realm]/[region]/[characterName]"
           OR input.url MATCHES "/[realm]/[region]/[character]"
  END IF

  IF input.source == "internal_link" THEN
    RETURN input.url MATCHES "/{realm}/{region}/{name}"
           OR input.url MATCHES "/characters/{realm}/{region}/{characterName}"
           OR input.url STARTS_WITH "/{non_region_value}/"
  END IF

  RETURN false
END FUNCTION
```

### Examples

- Navigating to `/characters/tichondrius/us/arthas` renders the full-featured page but with realm before region and a `/characters` prefix — expected: `/us/tichondrius/arthas`
- Navigating to `/tichondrius/us/arthas` renders the basic page with realm before region — expected: `/us/tichondrius/arthas` rendering the full-featured page
- Characters list page links to `/tichondrius/us/arthas` (basic page) — expected: link to `/us/tichondrius/arthas` (full-featured page)
- Navigating to `/eu/argent-dawn/legolas` should render the full-featured character detail page — currently returns 404

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- The characters list page at `/characters` must continue to display the authenticated user's character list with filtering and sorting
- All non-character routes (home, news, guilds, UI, signin, account, profile, API routes) must remain unchanged
- Character data fetching via `WoWApiClient` and `getCharacterProfile` must continue to work correctly with the same realm/characterName parameters
- Parameter validation (VALID_REGIONS check, PARAM_PATTERN regex, empty string checks) must continue to reject invalid inputs with not-found responses
- All character detail sub-components (HeroSection, BentoGrid, RaidHistoryTable, MPlusHistoryTable, UserInterfacePlaceholder, CharacterTheme) must render identically
- The `generateMetadata` function must continue to produce correct OpenGraph/Twitter metadata
- Navigation links to `/characters` in the app bar, footer, and avatar menu must continue to work

**Scope:**
All inputs that do NOT involve character detail page URL routing should be completely unaffected by this fix. This includes:
- The `/characters` list page itself (only the link href within it changes)
- All API routes (`/api/wow/characters`, `/api/raiderio/*`, etc.)
- All non-character pages (home, news, guilds, UI, signin, etc.)
- Middleware behavior
- Authentication flows

## Hypothesized Root Cause

Based on the bug description, the issues are:

1. **Incorrect Route Directory Structure**: The Next.js file-system routing directories use `[realm]/[region]` ordering instead of `[region]/[realm]`:
   - `app/characters/[realm]/[region]/[characterName]/` has realm first + `/characters` prefix
   - `app/[realm]/[region]/[character]/` has realm first

2. **Incorrect Link Construction in Characters List**: `app/characters/page.tsx` constructs links as `` `/${char.realm.slug}/us/${char.name.toLowerCase()}` `` which hardcodes "us" as region and puts realm first, routing to the basic page instead of the full-featured one

3. **Duplicate Route Directories**: Two separate route directories exist for character detail pages, causing confusion about which page renders and with what URL pattern

4. **Parameter Name Inconsistency**: The old basic route uses `[character]` while the full-featured route uses `[characterName]`, and the params destructuring in each page reflects this inconsistency

## Correctness Properties

Property 1: Bug Condition - Character URLs Use Region-First Pattern

_For any_ character detail URL where a valid region, realm, and character name are provided, the route structure SHALL resolve to `/{region}/{realm}/{characterName}` and render the full-featured character detail page with hero section, bento grid, and detail tables.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Non-Character Routes and Data Fetching Unchanged

_For any_ input that is NOT a character detail URL (characters list page, home, news, guilds, API routes, etc.), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing functionality including the characters list page display, navigation links, and character data fetching logic.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**1. Create new route directory: `app/[region]/[realm]/[characterName]/`**

Move all files from `app/characters/[realm]/[region]/[characterName]/` to `app/[region]/[realm]/[characterName]/`, swapping the parameter order and removing the `/characters` prefix. Files to move:
- `page.tsx` (full-featured character detail page + `generateMetadata`)
- `hero-section.tsx`
- `bento-grid.tsx`
- `raid-history-table.tsx`
- `mplus-history-table.tsx`
- `user-placeholder.tsx`
- `character-theme.tsx`
- `loading.tsx`
- `not-found.tsx`

**2. Update parameter destructuring in page.tsx**

The `params` type and destructuring in `page.tsx` (both the page component and `generateMetadata`) currently use `{ realm, region, characterName }`. After the directory rename, the parameter names from the file-system route `[region]/[realm]/[characterName]` will naturally provide `region` first, but the destructured object keys remain the same — no code change needed for destructuring since Next.js params are keyed by directory name, not order.

**3. Fix link construction in `app/characters/page.tsx`**

Change the href from:
```
`/${char.realm.slug}/us/${char.name.toLowerCase()}`
```
to:
```
`/${region}/${char.realm.slug}/${char.name.toLowerCase()}`
```
This requires making the region available in the characters list page. Currently the region is hardcoded as "us". The region should come from the app's RegionProvider context or default to a sensible value.

**4. Delete old route directories**

- Delete `app/characters/[realm]/[region]/[characterName]/` (all files moved to new location)
- Delete `app/[realm]/[region]/[character]/` (basic page superseded by full-featured page)

**5. Update test imports**

Update all test files that import from the old paths:
- `__tests__/unit/character-pages.test.tsx`: Update imports from `@/app/characters/[realm]/[region]/[characterName]/*` to `@/app/[region]/[realm]/[characterName]/*`
- `__tests__/unit/character-og-metadata.test.ts`: Update import of `generateMetadata`
- `__tests__/unit/character-page.test.tsx`: Update import of `CharacterLoading` from old basic route
- `__tests__/property/character-pages-properties.test.tsx`: Update all component imports
- `__tests__/property/character-og-metadata-properties.test.ts`: Update `generateMetadata` import
- `__tests__/property/route-properties.test.tsx`: Update `CharacterPage` import
- `__tests__/property/character-page-properties.test.tsx`: Update `CharacterPage` import

**6. Update internal "Back to Characters" links**

In the new `app/[region]/[realm]/[characterName]/page.tsx` and `not-found.tsx`, the `href="/characters"` links remain correct (they point to the list page).

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that verify the route directory structure and link construction. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Route Resolution Test**: Verify that navigating to `/{region}/{realm}/{characterName}` renders the full-featured character detail page (will fail on unfixed code — returns 404)
2. **Link Construction Test**: Verify that the characters list page constructs links as `/{region}/{realm}/{name}` (will fail on unfixed code — constructs `/{realm}/us/{name}`)
3. **Parameter Order Test**: Verify that the page component receives `region` as a valid region value from the first URL segment (will fail on unfixed code — first segment is realm)
4. **Consolidated Route Test**: Verify only one character detail route exists (will fail on unfixed code — two routes exist)

**Expected Counterexamples**:
- `/{region}/{realm}/{characterName}` URLs return 404 because no route directory matches
- Characters list page links route to the basic page instead of the full-featured page
- Possible causes: incorrect directory naming, incorrect parameter order in file-system routing

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := resolveRoute_fixed(input.region, input.realm, input.characterName)
  ASSERT result.rendersFullFeaturedPage == true
  ASSERT result.urlPattern == "/{region}/{realm}/{characterName}"
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT resolveRoute_original(input) = resolveRoute_fixed(input)
  ASSERT characterDataFetching_original(input) = characterDataFetching_fixed(input)
  ASSERT componentRendering_original(input) = componentRendering_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for character data fetching and component rendering, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Data Fetching Preservation**: Verify that `WoWApiClient.getCharacterProfile(realm, characterName)` continues to be called with the same parameters regardless of URL order
2. **Component Rendering Preservation**: Verify that HeroSection, BentoGrid, RaidHistoryTable, MPlusHistoryTable render identically with the same props
3. **Metadata Preservation**: Verify that `generateMetadata` produces the same OpenGraph/Twitter metadata for the same character data
4. **Validation Preservation**: Verify that invalid parameters (bad region, empty realm, special characters) still trigger not-found responses

### Unit Tests

- Test that the new route directory `app/[region]/[realm]/[characterName]/page.tsx` renders correctly with valid params
- Test that invalid parameters still trigger not-found in the new route structure
- Test that the characters list page link href uses `/{region}/{realm}/{name}` format
- Test that all sub-components (HeroSection, BentoGrid, etc.) still render correctly from new import paths

### Property-Based Tests

- Generate random valid (region, realm, characterName) tuples and verify the page renders the full-featured layout
- Generate random invalid parameters and verify not-found behavior is preserved
- Generate random character profiles and verify metadata generation is unchanged

### Integration Tests

- Test full navigation flow: characters list → character detail page via new URL pattern
- Test that "Back to Characters" links on the detail page navigate correctly
- Test that direct URL access to `/{region}/{realm}/{characterName}` renders the full-featured page
