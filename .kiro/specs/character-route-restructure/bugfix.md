# Bugfix Requirements Document

## Introduction

The character detail pages use an incorrect URL structure. The current route pattern places the realm before the region and nests under a `/characters` prefix (`/characters/[realm]/[region]/[characterName]`), while the desired convention is `/{region}/{realm}/{characterName}` — region first, no prefix. Additionally, the older route at `app/[realm]/[region]/[character]` also has realm before region. The link on the characters list page (`app/characters/page.tsx`) constructs URLs as `/{realm}/us/{name}`, which follows neither the current detailed page route nor the desired structure. This restructuring affects the Next.js file-system routing directories, all internal links pointing to character pages, and related test imports/assertions.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user navigates to a character detail page THEN the system uses the URL pattern `/characters/{realm}/{region}/{characterName}`, placing realm before region and including a `/characters` prefix

1.2 WHEN the characters list page links to a character detail page THEN the system constructs the URL as `/{realm}/us/{name}`, which routes to the older `app/[realm]/[region]/[character]` page instead of the full-featured character detail page

1.3 WHEN the older character route at `app/[realm]/[region]/[character]` is accessed THEN the system renders a basic profile page with realm before region in the URL, inconsistent with the desired `/{region}/{realm}/{characterName}` pattern

### Expected Behavior (Correct)

2.1 WHEN a user navigates to a character detail page THEN the system SHALL use the URL pattern `/{region}/{realm}/{characterName}`, placing region before realm with no `/characters` prefix

2.2 WHEN the characters list page links to a character detail page THEN the system SHALL construct the URL as `/{region}/{realm}/{name}` and route to the full-featured character detail page

2.3 WHEN any internal link or redirect references a character page THEN the system SHALL use the `/{region}/{realm}/{characterName}` URL pattern consistently

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user navigates to the characters list page at `/characters` THEN the system SHALL CONTINUE TO display the authenticated user's character list with filtering and sorting

3.2 WHEN a user navigates to the home page, news, guilds, UI, or any non-character route THEN the system SHALL CONTINUE TO render those pages without any changes

3.3 WHEN the character detail page receives valid region, realm, and characterName parameters THEN the system SHALL CONTINUE TO fetch and display the character profile, media, and Raider.IO data correctly

3.4 WHEN the character detail page receives invalid parameters (bad region, empty realm, special characters) THEN the system SHALL CONTINUE TO return a not-found response

3.5 WHEN the app bar navigation links to `/characters` THEN the system SHALL CONTINUE TO navigate to the characters list page
