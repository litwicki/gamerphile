# Requirements Document

## Introduction

This feature set adds Warcraft Logs (WCL) API integration, RaiderIO M+ score color coding, enhanced character page widgets (Raid Progress, M+ Rating, M+ History, Warcraft Logs), and responsive/ultrawide layout improvements to the Gamerphile character page. The WCL client uses the v2 GraphQL API to query character parse data. RaiderIO score tiers drive color-coded M+ ratings. Each bento grid widget and history table is upgraded with richer data, expandable details, and spec-based tabs.

## Glossary

- **WCL_Client**: The server-side Warcraft Logs v2 GraphQL API client that authenticates via OAuth2 client credentials and executes queries against `https://www.warcraftlogs.com/api/v2/client`
- **WCL_API**: The Warcraft Logs v2 GraphQL endpoint at `https://www.warcraftlogs.com/api/v2/client`
- **RaiderIO_Client**: The existing server-side client that queries the Raider.IO REST API (`https://raider.io/api/v1/...`)
- **Score_Tier**: A RaiderIO score tier object containing a score threshold and an associated RGB color, fetched from the `/api/v1/mythic-plus/score-tiers` endpoint
- **Character_Page**: The Next.js page at `app/[region]/[realm]/[characterName]/page.tsx` that renders a WoW character's profile
- **Bento_Grid**: The widget grid component rendered on the Character_Page containing Raid Progress, Warcraft Logs, M+ Rating, and Twitch cards
- **Raid_Progress_Widget**: The Bento_Grid card displaying raid progression summary, region/world rank, and expandable boss kill details
- **MPlus_Rating_Widget**: The Bento_Grid card displaying M+ score with color coding, rankings, and spec tabs
- **MPlus_History_Table**: The table component listing a character's best M+ runs with expandable player details
- **WCL_Widget**: The Bento_Grid card displaying Warcraft Logs parse data for a character
- **Hero_Section**: The top section of the Character_Page showing the character render image and identity overlay
- **Run_Detail_Modal**: A dialog component that displays full details for a specific M+ run including player roles, gear, talents, and action menu
- **Spec_Tab**: A tab element within the MPlus_Rating_Widget whose background displays the spec icon image
- **Parse_Percentile**: A numeric value (0–100) representing a character's overall performance ranking on Warcraft Logs for a given encounter or metric
- **Ultrawide_Provider**: The existing React context provider that toggles the max viewport width between 1280px and 1920px

## Requirements

### Requirement 1: WCL OAuth2 Authentication

**User Story:** As a developer, I want the WCL_Client to authenticate with the Warcraft Logs v2 API using OAuth2 client credentials, so that the application can make authorized GraphQL queries.

#### Acceptance Criteria

1. WHEN the WCL_Client is initialized, THE WCL_Client SHALL obtain an OAuth2 access token from `https://www.warcraftlogs.com/oauth/token` using the client credentials grant type with the configured client ID and client secret
2. WHILE the access token is valid (not expired), THE WCL_Client SHALL reuse the cached token for subsequent requests
3. WHEN the access token has expired, THE WCL_Client SHALL automatically obtain a new access token before executing the next query
4. IF the OAuth2 token request fails, THEN THE WCL_Client SHALL throw an error containing the HTTP status code and response message
5. THE WCL_Client SHALL read the client ID from the `WCL_CLIENT_ID` environment variable and the client secret from the `WCL_CLIENT_SECRET` environment variable

### Requirement 2: WCL GraphQL Query Execution

**User Story:** As a developer, I want the WCL_Client to execute GraphQL queries against the WCL v2 API, so that I can retrieve character log data.

#### Acceptance Criteria

1. WHEN a GraphQL query and variables are provided, THE WCL_Client SHALL send an authenticated POST request to `https://www.warcraftlogs.com/api/v2/client` with the query and variables as the JSON body
2. WHEN the WCL_API returns a successful response, THE WCL_Client SHALL return the parsed `data` field from the response JSON
3. IF the WCL_API returns a response with a `errors` field, THEN THE WCL_Client SHALL throw an error containing the first error message from the errors array
4. IF the WCL_API returns a non-200 HTTP status, THEN THE WCL_Client SHALL throw an error containing the HTTP status code and status text
5. THE WCL_Client SHALL set the `Content-Type` header to `application/json` and the `Authorization` header to `Bearer {access_token}` on every request

### Requirement 3: WCL Character Data Queries

**User Story:** As a developer, I want to query character-specific data from Warcraft Logs, so that I can display parse performance on the character page.

#### Acceptance Criteria

1. WHEN a character name, server slug, and server region are provided, THE WCL_Client SHALL query the character's recent reports using the `characterData.character` GraphQL field
2. WHEN character encounter rankings are requested, THE WCL_Client SHALL query the `encounterRankings` field for the specified character, returning Parse_Percentile values per encounter
3. WHEN zone rankings are requested, THE WCL_Client SHALL query the `zoneRankings` field for the specified character, returning overall best and median performance percentiles
4. THE WCL_Client SHALL accept an optional `zoneID` parameter to filter rankings to a specific raid tier
5. THE WCL_Client SHALL accept an optional `difficulty` parameter (1=LFR, 2=Flex, 3=Normal, 4=Heroic, 5=Mythic) to filter encounter and zone rankings
6. IF the WCL_API returns no data for the specified character, THEN THE WCL_Client SHALL return null

### Requirement 4: WCL Response Type Definitions

**User Story:** As a developer, I want typed interfaces for all WCL API responses, so that the codebase has type safety for Warcraft Logs data.

#### Acceptance Criteria

1. THE WCL_Client SHALL export a `WCLCharacter` interface containing name, server slug, server region, and class ID fields
2. THE WCL_Client SHALL export a `WCLEncounterRanking` interface containing encounter name, encounter ID, Parse_Percentile, spec, difficulty, and report code fields
3. THE WCL_Client SHALL export a `WCLZoneRanking` interface containing zone name, zone ID, best Parse_Percentile, median Parse_Percentile, and difficulty fields
4. THE WCL_Client SHALL export a `WCLReport` interface containing report code, title, start time, end time, and zone ID fields
5. FOR ALL valid WCL API response JSON, parsing into the typed interfaces and serializing back to JSON SHALL produce an equivalent object (round-trip property)

### Requirement 5: RaiderIO Score Tier Fetching

**User Story:** As a developer, I want to fetch M+ score color tiers from RaiderIO, so that M+ ratings can be displayed with the correct color coding.

#### Acceptance Criteria

1. WHEN score tiers are requested, THE RaiderIO_Client SHALL fetch the current season's score tiers from the `/api/v1/mythic-plus/score-tiers` endpoint
2. THE RaiderIO_Client SHALL cache the score tier response for a minimum of 300 seconds to avoid excessive API calls
3. THE RaiderIO_Client SHALL return an array of Score_Tier objects, each containing a `score` threshold and `rgbHex` color string
4. IF the score tiers API request fails, THEN THE RaiderIO_Client SHALL return an empty array

### Requirement 6: M+ Score Color Resolution

**User Story:** As a user, I want M+ ratings displayed with color coding matching the RaiderIO color scheme, so that I can quickly assess rating quality at a glance.

#### Acceptance Criteria

1. WHEN an M+ score value and a list of Score_Tier objects are provided, THE Character_Page SHALL determine the color by finding the highest Score_Tier whose score threshold is less than or equal to the given score
2. WHEN the resolved color is applied, THE Character_Page SHALL render the M+ score text using the resolved `rgbHex` value as the CSS `color` property
3. IF the score is 0 or the Score_Tier list is empty, THEN THE Character_Page SHALL render the M+ score text using the default muted foreground color
4. THE Character_Page SHALL apply M+ score coloring to all locations where an M+ rating is displayed, including the MPlus_Rating_Widget, MPlus_History_Table run scores, and any ranking values

### Requirement 7: Raid Progress Widget Enhancement

**User Story:** As a user, I want to see region and world raid rankings and per-boss kill details in the Raid Progress widget, so that I can understand a character's raid progression in detail.

#### Acceptance Criteria

1. THE Raid_Progress_Widget SHALL display the character's region rank and world rank for the current raid tier alongside the existing progression summary
2. WHEN the RaiderIO_Client returns raid ranking data for the character, THE Raid_Progress_Widget SHALL render the region rank and world rank as numeric values
3. IF the RaiderIO_Client returns no raid ranking data, THEN THE Raid_Progress_Widget SHALL display a dash ("—") for both region rank and world rank
4. WHEN the user clicks the "See More" button on the Raid_Progress_Widget, THE Raid_Progress_Widget SHALL expand to reveal a table listing all raid bosses and their kill status
5. THE Raid_Progress_Widget SHALL display three tabs labeled "Normal", "Heroic", and "Mythic" above the boss kill table
6. WHEN the user clicks a difficulty tab, THE Raid_Progress_Widget SHALL update the boss kill table to show kill status for the selected difficulty
7. IF a difficulty has zero boss kills, THEN THE Raid_Progress_Widget SHALL render that difficulty tab in a disabled state and prevent user interaction with the tab
8. THE Raid_Progress_Widget boss kill table SHALL display each boss name and a visual indicator showing whether the boss has been killed for the selected difficulty

### Requirement 8: M+ Rating Widget Enhancement

**User Story:** As a user, I want to see color-coded M+ rankings and per-spec breakdowns in the M+ Rating widget, so that I can evaluate a character's M+ performance across specs.

#### Acceptance Criteria

1. THE MPlus_Rating_Widget SHALL display the character's overall M+ score with the color resolved from the Score_Tier list
2. THE MPlus_Rating_Widget SHALL display the character's Realm Rank, Region Rank, and World Rank for M+ rating, each rendered with the color resolved from the Score_Tier list
3. WHEN the RaiderIO_Client returns M+ ranking data, THE MPlus_Rating_Widget SHALL render numeric rank values for realm, region, and world
4. IF the RaiderIO_Client returns no M+ ranking data, THEN THE MPlus_Rating_Widget SHALL display a dash ("—") for all rank values
5. THE MPlus_Rating_Widget SHALL render a Spec_Tab for each spec that the character's class supports
6. WHEN the user clicks a Spec_Tab, THE MPlus_Rating_Widget SHALL update the displayed score and rankings to reflect the selected spec's data
7. IF a spec has no M+ data (score of 0), THEN THE MPlus_Rating_Widget SHALL render that Spec_Tab in a disabled state and prevent user interaction
8. THE MPlus_Rating_Widget SHALL set the background image of each Spec_Tab to the corresponding spec icon image from the Blizzard or RaiderIO media assets

### Requirement 9: M+ History Table Redesign

**User Story:** As a user, I want a redesigned M+ history layout with expandable run details and a player detail modal, so that I can explore run composition and player builds.

#### Acceptance Criteria

1. THE MPlus_History_Table SHALL render each run as a row displaying the dungeon name in bold, the key level, the run score, and the clear time
2. THE MPlus_History_Table SHALL format the dungeon name and key level on the first line, and the score and clear time on the second line of each row
3. WHEN the user clicks a run row, THE MPlus_History_Table SHALL expand that row to reveal a table of players in the run, showing each player's name and spec
4. WHEN the user clicks a player name in the expanded run details, THE MPlus_History_Table SHALL open a Run_Detail_Modal displaying the full run details for that player
5. THE Run_Detail_Modal SHALL display the player's role, character name, item level, trinkets, tier set pieces, talent summary, and score
6. THE Run_Detail_Modal SHALL include a settings menu (cog icon) with the following actions: "Copy Talents", "Character Profile", "View Gear", and "Videos"
7. WHEN the user clicks "Copy Talents" in the Run_Detail_Modal, THE Run_Detail_Modal SHALL copy the player's talent loadout string to the clipboard
8. WHEN the user clicks "Character Profile" in the Run_Detail_Modal, THE Run_Detail_Modal SHALL navigate to the player's Character_Page on Gamerphile
9. WHEN the user clicks "View Gear" in the Run_Detail_Modal, THE Run_Detail_Modal SHALL display the player's equipped gear items
10. WHEN the user clicks "Videos" in the Run_Detail_Modal, THE Run_Detail_Modal SHALL display links to any associated video recordings for the run

### Requirement 10: Warcraft Logs Widget Data Integration

**User Story:** As a user, I want the Warcraft Logs widget to display my character's actual parse data, so that I can see my raid performance at a glance.

#### Acceptance Criteria

1. WHEN the Character_Page loads, THE WCL_Widget SHALL fetch the character's zone rankings from the WCL_Client for the current raid tier
2. WHEN zone ranking data is available, THE WCL_Widget SHALL display the character's best Parse_Percentile and median Parse_Percentile for the current raid tier
3. THE WCL_Widget SHALL color-code the Parse_Percentile values using the standard WCL color scheme (grey: 0–24, green: 25–49, blue: 50–74, purple: 75–94, orange: 95–98, pink: 99, gold: 100)
4. WHEN encounter ranking data is available, THE WCL_Widget SHALL display a list of encounters with the character's best Parse_Percentile for each boss
5. IF the WCL_Client returns no data for the character, THEN THE WCL_Widget SHALL display a message indicating no Warcraft Logs data is available
6. IF the WCL_Client request fails, THEN THE WCL_Widget SHALL display the existing "Coming Soon" fallback without showing an error to the user

### Requirement 11: Mobile Responsive Hero Section

**User Story:** As a mobile user, I want the hero section to display the character image prominently with identity details overlaid, so that the character page is usable on small screens.

#### Acceptance Criteria

1. WHILE the viewport width is below 768px, THE Hero_Section SHALL render the character image occupying the top 50% of the viewport height
2. WHILE the viewport width is below 768px, THE Hero_Section SHALL overlay the character name, spec, race, class, and realm/region text on top of the character image
3. WHILE the viewport width is below 768px, THE Hero_Section SHALL apply a gradient scrim over the lower portion of the character image to ensure text readability
4. WHILE the viewport width is 768px or above, THE Hero_Section SHALL render using the existing desktop layout

### Requirement 12: Ultrawide Layout Support

**User Story:** As a user with an ultrawide monitor, I want the character page to utilize the wider viewport, so that the layout takes advantage of the available screen space.

#### Acceptance Criteria

1. WHILE the Ultrawide_Provider has ultrawide mode enabled, THE Character_Page SHALL expand the maximum content width from 1280px to 1920px
2. WHILE ultrawide mode is enabled, THE Bento_Grid SHALL adjust its grid layout to utilize the wider available space
3. WHILE ultrawide mode is enabled, THE MPlus_History_Table and Raid_Progress_Widget SHALL expand to fill the wider content area
4. WHILE ultrawide mode is disabled, THE Character_Page SHALL constrain the maximum content width to 1280px

### Requirement 13: RaiderIO Character Profile Field Expansion

**User Story:** As a developer, I want to fetch additional character profile fields from RaiderIO, so that the enhanced widgets have the data they need.

#### Acceptance Criteria

1. WHEN fetching a character profile for the Character_Page, THE RaiderIO_Client SHALL request the `mythic_plus_ranks` field to obtain realm, region, and world M+ rankings
2. WHEN fetching a character profile for the Character_Page, THE RaiderIO_Client SHALL request the `raid_progression` field with boss-level detail to obtain per-boss kill status
3. WHEN fetching a character profile for the Character_Page, THE RaiderIO_Client SHALL request the `mythic_plus_scores_by_season:current` field with spec-level breakdown to obtain per-spec M+ scores
4. THE RaiderIO_Client SHALL export typed interfaces for the M+ rank data including realm rank, region rank, and world rank for overall and per-spec breakdowns

### Requirement 14: WCL API Route

**User Story:** As a developer, I want a Next.js API route that proxies WCL data requests, so that the WCL client credentials are not exposed to the browser.

#### Acceptance Criteria

1. THE Character_Page SHALL expose a Next.js API route at `/api/wcl/character` that accepts `name`, `serverSlug`, and `serverRegion` query parameters
2. WHEN valid query parameters are provided, THE API route SHALL use the WCL_Client to fetch zone rankings and encounter rankings for the specified character
3. WHEN the WCL_Client returns data, THE API route SHALL respond with a JSON object containing the zone rankings and encounter rankings
4. IF any required query parameter is missing, THEN THE API route SHALL respond with HTTP 400 and a JSON error message indicating the missing parameter
5. IF the WCL_Client throws an error, THEN THE API route SHALL respond with HTTP 502 and a JSON error message containing the error details
