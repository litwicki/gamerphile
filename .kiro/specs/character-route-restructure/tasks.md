# Tasks

## Task 1: Create new route directory structure

- [x] 1.1 Create `app/[region]/[realm]/[characterName]/` directory and move `page.tsx` from `app/characters/[realm]/[region]/[characterName]/page.tsx`, keeping all existing logic (generateMetadata, CharacterDetailPage, validation, data fetching) unchanged
- [x] 1.2 Move `hero-section.tsx`, `bento-grid.tsx`, `character-theme.tsx`, `raid-history-table.tsx`, `mplus-history-table.tsx`, `user-placeholder.tsx` from `app/characters/[realm]/[region]/[characterName]/` to `app/[region]/[realm]/[characterName]/`
- [x] 1.3 Move `loading.tsx` and `not-found.tsx` from `app/characters/[realm]/[region]/[characterName]/` to `app/[region]/[realm]/[characterName]/`

## Task 2: Fix link construction in characters list page

- [x] 2.1 Update `app/characters/page.tsx` to construct character detail links as `/{region}/{realm}/{name}` instead of `/{realm}/us/{name}`, using the region from context or a sensible default

## Task 3: Delete old route directories

- [x] 3.1 Delete the old `app/characters/[realm]/[region]/[characterName]/` directory and all its files (now moved to new location)
- [x] 3.2 Delete the old `app/[realm]/[region]/[character]/` directory and all its files (basic page superseded by full-featured page)

## Task 4: Update test imports and assertions

- [x] 4.1 Update `__tests__/unit/character-pages.test.tsx` to import components from `@/app/[region]/[realm]/[characterName]/*` instead of `@/app/characters/[realm]/[region]/[characterName]/*`
- [x] 4.2 Update `__tests__/unit/character-og-metadata.test.ts` to import `generateMetadata` from `@/app/[region]/[realm]/[characterName]/page`
- [x] 4.3 Update `__tests__/unit/character-page.test.tsx` to import `CharacterLoading` from `@/app/[region]/[realm]/[characterName]/loading` instead of `@/app/[realm]/[region]/[character]/loading`
- [x] 4.4 Update `__tests__/property/character-pages-properties.test.tsx` to import all components from `@/app/[region]/[realm]/[characterName]/*`
- [x] 4.5 Update `__tests__/property/character-og-metadata-properties.test.ts` to import `generateMetadata` from `@/app/[region]/[realm]/[characterName]/page`
- [x] 4.6 Update `__tests__/property/route-properties.test.tsx` to import `CharacterPage` from `@/app/[region]/[realm]/[characterName]/page` and update param structure
- [x] 4.7 Update `__tests__/property/character-page-properties.test.tsx` to import `CharacterPage` from `@/app/[region]/[realm]/[characterName]/page` and update param structure
- [x] 4.8 Update `app/[realm]/[region]/[character]/page.test.tsx` — move or rewrite as `app/[region]/[realm]/[characterName]/page.test.tsx` with updated imports and param structure

## Task 5: Verify no regressions

- [x] 5.1 Run all existing tests to confirm no regressions from the route restructure
