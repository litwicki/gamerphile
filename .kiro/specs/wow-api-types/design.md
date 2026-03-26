# Design Document

## Overview

This design defines the approach for expanding WoW API TypeScript types to cover all Battle.net Game Data APIs and Profile APIs. The work is purely additive type definitions — no runtime behavior changes. The existing types in `lib/wow-api/types.ts` will be preserved and enhanced, with new types organized into separate files by API domain to keep file sizes manageable.

## Architecture

### File Organization

The current single `lib/wow-api/types.ts` file will be split into multiple domain-specific type files to avoid a single massive file. A barrel `types/index.ts` will re-export everything.

```
lib/wow-api/
├── client.ts              (existing, unchanged)
├── index.ts               (updated exports)
└── types/
    ├── index.ts           (barrel re-export)
    ├── common.ts          (shared reference types)
    ├── config.ts          (client config, token, result types — moved from types.ts)
    ├── game-data/
    │   ├── index.ts       (barrel re-export)
    │   ├── achievements.ts
    │   ├── azerite-essences.ts
    │   ├── connected-realms.ts
    │   ├── covenants.ts
    │   ├── creatures.ts
    │   ├── guild-crests.ts
    │   ├── heirlooms.ts
    │   ├── items.ts
    │   ├── journal.ts
    │   ├── media-search.ts
    │   ├── modified-crafting.ts
    │   ├── mounts.ts
    │   ├── mythic-keystones.ts
    │   ├── pets.ts
    │   ├── playable-classes.ts
    │   ├── playable-races.ts
    │   ├── playable-specializations.ts
    │   ├── power-types.ts
    │   ├── professions.ts
    │   ├── pvp-seasons.ts
    │   ├── pvp-tiers.ts
    │   ├── quests.ts
    │   ├── reputations.ts
    │   ├── spells.ts
    │   ├── talents.ts
    │   ├── tech-talents.ts
    │   ├── titles.ts
    │   ├── toys.ts
    │   └── wow-token.ts
    └── profile/
        ├── index.ts       (barrel re-export)
        ├── account.ts
        ├── character.ts
        └── guild.ts
```

### Common Reference Types (`common.ts`)

All Battle.net API responses share common patterns. These base types will be used throughout:

```typescript
/** Hypermedia link reference */
export interface LinkReference {
  href: string;
}

/** Keyed resource reference (most common pattern in index responses) */
export interface KeyReference {
  key: { href: string };
  id: number;
  name: string;
}

/** Media asset reference */
export interface MediaReference {
  key: { href: string };
  id: number;
}

/** Type + display name pair (used for enums like faction, gender, etc.) */
export interface TypeName {
  type: string;
  name: string;
}

/** Locale-dependent string annotation */
export type LocalizedString = string;

/** Standard media response shape */
export interface MediaAssets {
  assets: Array<{ key: string; value: string }>;
}

/** Self-link wrapper present on most responses */
export interface SelfLink {
  _links: { self: { href: string } };
}
```

### Type Pattern Conventions

Every API domain follows consistent patterns:

1. **Index types**: Contain an array of `KeyReference` items plus `_links`
2. **Detail types**: Contain full resource fields plus `_links`  
3. **Media types**: Extend `MediaAssets` with an `id` field

Example pattern for a domain:

```typescript
// Index
export interface MountIndex extends SelfLink {
  mounts: KeyReference[];
}

// Detail
export interface Mount extends SelfLink {
  id: number;
  name: LocalizedString;
  creature_displays: MediaReference[];
  description: LocalizedString;
  source: TypeName;
  faction: TypeName;
  requirements: { faction?: TypeName };
}

// Media (when applicable)
// Uses the shared MediaAssets pattern
```

### Migration Strategy for Existing Types

The existing `lib/wow-api/types.ts` will be replaced by the new `types/` directory structure. To maintain backward compatibility:

1. The existing `CharacterProfile`, `CharacterMedia`, `Realm`, `RealmIndex`, `PlayableClass`, `PlayableClassIndex` interfaces will be preserved with the same field shapes in their new locations
2. The config types (`WoWRegion`, `WoWLocale`, `WoWClientConfig`, `WoWApiError`, `WoWApiResult`, `WoWApiToken`) move to `types/config.ts`
3. The `lib/wow-api/index.ts` barrel file will be updated to re-export from the new structure
4. The `client.ts` imports will be updated to point to the new paths

### Namespace Awareness

Types will include a JSDoc comment indicating which Battle.net namespace they belong to:
- `static-{region}` — Game Data APIs
- `dynamic-{region}` — Connected Realms, Mythic Keystone Leaderboards, WoW Token
- `profile-{region}` — Profile APIs

## Correctness Properties

### Property 1: Backward Compatibility
All existing type imports from `lib/wow-api` and `lib/wow-api/types` SHALL continue to compile without changes to consuming code. The existing `CharacterProfile`, `CharacterMedia`, `Realm`, `RealmIndex`, `PlayableClass`, `PlayableClassIndex`, `WoWRegion`, `WoWLocale`, `WoWClientConfig`, `WoWApiError`, `WoWApiResult`, and `WoWApiToken` types SHALL remain available at their current import paths.

**Tested by:** TypeScript compilation of existing `client.ts` and `index.ts` files after migration.

### Property 2: Type Structural Consistency
All Index types SHALL contain an array field of `KeyReference` items. All Media types SHALL contain an `assets` array of `{ key: string; value: string }` objects. All Detail types SHALL contain an `id: number` field.

**Tested by:** TypeScript compile-time checks — a test file that assigns sample objects to each type to verify structural compliance.

### Property 3: Export Completeness
Every type defined in any file under `lib/wow-api/types/` SHALL be re-exported through the barrel files such that it is importable from `lib/wow-api`.

**Tested by:** A test file that imports every expected type name from `lib/wow-api` and verifies compilation succeeds.
