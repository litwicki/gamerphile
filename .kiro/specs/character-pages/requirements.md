# Requirements Document

## Introduction

Redesign the character page at `/characters/[realm]/[region]/[characterName]` into a full-featured, immersive character portal. The page replaces the current basic layout with a parallax hero section using the character's full render, a bento grid of key stats widgets overlaying the hero, and a three-column detail section below for raid history, M+ history, and a user-configurable interface placeholder.

## Glossary

- **Character_Page**: The Next.js page component at `/characters/[realm]/[region]/[characterName]` that displays a character's profile, stats, and activity history.
- **Hero_Section**: A viewport-relative container at the top of the Character_Page that displays the character's full render as a parallax background image.
- **Parallax_Background**: A CSS-based scrolling effect where the background image (full character render) scrolls at a slower rate than the foreground content.
- **Bento_Grid**: A grid layout of stat widgets that overlays the lower portion of the Hero_Section, containing summary cards for raid progress, Warcraft Logs, M+ rating, and Twitch stream.
- **Raid_Progress_Widget**: A Bento_Grid card displaying the character's current raid progression summary (e.g., "6/8 H").
- **WarcraftLogs_Widget**: A Bento_Grid card displaying the character's Warcraft Logs percentile rankings for raids and Mythic+.
- **MPlus_Rating_Widget**: A Bento_Grid card displaying the character's Mythic+ score and highest key completed.
- **Twitch_Widget**: A Bento_Grid card displaying a Twitch stream embed, shown only when the character's owner has configured a Twitch integration on their profile.
- **Raid_History_Table**: A table listing the character's raid encounters with links to individual raid logs.
- **MPlus_History_Table**: A table listing the character's Mythic+ runs with links to individual run logs.
- **User_Interface_Placeholder**: A placeholder column reserved for future user-configurable content.
- **WoW_Media_API**: The Battle.net Character Media endpoint that returns character render assets including "avatar", "inset", and "main-raw" keys.
- **RaiderIO_Client**: The existing Raider.IO API client used to fetch enriched character data including gear, M+ scores, raid progression, and best runs.
- **CharacterTheme**: The existing client component that applies a class-based CSS theme matching the character's WoW class.

## Requirements

### Requirement 1: Parallax Hero Section

**User Story:** As a visitor, I want to see an immersive hero section with the character's full render as a parallax background, so that the character page feels like a premium portal experience.

#### Acceptance Criteria

1. THE Hero_Section SHALL occupy 40% of the viewport height.
2. THE Hero_Section SHALL use the "main-raw" asset from the WoW_Media_API as the Parallax_Background image.
3. THE Parallax_Background SHALL scroll at a slower rate than the page foreground content to produce a parallax effect.
4. IF the WoW_Media_API does not return a "main-raw" asset, THEN THE Hero_Section SHALL display a themed gradient fallback background using the character's class color.
5. THE Hero_Section SHALL display the character's name, spec, race, class, level, realm, and region as an overlay on the parallax background.
6. THE Character_Page SHALL continue to apply the CharacterTheme matching the character's class.

### Requirement 2: Bento Grid Stat Widgets

**User Story:** As a visitor, I want to see key character stats in a visually appealing bento grid overlaying the hero section, so that I can quickly assess the character's progression at a glance.

#### Acceptance Criteria

1. THE Bento_Grid SHALL overlay the lower portion of the Hero_Section, visually bridging the hero and the content below.
2. THE Bento_Grid SHALL contain the Raid_Progress_Widget, the WarcraftLogs_Widget, the MPlus_Rating_Widget, and conditionally the Twitch_Widget.
3. THE Raid_Progress_Widget SHALL display the character's current raid tier progression summary retrieved from the RaiderIO_Client.
4. THE WarcraftLogs_Widget SHALL display placeholder content for Warcraft Logs percentile data for raids and Mythic+ (data integration deferred to a future iteration).
5. THE MPlus_Rating_Widget SHALL display the character's current season Mythic+ score and the name and level of the highest key completed, retrieved from the RaiderIO_Client.
6. WHEN the character's owner has a Twitch integration configured on their profile, THE Bento_Grid SHALL display the Twitch_Widget with a Twitch stream embed.
7. WHEN the character's owner does not have a Twitch integration configured, THE Bento_Grid SHALL hide the Twitch_Widget and redistribute space among the remaining widgets.
8. THE Bento_Grid SHALL be responsive, stacking widgets vertically on viewports narrower than 640px.

### Requirement 3: Raid History Section

**User Story:** As a visitor, I want to see a table of the character's raid history with links to logs, so that I can review their raid performance in detail.

#### Acceptance Criteria

1. THE Raid_History_Table SHALL appear as the first column in a three-column layout below the Hero_Section.
2. THE Raid_History_Table SHALL display each raid encounter as a row containing the raid name, difficulty, boss kill count, and date.
3. WHEN a user clicks a row in the Raid_History_Table, THE Character_Page SHALL navigate to the corresponding raid log on an external logging site (Warcraft Logs or Raider.IO).
4. THE Raid_History_Table SHALL retrieve raid progression data from the RaiderIO_Client.
5. IF the RaiderIO_Client returns no raid progression data, THEN THE Raid_History_Table SHALL display a message stating "No raid history available."

### Requirement 4: Mythic+ History Section

**User Story:** As a visitor, I want to see a table of the character's Mythic+ run history with links to logs, so that I can review their dungeon performance.

#### Acceptance Criteria

1. THE MPlus_History_Table SHALL appear as the second column in the three-column layout below the Hero_Section.
2. THE MPlus_History_Table SHALL display each Mythic+ run as a row containing the dungeon name, key level, completion time, number of keystone upgrades, score, and date.
3. WHEN a user clicks a row in the MPlus_History_Table, THE Character_Page SHALL navigate to the corresponding run log URL provided by the RaiderIO_Client.
4. THE MPlus_History_Table SHALL retrieve best run data from the RaiderIO_Client.
5. IF the RaiderIO_Client returns no Mythic+ run data, THEN THE MPlus_History_Table SHALL display a message stating "No M+ history available."

### Requirement 5: User Interface Placeholder Column

**User Story:** As a developer, I want a placeholder third column in the detail section, so that a user-configurable interface can be added in a future iteration.

#### Acceptance Criteria

1. THE User_Interface_Placeholder SHALL appear as the third column in the three-column layout below the Hero_Section.
2. THE User_Interface_Placeholder SHALL display a styled placeholder card with the text "Coming Soon" and a brief description indicating future user-configurable content.
3. THE User_Interface_Placeholder SHALL match the visual style (border, background, shadow) of the Raid_History_Table and MPlus_History_Table columns.

### Requirement 6: Responsive Layout

**User Story:** As a visitor on a mobile device, I want the character page to adapt gracefully to smaller screens, so that I can browse character information on any device.

#### Acceptance Criteria

1. WHILE the viewport width is less than 640px, THE three-column layout below the Hero_Section SHALL collapse into a single-column stack.
2. WHILE the viewport width is between 640px and 1024px, THE three-column layout SHALL collapse into a two-column layout with the User_Interface_Placeholder spanning the full width below.
3. WHILE the viewport width is 1024px or greater, THE three-column layout SHALL display all three columns side by side.
4. THE Hero_Section SHALL maintain 40% viewport height across all supported viewport widths.

### Requirement 7: Error and Loading States

**User Story:** As a visitor, I want clear feedback when data is loading or unavailable, so that I understand the page state at all times.

#### Acceptance Criteria

1. WHILE the Character_Page is loading data, THE Character_Page SHALL display a skeleton loading state matching the page layout structure.
2. IF the WoW_Media_API or the RaiderIO_Client returns an error for a non-critical data source (media, Raider.IO), THEN THE Character_Page SHALL render the remaining available data and display a subtle inline error indicator in the affected section.
3. IF the WoW_Media_API returns a 404 for the character profile, THEN THE Character_Page SHALL render the existing not-found page.
