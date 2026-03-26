# Battle.net Login Bugfix Design

## Overview

The Battle.net OAuth login fails because the custom provider in `lib/auth/battlenet-provider.ts` uses `type: "oidc"`, which in next-auth v5 beta 30 causes the `state` parameter to be omitted from the authorization URL. Battle.net's OAuth server requires the `state` parameter and rejects the request with HTTP 400. The fix switches the provider type to `"oauth"` and explicitly specifies Battle.net's authorization and token endpoint URLs, ensuring next-auth's standard OAuth flow handles `state` correctly.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug — when the Battle.net provider is configured with `type: "oidc"` and next-auth constructs an authorization URL, the `state` parameter is missing
- **Property (P)**: The desired behavior — the authorization URL includes a valid `state` parameter along with all other required OAuth parameters
- **Preservation**: Existing callback handling, session/JWT token propagation, battletag extraction, scope configuration, and provider ID must remain unchanged
- **BattleNetProvider**: The custom OAuth provider function in `lib/auth/battlenet-provider.ts` that returns an `OAuthConfig<BattleNetProfile>`
- **authConfig**: The NextAuth configuration object in `lib/auth/auth.ts` that wires up the provider and callbacks
- **state parameter**: An OAuth 2.0 security parameter used to prevent CSRF attacks, required by Battle.net's authorization server

## Bug Details

### Bug Condition

The bug manifests when a user initiates Battle.net OAuth login. The `BattleNetProvider` is configured with `type: "oidc"` and `issuer: "https://oauth.battle.net"`. In next-auth v5 beta 30, the OIDC flow's interaction with Battle.net's discovery endpoint results in the `state` parameter being omitted from the authorization redirect URL. Battle.net rejects the request with HTTP 400: "The state parameter must be provided."

**Formal Specification:**
```
FUNCTION isBugCondition(providerConfig)
  INPUT: providerConfig of type OAuthConfig
  OUTPUT: boolean

  RETURN providerConfig.type == "oidc"
         AND providerConfig.issuer == "https://oauth.battle.net"
         AND authorizationURL(providerConfig) DOES NOT CONTAIN "state" parameter
END FUNCTION
```

### Examples

- User clicks "Sign in with Battle.net" → next-auth generates authorization URL like `https://oauth.battle.net/authorize?response_type=code&client_id=xxx&redirect_uri=xxx&scope=openid+wow.profile` (missing `state`) → Battle.net returns HTTP 400: "The state parameter must be provided"
- Same flow with `type: "oauth"` and explicit endpoints → URL includes `state=abc123` → Battle.net accepts and redirects to callback
- User with valid session attempts to re-authenticate → same missing `state` error occurs
- Edge case: Even if `authorization.params` explicitly included `state`, the OIDC flow in beta 30 may override or drop it

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- The `jwt` callback must continue to store `account.access_token` in the token and `profile.battletag` in the token
- The `session` callback must continue to expose `accessToken` and `user.battletag` on the session object
- The OAuth callback at `/api/auth/callback/battlenet` must continue to work (provider ID stays `"battlenet"`)
- The authorization request must continue to request `openid wow.profile` scopes
- The `profile()` function must continue to map `sub` → `id` and `battletag` → `name`

**Scope:**
All inputs that do NOT involve the provider type configuration should be completely unaffected by this fix. This includes:
- JWT and session callback logic (unchanged files/functions)
- Profile mapping function behavior
- Route handler configuration
- Any other providers or auth flows in the application

## Hypothesized Root Cause

Based on the bug description, the most likely issue is:

1. **OIDC Discovery Incompatibility**: The `type: "oidc"` configuration causes next-auth v5 beta 30 to use OpenID Connect discovery from `https://oauth.battle.net/.well-known/openid-configuration`. The discovery response or the OIDC flow implementation in this beta version fails to include the `state` parameter when constructing the authorization URL. This may be a bug in next-auth's OIDC handling or an incompatibility with Battle.net's discovery document.

2. **State Parameter Handling in OIDC vs OAuth Flows**: next-auth v5 beta 30 handles `state` differently for `"oidc"` vs `"oauth"` provider types. The OAuth flow explicitly generates and appends `state`, while the OIDC flow may rely on the OIDC library to handle it — and that library may not be doing so correctly in this version.

3. **Beta Version Regression**: This is a known class of issues in next-auth v5 beta releases where OIDC provider state handling was inconsistent. The `"oauth"` type with explicit endpoints is the stable, well-tested path.

## Correctness Properties

Property 1: Bug Condition - Authorization URL Includes State Parameter

_For any_ Battle.net login initiation using the fixed provider configuration, the generated authorization URL SHALL include a valid `state` query parameter alongside all other required OAuth parameters (`response_type`, `client_id`, `redirect_uri`, `scope`).

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation - Callback and Session Behavior Unchanged

_For any_ OAuth callback or session access after the fix, the system SHALL produce the same token/session behavior as the original code: `accessToken` stored in JWT, `battletag` extracted from profile, session object populated correctly, and provider ID remaining `"battlenet"` with `openid wow.profile` scopes.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `lib/auth/battlenet-provider.ts`

**Function**: `BattleNetProvider`

**Specific Changes**:
1. **Change provider type**: Switch `type` from `"oidc"` to `"oauth"` so next-auth uses the standard OAuth 2.0 flow which correctly handles `state`
2. **Remove issuer**: Remove the `issuer` field since it's only used for OIDC discovery and is not needed for the OAuth flow
3. **Add explicit authorization endpoint**: Add `authorization: { url: "https://oauth.battle.net/authorize", params: { scope: "openid wow.profile" } }` to explicitly specify Battle.net's authorization URL
4. **Add explicit token endpoint**: Add `token: { url: "https://oauth.battle.net/token" }` to explicitly specify Battle.net's token endpoint
5. **Add explicit userinfo endpoint**: Add `userinfo: { url: "https://oauth.battle.net/userinfo" }` to fetch user profile data since OIDC discovery is no longer used

**File**: `lib/auth/auth.ts`

**Function**: No changes expected. The callbacks and provider wiring should work identically since the provider ID, profile mapping, and callback structure remain the same.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write unit tests that instantiate the `BattleNetProvider` with the current `type: "oidc"` configuration and inspect the resulting provider config object. Verify that the configuration lacks explicit endpoint URLs and relies on OIDC discovery, confirming the root cause.

**Test Cases**:
1. **OIDC Type Confirmation**: Verify the current provider returns `type: "oidc"` confirming the buggy configuration (will fail after fix)
2. **Missing Explicit Endpoints**: Verify the current provider does not have explicit `authorization.url` or `token.url`, confirming reliance on OIDC discovery (will fail after fix)
3. **Issuer Dependency**: Verify the current provider has `issuer: "https://oauth.battle.net"`, confirming OIDC discovery dependency (will fail after fix)

**Expected Counterexamples**:
- Provider config has `type: "oidc"` instead of `"oauth"`
- No explicit authorization or token endpoint URLs are specified
- Possible cause: OIDC discovery flow in next-auth beta 30 drops `state` parameter

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL providerConfig WHERE type == "oauth" DO
  ASSERT providerConfig.authorization.url == "https://oauth.battle.net/authorize"
  ASSERT providerConfig.token.url == "https://oauth.battle.net/token"
  ASSERT providerConfig.authorization.params.scope CONTAINS "openid wow.profile"
  ASSERT providerConfig.type == "oauth"
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT BattleNetProvider_original(input).id == BattleNetProvider_fixed(input).id
  ASSERT BattleNetProvider_original(input).name == BattleNetProvider_fixed(input).name
  ASSERT BattleNetProvider_original(input).profile(sampleProfile) == BattleNetProvider_fixed(input).profile(sampleProfile)
  ASSERT BattleNetProvider_fixed(input).authorization.params.scope CONTAINS "openid wow.profile"
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many random `BattleNetProfile` objects to verify the `profile()` mapping is unchanged
- It catches edge cases in profile mapping (empty battletags, numeric IDs, special characters)
- It provides strong guarantees that non-type-related configuration is preserved

**Test Plan**: Observe behavior on UNFIXED code first for profile mapping and provider metadata, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Provider ID Preservation**: Verify the provider ID remains `"battlenet"` so callback URL `/api/auth/callback/battlenet` continues to work
2. **Profile Mapping Preservation**: Verify `profile()` continues to map `sub` → `id`, `battletag` → `name`, and sets `email`/`image` to `null`
3. **Scope Preservation**: Verify authorization params still include `openid wow.profile` scopes
4. **Callback Chain Preservation**: Verify `jwt` and `session` callbacks in `auth.ts` continue to propagate `accessToken` and `battletag`

### Unit Tests

- Test that the fixed provider config has `type: "oauth"` instead of `"oidc"`
- Test that explicit `authorization.url`, `token.url`, and `userinfo.url` are set to correct Battle.net endpoints
- Test that the `profile()` function correctly maps `BattleNetProfile` fields
- Test that the provider ID is `"battlenet"` and name is `"Battle.net"`
- Test that scopes include `openid wow.profile`

### Property-Based Tests

- Generate random `BattleNetProfile` objects (random `sub`, `id`, `battletag` values) and verify `profile()` always returns `{ id: sub, name: battletag, email: null, image: null }`
- Generate random `OAuthUserConfig` overrides and verify the fixed provider always has `type: "oauth"` and explicit endpoint URLs
- Verify preservation: for any random profile, the fixed `profile()` function produces identical output to the original

### Integration Tests

- Test the full auth configuration in `auth.ts` initializes without errors with the fixed provider
- Test that the `jwt` callback correctly stores `access_token` and `battletag` from mock account/profile objects
- Test that the `session` callback correctly populates `GamerphileSession` fields from mock token data
