# Requirements Document

## Introduction

This document defines the requirements for adding Open Graph metadata to the character detail page. When a character page URL is shared on social platforms (Discord, Twitter/X, Facebook, etc.), the link preview should display the character's name, realm, region, class, race, level, and hero image. The feature leverages the existing `WoWApiClient` and the Next.js `generateMetadata` API to produce `<meta>` tags in the HTML `<head>`.

## Glossary

- **Character_Page**: The Next.js page at `app/characters/[realm]/[region]/[characterName]/page.tsx` that displays a WoW character's profile
- **GenerateMetadata**: The Next.js App Router async function export that produces a `Metadata` object for a given route
- **WoWApiClient**: The existing typed wrapper around the Battle.net WoW API located at `lib/wow-api/client.ts`
- **CharacterProfile**: The data type representing a WoW character's profile returned by the Battle.net API
- **CharacterMedia**: The data type representing a WoW character's media assets returned by the Battle.net API
- **Main_Raw_Asset**: The full-body character render image identified by `key === "main-raw"` in the `CharacterMedia.assets` array
- **OG_Tags**: Open Graph meta tags (`og:title`, `og:description`, `og:image`, etc.) embedded in the HTML `<head>`
- **Metadata_Object**: The Next.js `Metadata` type returned by `generateMetadata`, which Next.js renders as `<meta>` tags
- **Root_Layout_Metadata**: The static `metadata` export in `app/layout.tsx` that provides site-wide defaults

## Requirements

### Requirement 1: Generate Open Graph Metadata for Character Pages

**User Story:** As a user sharing a character page link, I want social platforms to display a rich preview with the character's name, details, and image, so that the shared link is informative and visually appealing.

#### Acceptance Criteria

1. WHEN a social crawler or browser requests a Character_Page, THE GenerateMetadata function SHALL return a Metadata_Object containing `title`, `description`, and `openGraph` fields
2. THE GenerateMetadata function SHALL format the title as `"{CharacterName} - {RealmName} ({REGION}) | Gamerphile"`
3. THE GenerateMetadata function SHALL format the description as `"Level {level} {RaceName} {ClassName} on {RealmName} ({REGION})"`
4. WHEN the CharacterMedia response contains a Main_Raw_Asset, THE GenerateMetadata function SHALL include the asset URL in `openGraph.images` with width 1024, height 1024, and an alt text of `"{CharacterName} character render"`
5. WHEN the CharacterMedia response contains a Main_Raw_Asset, THE GenerateMetadata function SHALL include the asset URL in `twitter.images` and set `twitter.card` to `"summary_large_image"`
6. THE GenerateMetadata function SHALL set `openGraph.type` to `"profile"` and `openGraph.siteName` to `"Gamerphile"`

### Requirement 2: Validate Route Parameters in Metadata Generation

**User Story:** As a system operator, I want metadata generation to validate route parameters, so that invalid or malicious inputs do not produce incorrect metadata.

#### Acceptance Criteria

1. WHEN the region parameter is not one of `"us"`, `"eu"`, `"kr"`, or `"tw"`, THE GenerateMetadata function SHALL return an empty Metadata_Object
2. WHEN the realm or characterName parameter does not match the pattern `/^[a-zA-Z0-9\- ]+$/`, THE GenerateMetadata function SHALL return an empty Metadata_Object
3. THE GenerateMetadata function SHALL use the same validation rules as the Character_Page component

### Requirement 3: Handle API Failures Gracefully in Metadata Generation

**User Story:** As a user sharing a character page link, I want the page to still load correctly even when API calls fail, so that a broken preview does not prevent access to the page.

#### Acceptance Criteria

1. IF the CharacterProfile API call fails or returns a non-ok result, THEN THE GenerateMetadata function SHALL return an empty Metadata_Object
2. IF the CharacterMedia API call fails or returns a non-ok result, THEN THE GenerateMetadata function SHALL return a Metadata_Object with title and description but without `openGraph.images` and `twitter.images`
3. IF the CharacterMedia response contains no Main_Raw_Asset in the assets array, THEN THE GenerateMetadata function SHALL return a Metadata_Object with title and description but without `openGraph.images` and `twitter.images`

### Requirement 4: Reuse Existing Data-Fetching Infrastructure

**User Story:** As a developer, I want metadata generation to reuse the existing WoWApiClient, so that there is no code duplication and API requests are deduplicated by Next.js.

#### Acceptance Criteria

1. THE GenerateMetadata function SHALL use the existing WoWApiClient to fetch CharacterProfile and CharacterMedia data
2. THE GenerateMetadata function SHALL create a WoWApiClient instance configured with the region from the route parameters
3. WHEN both GenerateMetadata and the Character_Page component request the same API endpoints, THE Next.js framework SHALL deduplicate the requests so that each endpoint is called only once per page render

### Requirement 5: Twitter Card Metadata

**User Story:** As a user sharing a character page link on Twitter/X, I want the preview to display a large image card, so that the character render is prominently visible.

#### Acceptance Criteria

1. WHEN a Main_Raw_Asset is available, THE GenerateMetadata function SHALL include `twitter.card` set to `"summary_large_image"`, `twitter.title`, `twitter.description`, and `twitter.images` containing the Main_Raw_Asset URL
2. WHEN no Main_Raw_Asset is available, THE GenerateMetadata function SHALL include `twitter.card`, `twitter.title`, and `twitter.description` but omit `twitter.images`
