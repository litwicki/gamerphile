# Requirements Document

## Introduction

This feature adds new page routes to the Gamerphile Next.js application for browsing World of Warcraft realm, character, and guild information. The routes follow a hierarchical URL structure of `/{realm}/{region}/...` and include both public-facing detail pages and authenticated edit pages. Character sub-pages expose Mythic+, Raid, Log, and UI data. Guild and character edit pages require authorization checks against the logged-in user's linked profile.

## Glossary

- **App_Router**: The Next.js App Router responsible for mapping URL paths to page components under the `app/` directory
- **Realm_Page**: A page component that displays details about a specific WoW realm
- **Character_Page**: The existing page component at `app/[realm]/[region]/[character]/page.tsx` that displays a character profile
- **Character_Edit_Page**: A page component that allows editing character details, accessible only to the character's owner
- **Guild_Page**: A page component that displays details about a specific WoW guild
- **Guild_Edit_Page**: A page component that allows editing guild details, accessible only to the guild leader
- **Character_Sub_Page**: A page component nested under a character route that displays a specific data category (keys, raids, logs, or UI)
- **Auth_Session**: The authenticated user session provided by NextAuth containing the user's Battle.net identity and linked characters
- **Region**: A WoW game region identifier, one of: us, eu, kr, tw
- **Realm**: A WoW server name used as a URL slug (lowercase, hyphenated)
- **Layout_Component**: A Next.js layout file that wraps child routes with shared UI elements like navigation tabs

## Requirements

### Requirement 1: Realm Details Route

**User Story:** As a player, I want to view details about a specific realm, so that I can see realm information before looking up characters or guilds on that realm.

#### Acceptance Criteria

1. WHEN a user navigates to `/{realm}/{region}`, THE App_Router SHALL render the Realm_Page component
2. THE Realm_Page SHALL display the realm name and region derived from the URL parameters
3. IF the region parameter is not one of us, eu, kr, or tw, THEN THE App_Router SHALL render a not-found page
4. IF the realm parameter contains characters other than letters, numbers, hyphens, or spaces, THEN THE App_Router SHALL render a not-found page

### Requirement 2: Character Details Sub-Pages

**User Story:** As a player, I want to view specific categories of character data on dedicated pages, so that I can browse Mythic+ keys, raid progress, combat logs, and UI setup separately.

#### Acceptance Criteria

1. WHEN a user navigates to `/{realm}/{region}/{character}/keys`, THE App_Router SHALL render a Character_Sub_Page displaying Mythic+ keystone data
2. WHEN a user navigates to `/{realm}/{region}/{character}/raids`, THE App_Router SHALL render a Character_Sub_Page displaying raid progress data
3. WHEN a user navigates to `/{realm}/{region}/{character}/logs`, THE App_Router SHALL render a Character_Sub_Page displaying combat log data
4. WHEN a user navigates to `/{realm}/{region}/{character}/ui`, THE App_Router SHALL render a Character_Sub_Page displaying UI configuration data
5. THE App_Router SHALL validate realm, region, and character parameters using the same rules as the existing Character_Page

### Requirement 3: Character Layout with Navigation

**User Story:** As a player, I want consistent navigation between a character's detail pages, so that I can switch between profile, keys, raids, logs, and UI without losing context.

#### Acceptance Criteria

1. THE Layout_Component for character routes SHALL render navigation links to the character profile, keys, raids, logs, and UI pages
2. THE Layout_Component SHALL highlight the currently active navigation link
3. THE Layout_Component SHALL wrap all character sub-routes including the existing Character_Page

### Requirement 4: Character Edit Capability

**User Story:** As a logged-in player, I want to edit my own character's details, so that I can customize how my character appears on the site.

#### Acceptance Criteria

1. WHEN a logged-in user navigates to `/{realm}/{region}/{character}` and the character belongs to the user's linked profile, THE Character_Page SHALL display an edit control
2. WHILE a user is not logged in, THE Character_Page SHALL NOT display any edit control
3. IF a logged-in user attempts to edit a character that does not belong to the user's linked profile, THEN THE Character_Edit_Page SHALL deny access and display an unauthorized message

### Requirement 5: Guild Details Route

**User Story:** As a player, I want to view details about a specific guild, so that I can see guild information, roster, and activity.

#### Acceptance Criteria

1. WHEN a user navigates to `/{realm}/{region}/{guildname}`, THE App_Router SHALL render the Guild_Page component
2. THE Guild_Page SHALL display the guild name, realm, and region derived from the URL parameters
3. IF the region parameter is not one of us, eu, kr, or tw, THEN THE App_Router SHALL render a not-found page
4. THE App_Router SHALL validate the guildname parameter using the same rules as character name validation

### Requirement 6: Guild Edit Route

**User Story:** As a guild leader, I want to edit my guild's details on the site, so that I can customize how my guild appears.

#### Acceptance Criteria

1. WHEN a logged-in user navigates to `/{realm}/{region}/{guildname}/edit`, THE App_Router SHALL render the Guild_Edit_Page component
2. WHILE a user is not logged in, THE App_Router SHALL redirect the user to the sign-in page when accessing the guild edit route
3. IF the logged-in user does not have a character in their linked profile that matches the guild leader of the guild, THEN THE Guild_Edit_Page SHALL deny access and display an unauthorized message
4. WHEN the logged-in user is verified as the guild leader, THE Guild_Edit_Page SHALL display editable guild details

### Requirement 7: Route Parameter Validation

**User Story:** As a developer, I want consistent parameter validation across all new routes, so that invalid URLs are handled gracefully.

#### Acceptance Criteria

1. THE App_Router SHALL validate that the region parameter is one of us, eu, kr, or tw on all realm-scoped routes
2. THE App_Router SHALL validate that realm, character, and guildname parameters match the pattern of letters, numbers, hyphens, and spaces
3. IF any route parameter fails validation, THEN THE App_Router SHALL render a not-found page with a 404 status code

### Requirement 8: Route Disambiguation Between Characters and Guilds

**User Story:** As a developer, I want the routing system to correctly distinguish between character and guild URLs at the `/{realm}/{region}/{name}` level, so that the correct page is rendered.

#### Acceptance Criteria

1. THE App_Router SHALL use a shared dynamic segment at `/{realm}/{region}/{name}` and determine whether to render the Character_Page or Guild_Page based on data lookup
2. IF the name matches a character, THE App_Router SHALL render the Character_Page
3. IF the name matches a guild, THE App_Router SHALL render the Guild_Page
4. IF the name matches neither a character nor a guild, THEN THE App_Router SHALL render a not-found page
