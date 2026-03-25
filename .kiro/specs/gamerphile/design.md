# Design Document: Gamerphile

## Overview

Gamerphile is a Next.js web application built on the Vercel Supabase starter template. It provides World of Warcraft character lookup via the Battle.net API, Battle.net OAuth authentication via next-auth, and public pages for character profiles, news, and a UI showcase. The application uses Tailwind CSS for styling, shadcn/Radix for UI components, and Supabase for backend services.

The system has four main concerns:
1. **Authentication** — Battle.net OAuth via next-auth, storing access tokens in the session
2. **WoW API Client** — A typed TypeScript wrapper around the Battle.net WoW Community API
3. **Routing** — Next.js App Router serving public pages at `/`, `/news`, `/ui`, and `/{realm}/{region}/{character}`
4. **Character Display** — Server/client components that fetch and render WoW character data

```mermaid
graph TD
    User[User / Browser] --> Router[Next.js App Router]
    Router --> HomePage[/ Home Page]
    Router --> NewsPage[/news News Page]
    Router --> UIPage[/ui UI Showcase]
    Router --> CharPage[/{realm}/{region}/{character} Character Page]
    CharPage --> WoWClient[WoW API Client]
    WoWClient --> BattleNetAPI[Battle.net WoW API]
    User --> AuthFlow[next-auth Sign In/Out]
    AuthFlow --> BattleNetOAuth[Battle.net OAuth]
    AuthFlow --> SupabaseSession[Supabase Session Store]
```

## Architecture

The application follows the Next.js App Router architecture with server components as the default rendering strategy.

### Layers

| Layer | Technology | Responsibility |
|-------|-----------|----------------|
| UI | React Server/Client Components, shadcn/Radix, Tailwind CSS | Rendering pages and interactive elements |
| Routing | Next.js App Router | URL-to-page mapping, dynamic segments, error/loading states |
| Auth | next-auth v5 | Battle.net OAuth flow, session management |
| API Client | Custom TypeScript module | Typed wrapper for WoW Community API with token management |
| Backend | Supabase | Database, auth session storage |

### Key Design Decisions

1. **next-auth for Battle.net OAuth**: next-auth provides a well-tested OAuth abstraction. A custom Battle.net provider will be configured since Battle.net is not a built-in provider.
2. **WoW API Client as a standalone module**: The API client is a pure TypeScript module with no React dependencies, making it testable in isolation and reusable across server components and API routes.
3. **Server Components for character pages**: Character data fetching happens on the server to avoid exposing API tokens to the client and to improve initial load performance.
4. **Dynamic route segments**: The `[realm]/[region]/[character]` pattern uses Next.js dynamic route segments with server-side validation.

## Components and Interfaces

### Authentication Components

```typescript
// lib/auth.ts — next-auth configuration
interface AuthConfig {
  providers: [BattleNetProvider];
  callbacks: {
    jwt: (params: { token: JWT; account: Account | null }) => JWT;
    session: (params: { session: Session; token: JWT }) => Session;
  };
}

// Battle.net provider configuration
interface BattleNetProviderConfig {
  clientId: string;
  clientSecret: string;
  issuer: string; // https://oauth.battle.net or region-specific
  authorization: { params: { scope: string } };
}
```

### WoW API Client

```typescript
// lib/wow-api/client.ts
type WoWRegion = "us" | "eu" | "kr" | "tw";
type WoWLocale = string; // e.g. "en_US", "de_DE"

interface WoWClientConfig {
  clientId: string;
  clientSecret: string;
  region: WoWRegion;
  locale?: WoWLocale;
}

interface WoWApiError {
  status: number;
  message: string;
}

type WoWApiResult<T> = { ok: true; data: T } | { ok: false; error: WoWApiError };

class WoWApiClient {
  constructor(config: WoWClientConfig);

  // Token management
  private getAccessToken(): Promise<string>;
  private refreshToken(): Promise<string>;

  // Character Profile endpoints
  getCharacterProfile(realm: string, characterName: string): Promise<WoWApiResult<CharacterProfile>>;
  getCharacterMedia(realm: string, characterName: string): Promise<WoWApiResult<CharacterMedia>>;

  // Realm endpoints
  getRealms(): Promise<WoWApiResult<RealmIndex>>;
  getRealm(realmSlug: string): Promise<WoWApiResult<Realm>>;

  // Playable Class endpoints
  getPlayableClasses(): Promise<WoWApiResult<PlayableClassIndex>>;
  getPlayableClass(classId: number): Promise<WoWApiResult<PlayableClass>>;
}
```

### Route Components

```typescript
// app/page.tsx
export default function HomePage(): JSX.Element;

// app/news/page.tsx
export default function NewsPage(): JSX.Element;

// app/ui/page.tsx
export default function UIShowcasePage(): JSX.Element;

// app/[realm]/[region]/[character]/page.tsx
interface CharacterPageProps {
  params: { realm: string; region: string; character: string };
}
export default async function CharacterPage(props: CharacterPageProps): Promise<JSX.Element>;

// app/[realm]/[region]/[character]/loading.tsx
export default function CharacterLoading(): JSX.Element;

// app/[realm]/[region]/[character]/error.tsx
export default function CharacterError(): JSX.Element;
```


## Data Models

### Character Profile

```typescript
interface CharacterProfile {
  id: number;
  name: string;
  realm: {
    id: number;
    name: string;
    slug: string;
  };
  level: number;
  character_class: {
    id: number;
    name: string;
  };
  race: {
    id: number;
    name: string;
  };
  gender: {
    type: string;
    name: string;
  };
  faction: {
    type: string;
    name: string;
  };
  achievement_points: number;
  last_login_timestamp: number;
}
```

### Character Media

```typescript
interface CharacterMedia {
  character: { id: number; name: string };
  assets: Array<{
    key: string;   // "avatar", "inset", "main-raw"
    value: string; // URL to the image
  }>;
}
```

### Realm

```typescript
interface Realm {
  id: number;
  name: string;
  slug: string;
  region: { id: number; name: string };
  category: string;
  locale: string;
  timezone: string;
  type: { type: string; name: string };
}

interface RealmIndex {
  realms: Array<{ id: number; name: string; slug: string }>;
}
```

### Playable Class

```typescript
interface PlayableClass {
  id: number;
  name: string;
  gender_name: { male: string; female: string };
  power_type: { id: number; name: string };
  specializations: Array<{ id: number; name: string }>;
  media: { id: number };
}

interface PlayableClassIndex {
  classes: Array<{ id: number; name: string }>;
}
```

### Auth Session

```typescript
// Extended next-auth session with Battle.net token
interface GamerphileSession extends Session {
  accessToken?: string;
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    battletag?: string;
  };
}
```

### WoW API Token

```typescript
interface WoWApiToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  sub: string;
  // Computed field for cache management
  expires_at: number;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API Response Round-Trip

*For any* valid WoW API response object (CharacterProfile, CharacterMedia, Realm, PlayableClass), parsing the JSON into a typed object, serializing it back to JSON, and parsing again should produce an equivalent object.

**Validates: Requirements 4.9, 4.3**

### Property 2: Structured Error on API Failure

*For any* HTTP error status code (4xx, 5xx) and error message returned by the Battle.net API, the WoW API Client should return a `WoWApiResult` with `ok: false` containing a `WoWApiError` with the matching status code and message.

**Validates: Requirements 4.4**

### Property 3: Region and Locale in Request URL

*For any* valid region (us, eu, kr, tw) and any locale string, the WoW API Client should construct a request URL that targets the correct regional API host (e.g., `us.api.blizzard.com`) and includes the locale as a query parameter.

**Validates: Requirements 4.5, 4.6**

### Property 4: Authorization Header on All Requests

*For any* API request made by the WoW API Client, the outgoing HTTP request should include an `Authorization` header with the value `Bearer <token>` where `<token>` is a non-empty string.

**Validates: Requirements 4.7**

### Property 5: Dynamic Route Renders Character Page

*For any* valid realm, region, and character name combination, navigating to `/{realm}/{region}/{character}` should render the Character Page component with those parameters available.

**Validates: Requirements 5.4**

### Property 6: Public Routes Accessible Without Auth

*For any* public route (`/`, `/news`, `/ui`, `/{realm}/{region}/{character}`), the route should be accessible and render content without requiring an authenticated session.

**Validates: Requirements 5.5**

### Property 7: Invalid Character Params Show Not-Found

*For any* realm, region, or character value that does not correspond to a valid WoW character, the Character Page should display a not-found message rather than crashing or showing empty content.

**Validates: Requirements 5.6**

### Property 8: Character Page Passes URL Params to API Client

*For any* realm, region, and character URL parameters, the Character Page should invoke the WoW API Client's `getCharacterProfile` method with those exact parameter values.

**Validates: Requirements 6.1**

### Property 9: Character Page Displays All Required Fields

*For any* valid CharacterProfile object returned by the WoW API Client, the Character Page rendered output should contain the character's name, realm name, level, race name, and class name.

**Validates: Requirements 6.3**

### Property 10: Character Page Shows Error on API Failure

*For any* error result returned by the WoW API Client, the Character Page should render an error message indicating the character was not found or the request failed.

**Validates: Requirements 6.4**

## Error Handling

### WoW API Client Errors

| Error Scenario | Handling Strategy |
|---------------|-------------------|
| Invalid client credentials | Throw configuration error at initialization; do not retry |
| Token expired (401) | Automatically refresh token and retry the request once (Req 4.8) |
| Rate limited (429) | Return structured error with status and message; let caller decide retry |
| Network timeout | Return structured error with descriptive message |
| Invalid JSON response | Return structured error indicating parse failure |
| Unknown API error (5xx) | Return structured error with status code and message |

### Authentication Errors

| Error Scenario | Handling Strategy |
|---------------|-------------------|
| Battle.net OAuth denied | Redirect to error page with descriptive message (Req 2.4) |
| Session expired | Redirect to sign-in page |
| Missing environment variables | Fail at startup with clear error message |

### Character Page Errors

| Error Scenario | Handling Strategy |
|---------------|-------------------|
| Character not found (404) | Display not-found message with suggestion to check spelling (Req 5.6, 6.4) |
| API error (non-404) | Display generic error message with retry option (Req 6.4) |
| Invalid URL params | Display not-found message (Req 5.6) |

### General Error Boundaries

- Next.js `error.tsx` files at the route segment level catch rendering errors
- `not-found.tsx` files handle 404 cases via `notFound()` calls
- Global error boundary at the app root catches unhandled errors

## Testing Strategy

### Testing Framework

- **Unit/Integration Tests**: Vitest (fast, ESM-native, good Next.js compatibility)
- **Property-Based Tests**: fast-check (the standard PBT library for TypeScript/JavaScript)
- **Component Tests**: React Testing Library with Vitest

### Unit Tests

Unit tests cover specific examples, edge cases, and integration points:

- Auth configuration: Verify Battle.net provider is configured correctly (Req 2.1)
- Auth sign-in redirect: Verify redirect URL points to Battle.net OAuth (Req 2.2)
- Auth session creation: Verify session contains access token after successful auth (Req 2.3, 2.6)
- Auth error handling: Verify error page renders on OAuth failure (Req 2.4)
- Auth sign-out: Verify session termination and redirect to home (Req 2.5)
- Token refresh: Verify expired token triggers refresh and retry (Req 4.8)
- Route rendering: Verify each static route (`/`, `/news`, `/ui`) renders its page (Req 5.1, 5.2, 5.3)
- Loading state: Verify loading indicator renders during data fetch (Req 6.2)
- API endpoint coverage: Verify each WoW API method exists and calls the correct endpoint (Req 4.2)

### Property-Based Tests

Each property test uses fast-check with a minimum of 100 iterations and references its design property.

- **Feature: gamerphile, Property 1: API Response Round-Trip** — Generate random valid CharacterProfile/CharacterMedia/Realm/PlayableClass objects, verify `parse(serialize(parse(json))) === parse(json)`
- **Feature: gamerphile, Property 2: Structured Error on API Failure** — Generate random HTTP error status codes (400-599) and error messages, verify the client returns `{ ok: false, error: { status, message } }`
- **Feature: gamerphile, Property 3: Region and Locale in Request URL** — Generate random regions from `[us, eu, kr, tw]` and random locale strings, verify the constructed URL contains the correct host and locale param
- **Feature: gamerphile, Property 4: Authorization Header on All Requests** — Generate random API method calls, verify every outgoing request has `Authorization: Bearer <non-empty-token>`
- **Feature: gamerphile, Property 5: Dynamic Route Renders Character Page** — Generate random valid realm/region/character strings, verify the route resolves to the Character Page component
- **Feature: gamerphile, Property 6: Public Routes Accessible Without Auth** — Generate random public route paths, verify they return 200 without an auth session
- **Feature: gamerphile, Property 7: Invalid Character Params Show Not-Found** — Generate random invalid realm/region/character combinations, verify the page renders a not-found message
- **Feature: gamerphile, Property 8: Character Page Passes URL Params to API Client** — Generate random realm/region/character strings, verify the API client is called with those exact values
- **Feature: gamerphile, Property 9: Character Page Displays All Required Fields** — Generate random CharacterProfile objects, verify the rendered output contains name, realm, level, race, and class
- **Feature: gamerphile, Property 10: Character Page Shows Error on API Failure** — Generate random WoWApiError objects, verify the page renders an error message

### Test Organization

```
__tests__/
  unit/
    auth.test.ts
    wow-api-client.test.ts
    routes.test.ts
    character-page.test.ts
  property/
    api-response-roundtrip.test.ts
    wow-api-client-properties.test.ts
    route-properties.test.ts
    character-page-properties.test.ts
```
