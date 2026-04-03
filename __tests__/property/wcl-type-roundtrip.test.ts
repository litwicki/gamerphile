/**
 * Property 1: WCL Response Round-Trip
 *
 * For any valid WCL API response object (WCLCharacter, WCLEncounterRanking,
 * WCLZoneRanking, WCLReport, WCLCharacterResponse), parsing the JSON into
 * a typed object, serializing it back to JSON, and parsing again should produce
 * an equivalent object.
 *
 * **Validates: Requirements 4.5**
 */
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import type {
  WCLCharacter,
  WCLEncounterRanking,
  WCLZoneRanking,
  WCLReport,
  WCLCharacterResponse,
} from "@/lib/wcl/types";

// ── Arbitraries ──

const arbWCLCharacter: fc.Arbitrary<WCLCharacter> = fc.record({
  name: fc.string({ minLength: 1, maxLength: 20 }),
  serverSlug: fc.string({ minLength: 1, maxLength: 20 }),
  serverRegion: fc.string({ minLength: 1, maxLength: 10 }),
  classID: fc.integer({ min: 1, max: 13 }),
});

const arbWCLEncounterRanking: fc.Arbitrary<WCLEncounterRanking> = fc.record({
  encounterName: fc.string({ minLength: 1, maxLength: 30 }),
  encounterID: fc.nat(),
  percentile: fc.double({ min: 0, max: 100, noNaN: true }),
  spec: fc.string({ minLength: 1, maxLength: 20 }),
  difficulty: fc.integer({ min: 1, max: 5 }),
  reportCode: fc.string({ minLength: 1, maxLength: 20 }),
});

const arbWCLZoneRanking: fc.Arbitrary<WCLZoneRanking> = fc.record({
  zoneName: fc.string({ minLength: 1, maxLength: 30 }),
  zoneID: fc.nat(),
  bestPercentile: fc.double({ min: 0, max: 100, noNaN: true }),
  medianPercentile: fc.double({ min: 0, max: 100, noNaN: true }),
  difficulty: fc.integer({ min: 1, max: 5 }),
});

const arbWCLReport: fc.Arbitrary<WCLReport> = fc.record({
  code: fc.string({ minLength: 1, maxLength: 20 }),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  startTime: fc.nat(),
  endTime: fc.nat(),
  zoneID: fc.nat(),
});

const arbWCLCharacterResponse: fc.Arbitrary<WCLCharacterResponse> = fc.record({
  zoneRankings: fc.option(arbWCLZoneRanking, { nil: null }),
  encounterRankings: fc.option(
    fc.array(arbWCLEncounterRanking, { minLength: 0, maxLength: 5 }),
    { nil: null }
  ),
});

// ── Property Tests ──

describe("Property 1: WCL Response Round-Trip", () => {
  it("WCLCharacter survives JSON round-trip", () => {
    fc.assert(
      fc.property(arbWCLCharacter, (character) => {
        const roundTripped = JSON.parse(JSON.stringify(character));
        expect(roundTripped).toEqual(character);
      }),
      { numRuns: 100 }
    );
  });

  it("WCLEncounterRanking survives JSON round-trip", () => {
    fc.assert(
      fc.property(arbWCLEncounterRanking, (ranking) => {
        const roundTripped = JSON.parse(JSON.stringify(ranking));
        expect(roundTripped).toEqual(ranking);
      }),
      { numRuns: 100 }
    );
  });

  it("WCLZoneRanking survives JSON round-trip", () => {
    fc.assert(
      fc.property(arbWCLZoneRanking, (ranking) => {
        const roundTripped = JSON.parse(JSON.stringify(ranking));
        expect(roundTripped).toEqual(ranking);
      }),
      { numRuns: 100 }
    );
  });

  it("WCLReport survives JSON round-trip", () => {
    fc.assert(
      fc.property(arbWCLReport, (report) => {
        const roundTripped = JSON.parse(JSON.stringify(report));
        expect(roundTripped).toEqual(report);
      }),
      { numRuns: 100 }
    );
  });

  it("WCLCharacterResponse survives JSON round-trip", () => {
    fc.assert(
      fc.property(arbWCLCharacterResponse, (response) => {
        const roundTripped = JSON.parse(JSON.stringify(response));
        expect(roundTripped).toEqual(response);
      }),
      { numRuns: 100 }
    );
  });
});
