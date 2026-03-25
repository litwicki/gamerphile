# Requirements Document

## Introduction

Gamerphile is a Next.js web application built on the Vercel Supabase template that provides World of Warcraft character lookup and community features. The application integrates Battle.net OAuth for authentication, wraps the World of Warcraft API for game data access, and serves public pages for character profiles, news, and UI showcases.

## Glossary

- **App**: The Gamerphile Next.js web application
- **Supabase_Client**: The Supabase backend client used for database and auth services
- **Auth_System**: The next-auth based authentication system using Battle.net as a social provider
- **WoW_API_Client**: The client wrapper module that communicates with the World of Warcraft Community API
- **Router**: The Next.js App Router responsible for mapping URLs to pages
- **Character_Page**: The public page displaying World of Warcraft character information
- **Battle_Net_Provider**: The next-auth social provider configuration for Blizzard Battle.net OAuth
- **Setup_Guide**: The SETUP.md markdown file containing Battle.net OAuth setup instructions

## Requirements

### Requirement 1: Project Initialization from Vercel Supabase Template

**User Story:** As a developer, I want the project initialized from the Vercel Next.js Supabase template, so that I have a solid foundation with Supabase integration out of the box.

#### Acceptance Criteria

1. THE App SHALL be initialized using the Vercel Next.js Supabase starter template structure
2. THE App SHALL use the latest stable version of Next.js as the framework
3. THE App SHALL use the latest stable version of Tailwind CSS for styling
4. THE App SHALL use the latest stable versions of @supabase/supabase-js and @supabase/ssr for Supabase integration
5. THE App SHALL include the shadcn UI component library configured with Radix UI primitives
6. WHEN a developer runs the install command, THE App SHALL resolve all dependencies without version conflicts

### Requirement 2: Battle.net Authentication via next-auth

**User Story:** As a user, I want to sign in with my Battle.net account, so that I can access personalized features tied to my Blizzard identity.

#### Acceptance Criteria

1. THE Auth_System SHALL use next-auth with Battle.net configured as a social authentication provider
2. WHEN a user initiates sign-in, THE Auth_System SHALL redirect the user to the Battle.net OAuth consent screen
3. WHEN Battle.net returns a successful authorization, THE Auth_System SHALL create or update a session for the authenticated user
4. WHEN Battle.net returns an authorization error, THE Auth_System SHALL display a descriptive error message to the user
5. WHEN a user initiates sign-out, THE Auth_System SHALL terminate the active session and redirect the user to the home page
6. THE Auth_System SHALL store the Battle.net access token in the session for use with the WoW API

### Requirement 3: Battle.net OAuth Setup Documentation

**User Story:** As a developer, I want clear setup instructions for Battle.net OAuth with Supabase, so that I can configure the authentication flow without guesswork.

#### Acceptance Criteria

1. THE Setup_Guide SHALL document the steps to create a Battle.net OAuth application in the Blizzard Developer Portal
2. THE Setup_Guide SHALL document the required OAuth redirect URI configuration for the App
3. THE Setup_Guide SHALL document the environment variables required for Battle.net OAuth integration
4. THE Setup_Guide SHALL document how to configure Supabase to work with the Battle.net provider
5. THE Setup_Guide SHALL document how to verify the OAuth flow is working end-to-end

### Requirement 4: World of Warcraft API Client Wrapper

**User Story:** As a developer, I want a full client wrapper for the World of Warcraft API, so that I can fetch game data through typed, ergonomic functions.

#### Acceptance Criteria

1. THE WoW_API_Client SHALL authenticate with the Battle.net API using OAuth client credentials
2. THE WoW_API_Client SHALL support all major WoW Community API endpoint categories including Character Profile, Character Media, Realm, and Playable Class endpoints
3. WHEN the WoW_API_Client receives a valid API response, THE WoW_API_Client SHALL parse the response into typed TypeScript objects
4. WHEN the WoW_API_Client receives an error response from the Battle.net API, THE WoW_API_Client SHALL return a structured error containing the HTTP status code and error message
5. THE WoW_API_Client SHALL support configurable region parameters (US, EU, KR, TW) for all API requests
6. THE WoW_API_Client SHALL support configurable locale parameters for all API requests
7. WHEN the WoW_API_Client sends a request, THE WoW_API_Client SHALL include the required Authorization header with a valid Bearer token
8. IF the Bearer token has expired, THEN THE WoW_API_Client SHALL automatically refresh the token before retrying the request
9. FOR ALL valid API response objects, parsing then serializing then parsing SHALL produce an equivalent object (round-trip property)

### Requirement 5: Public Route Structure

**User Story:** As a user, I want to navigate to well-defined public pages, so that I can browse home, news, UI showcase, and character profiles without authentication.

#### Acceptance Criteria

1. WHEN a user navigates to "/", THE Router SHALL render the Home page
2. WHEN a user navigates to "/news", THE Router SHALL render the News page
3. WHEN a user navigates to "/ui", THE Router SHALL render the UI showcase page
4. WHEN a user navigates to "/{realm}/{region}/{character}", THE Router SHALL render the Character_Page for the specified realm, region, and character
5. THE Router SHALL allow access to all public routes without requiring authentication
6. WHEN a user navigates to "/{realm}/{region}/{character}" with an invalid realm, region, or character combination, THE Router SHALL display a not-found message

### Requirement 6: Character Page Data Display

**User Story:** As a user, I want to view a character's profile page, so that I can see their World of Warcraft game data.

#### Acceptance Criteria

1. WHEN the Character_Page loads, THE Character_Page SHALL fetch character profile data from the WoW_API_Client using the realm, region, and character from the URL parameters
2. WHILE the Character_Page is fetching data, THE Character_Page SHALL display a loading indicator
3. WHEN the WoW_API_Client returns character data, THE Character_Page SHALL display the character name, realm, level, race, and class
4. IF the WoW_API_Client returns an error for the character lookup, THEN THE Character_Page SHALL display an error message indicating the character was not found or the request failed
