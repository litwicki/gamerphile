# Tasks

## Task 1: Implement `generateMetadata` export

- [x] 1.1 Add `generateMetadata` async function to `app/characters/[realm]/[region]/[characterName]/page.tsx` that validates route params, fetches character profile and media via `WoWApiClient`, and returns a `Metadata` object with title, description, openGraph, and twitter fields
- [x] 1.2 Handle API failure cases: return `{}` when profile fails; omit images when media fails or `main-raw` asset is missing
- [x] 1.3 Verify no TypeScript errors in the updated page file

## Task 2: Unit tests for `generateMetadata`

- [x] 2.1 Add unit tests to verify correct title format, description format, OG image URL, and twitter card fields for a successful API response
- [x] 2.2 Add unit tests for graceful degradation: profile API failure returns `{}`, media API failure omits images, missing `main-raw` asset omits images
- [x] 2.3 Add unit tests for invalid route parameters returning `{}`

## Task 3: Property-based tests for `generateMetadata`

- [x] 3.1 [PBT] Property 1 — Metadata text formatting: for any valid character profile, title and description follow the specified format patterns (Validates: Requirements 1.2, 1.3)
- [x] 3.2 [PBT] Property 2 — Image metadata inclusion: for any valid profile and media with a main-raw asset, OG and twitter image fields are correctly populated (Validates: Requirements 1.4, 1.5, 5.1)
- [x] 3.3 [PBT] Property 3 — Invalid parameters yield empty metadata: for any invalid region, realm, or characterName, generateMetadata returns `{}` (Validates: Requirements 2.1, 2.2)
- [x] 3.4 [PBT] Property 4 — Profile failure yields empty metadata: for any profile API error, generateMetadata returns `{}` (Validates: Requirement 3.1)
- [x] 3.5 [PBT] Property 5 — Missing image graceful degradation: for any valid profile without a main-raw asset, metadata has title/description but no images (Validates: Requirements 3.2, 3.3, 5.2)
