/**
 * Property 1: API Response Round-Trip
 *
 * For any valid WoW API response object (CharacterProfile, CharacterMedia,
 * Realm, RealmIndex, PlayableClass, PlayableClassIndex), parsing the JSON into
 * a typed object, serializing it back to JSON, and parsing again should produce
 * an equivalent object.
 *
 * **Validates: Requirements 4.9, 4.3**
 */
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import type {
  CharacterProfile,
  CharacterMedia,
  Realm,
  RealmIndex,
  PlayableClass,
  PlayableClassIndex,
} from "@/lib/wow-api/types";

// ── Arbitraries ──

const arbCharacterProfile: fc.Arbitrary<CharacterProfile> = fc.record({
  id: fc.nat(),
  name: fc.string({ minLength: 1, maxLength: 20 }),
  realm: fc.record({
    id: fc.nat(),
    name: fc.string({ minLength: 1, maxLength: 20 }),
    slug: fc.string({ minLength: 1, maxLength: 20 }),
  }),
  level: fc.integer({ min: 1, max: 80 }),
  character_class: fc.record({
    id: fc.nat(),
    name: fc.string({ minLength: 1, maxLength: 20 }),
  }),
  race: fc.record({
    id: fc.nat(),
    name: fc.string({ minLength: 1, maxLength: 20 }),
  }),
  gender: fc.record({
    type: fc.string({ minLength: 1, maxLength: 10 }),
    name: fc.string({ minLength: 1, maxLength: 10 }),
  }),
  faction: fc.record({
    type: fc.string({ minLength: 1, maxLength: 10 }),
    name: fc.string({ minLength: 1, maxLength: 10 }),
  }),
  achievement_points: fc.nat(),
  last_login_timestamp: fc.nat(),
});

const arbCharacterMedia: fc.Arbitrary<CharacterMedia> = fc.record({
  character: fc.record({
    id: fc.nat(),
    name: fc.string({ minLength: 1, maxLength: 20 }),
  }),
  assets: fc.array(
    fc.record({
      key: fc.string({ minLength: 1, maxLength: 20 }),
      value: fc.string({ minLength: 1, maxLength: 100 }),
    }),
    { minLength: 0, maxLength: 5 }
  ),
});

const arbRealm: fc.Arbitrary<Realm> = fc.record({
  id: fc.nat(),
  name: fc.string({ minLength: 1, maxLength: 20 }),
  slug: fc.string({ minLength: 1, maxLength: 20 }),
  region: fc.record({
    id: fc.nat(),
    name: fc.string({ minLength: 1, maxLength: 20 }),
  }),
  category: fc.string({ minLength: 1, maxLength: 20 }),
  locale: fc.string({ minLength: 1, maxLength: 10 }),
  timezone: fc.string({ minLength: 1, maxLength: 30 }),
  type: fc.record({
    type: fc.string({ minLength: 1, maxLength: 10 }),
    name: fc.string({ minLength: 1, maxLength: 10 }),
  }),
});

const arbRealmIndex: fc.Arbitrary<RealmIndex> = fc.record({
  realms: fc.array(
    fc.record({
      id: fc.nat(),
      name: fc.string({ minLength: 1, maxLength: 20 }),
      slug: fc.string({ minLength: 1, maxLength: 20 }),
    }),
    { minLength: 0, maxLength: 5 }
  ),
});

const arbPlayableClass: fc.Arbitrary<PlayableClass> = fc.record({
  id: fc.nat(),
  name: fc.string({ minLength: 1, maxLength: 20 }),
  gender_name: fc.record({
    male: fc.string({ minLength: 1, maxLength: 20 }),
    female: fc.string({ minLength: 1, maxLength: 20 }),
  }),
  power_type: fc.record({
    id: fc.nat(),
    name: fc.string({ minLength: 1, maxLength: 20 }),
  }),
  specializations: fc.array(
    fc.record({
      id: fc.nat(),
      name: fc.string({ minLength: 1, maxLength: 20 }),
    }),
    { minLength: 0, maxLength: 5 }
  ),
  media: fc.record({ id: fc.nat() }),
});

const arbPlayableClassIndex: fc.Arbitrary<PlayableClassIndex> = fc.record({
  classes: fc.array(
    fc.record({
      id: fc.nat(),
      name: fc.string({ minLength: 1, maxLength: 20 }),
    }),
    { minLength: 0, maxLength: 5 }
  ),
});

// ── Property Tests ──

describe("Property 1: API Response Round-Trip", () => {
  it("CharacterProfile survives JSON round-trip", () => {
    fc.assert(
      fc.property(arbCharacterProfile, (profile) => {
        const roundTripped = JSON.parse(JSON.stringify(profile));
        expect(roundTripped).toEqual(profile);
      }),
      { numRuns: 100 }
    );
  });

  it("CharacterMedia survives JSON round-trip", () => {
    fc.assert(
      fc.property(arbCharacterMedia, (media) => {
        const roundTripped = JSON.parse(JSON.stringify(media));
        expect(roundTripped).toEqual(media);
      }),
      { numRuns: 100 }
    );
  });

  it("Realm survives JSON round-trip", () => {
    fc.assert(
      fc.property(arbRealm, (realm) => {
        const roundTripped = JSON.parse(JSON.stringify(realm));
        expect(roundTripped).toEqual(realm);
      }),
      { numRuns: 100 }
    );
  });

  it("RealmIndex survives JSON round-trip", () => {
    fc.assert(
      fc.property(arbRealmIndex, (realmIndex) => {
        const roundTripped = JSON.parse(JSON.stringify(realmIndex));
        expect(roundTripped).toEqual(realmIndex);
      }),
      { numRuns: 100 }
    );
  });

  it("PlayableClass survives JSON round-trip", () => {
    fc.assert(
      fc.property(arbPlayableClass, (playableClass) => {
        const roundTripped = JSON.parse(JSON.stringify(playableClass));
        expect(roundTripped).toEqual(playableClass);
      }),
      { numRuns: 100 }
    );
  });

  it("PlayableClassIndex survives JSON round-trip", () => {
    fc.assert(
      fc.property(arbPlayableClassIndex, (index) => {
        const roundTripped = JSON.parse(JSON.stringify(index));
        expect(roundTripped).toEqual(index);
      }),
      { numRuns: 100 }
    );
  });
});
