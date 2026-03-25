# Tasks

## Task 1: Project Initialization and Dependencies

- [x] 1.1 Initialize Next.js project from Vercel Supabase starter template
- [x] 1.2 Install and configure Tailwind CSS
- [x] 1.3 Install and configure @supabase/supabase-js and @supabase/ssr
- [x] 1.4 Install and configure shadcn UI with Radix UI primitives
- [x] 1.5 Install next-auth and configure project structure for auth
- [x] 1.6 Install Vitest, fast-check, and React Testing Library as dev dependencies
- [x] 1.7 Verify all dependencies resolve without conflicts

## Task 2: WoW API TypeScript Types and Data Models

- [x] 2.1 Create `lib/wow-api/types.ts` with CharacterProfile, CharacterMedia, Realm, RealmIndex, PlayableClass, PlayableClassIndex interfaces
- [x] 2.2 Create `lib/wow-api/types.ts` with WoWRegion, WoWLocale, WoWClientConfig, WoWApiError, WoWApiResult types
- [x] 2.3 Create `lib/wow-api/types.ts` with WoWApiToken interface for token management

## Task 3: WoW API Client Implementation

- [x] 3.1 Create `lib/wow-api/client.ts` with WoWApiClient class constructor accepting WoWClientConfig
- [x] 3.2 Implement private `getAccessToken()` method using OAuth client credentials flow
- [x] 3.3 Implement private `refreshToken()` method with token expiry detection and automatic refresh
- [x] 3.4 Implement private `request()` helper that constructs regional URLs, sets Authorization header, includes locale param, and handles error responses as WoWApiResult
- [x] 3.5 Implement `getCharacterProfile(realm, characterName)` method
- [x] 3.6 Implement `getCharacterMedia(realm, characterName)` method
- [x] 3.7 Implement `getRealms()` and `getRealm(realmSlug)` methods
- [x] 3.8 Implement `getPlayableClasses()` and `getPlayableClass(classId)` methods
- [x] 3.9 Export a configured client instance from `lib/wow-api/index.ts`

## Task 4: Battle.net Authentication via next-auth

- [x] 4.1 Create custom Battle.net provider in `lib/auth/battlenet-provider.ts` with clientId, clientSecret, issuer, and scope configuration
- [x] 4.2 Create `lib/auth/auth.ts` with next-auth configuration using the Battle.net provider
- [x] 4.3 Implement JWT callback to store Battle.net access token in the JWT
- [x] 4.4 Implement session callback to expose access token and battletag in the session
- [x] 4.5 Create `app/api/auth/[...nextauth]/route.ts` API route handler
- [x] 4.6 Create sign-in and sign-out UI components using next-auth client methods

## Task 5: Battle.net OAuth Setup Documentation

- [x] 5.1 Create `SETUP.md` documenting Battle.net OAuth application creation in Blizzard Developer Portal
- [x] 5.2 Document required OAuth redirect URI configuration
- [x] 5.3 Document required environment variables (BATTLENET_CLIENT_ID, BATTLENET_CLIENT_SECRET, NEXTAUTH_SECRET, etc.)
- [x] 5.4 Document Supabase configuration for Battle.net provider
- [x] 5.5 Document end-to-end OAuth flow verification steps

## Task 6: Public Route Structure

- [x] 6.1 Create `app/page.tsx` Home page component
- [x] 6.2 Create `app/news/page.tsx` News page component
- [x] 6.3 Create `app/ui/page.tsx` UI showcase page component
- [x] 6.4 Create `app/[realm]/[region]/[character]/page.tsx` Character page with dynamic route segments
- [x] 6.5 Create `app/[realm]/[region]/[character]/loading.tsx` loading indicator component
- [x] 6.6 Create `app/[realm]/[region]/[character]/error.tsx` error boundary component
- [x] 6.7 Create `app/[realm]/[region]/[character]/not-found.tsx` not-found component
- [x] 6.8 Verify all public routes are accessible without authentication

## Task 7: Character Page Data Display

- [x] 7.1 Implement server-side data fetching in Character page using WoW API Client with realm, region, and character params
- [x] 7.2 Implement character profile display showing name, realm, level, race, and class
- [x] 7.3 Implement error handling: call `notFound()` for 404 errors, display error message for other failures
- [x] 7.4 Implement input validation for realm, region, and character URL parameters

## Task 8: Unit Tests

- [x] 8.1 Write unit tests for auth configuration verifying Battle.net provider setup (Req 2.1)
- [x] 8.2 Write unit tests for auth sign-in redirect to Battle.net OAuth (Req 2.2)
- [x] 8.3 Write unit tests for session creation with access token storage (Req 2.3, 2.6)
- [x] 8.4 Write unit tests for auth error handling on OAuth failure (Req 2.4)
- [x] 8.5 Write unit tests for sign-out session termination and redirect (Req 2.5)
- [x] 8.6 Write unit tests for WoW API Client token refresh on expiry (Req 4.8)
- [x] 8.7 Write unit tests for static route rendering (/, /news, /ui) (Req 5.1, 5.2, 5.3)
- [x] 8.8 Write unit tests for Character page loading indicator (Req 6.2)
- [x] 8.9 Write unit tests for WoW API Client endpoint method coverage (Req 4.2)

## Task 9: Property-Based Tests

- [x] 9.1 Write property test: API Response Round-Trip — parse/serialize/parse equivalence for all WoW API model types (Property 1)
- [x] 9.2 Write property test: Structured Error on API Failure — error status codes and messages produce correct WoWApiResult (Property 2)
- [x] 9.3 Write property test: Region and Locale in Request URL — correct regional host and locale query param (Property 3)
- [x] 9.4 Write property test: Authorization Header on All Requests — Bearer token present on every request (Property 4)
- [x] 9.5 Write property test: Dynamic Route Renders Character Page — valid realm/region/character resolves to Character Page (Property 5)
- [x] 9.6 Write property test: Public Routes Accessible Without Auth — all public routes return 200 without session (Property 6)
- [x] 9.7 Write property test: Invalid Character Params Show Not-Found — invalid params render not-found message (Property 7)
- [x] 9.8 Write property test: Character Page Passes URL Params to API Client — exact param forwarding (Property 8)
- [x] 9.9 Write property test: Character Page Displays All Required Fields — name, realm, level, race, class present in output (Property 9)
- [x] 9.10 Write property test: Character Page Shows Error on API Failure — error result renders error message (Property 10)
