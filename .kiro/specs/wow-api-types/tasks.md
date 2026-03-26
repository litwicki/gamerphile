# Tasks

## Task 1: Create common types and config migration

- [ ] 1.1 Create `lib/wow-api/types/common.ts` with `LinkReference`, `KeyReference`, `MediaReference`, `TypeName`, `LocalizedString`, `MediaAssets`, and `SelfLink` interfaces
- [ ] 1.2 Create `lib/wow-api/types/config.ts` by moving `WoWRegion`, `WoWLocale`, `WoWClientConfig`, `WoWApiError`, `WoWApiResult`, and `WoWApiToken` from the existing `types.ts`
- [ ] 1.3 Create `lib/wow-api/types/index.ts` barrel file that re-exports from `common.ts`, `config.ts`, `game-data/`, and `profile/`
- [ ] 1.4 Update `lib/wow-api/client.ts` imports to use the new `types/` path
- [ ] 1.5 Update `lib/wow-api/index.ts` barrel to re-export from `types/` instead of `types.ts`
- [ ] 1.6 Delete the old `lib/wow-api/types.ts` file

## Task 2: Create Game Data API types — Achievements through Creatures

- [ ] 2.1 Create `lib/wow-api/types/game-data/achievements.ts` with `AchievementCategoryIndex`, `AchievementCategory`, `AchievementIndex`, `Achievement`, `AchievementMedia`
- [ ] 2.2 Create `lib/wow-api/types/game-data/azerite-essences.ts` with `AzeriteEssenceIndex`, `AzeriteEssence`, `AzeriteEssenceMedia`
- [ ] 2.3 Create `lib/wow-api/types/game-data/connected-realms.ts` with `ConnectedRealmIndex`, `ConnectedRealm` and move existing `Realm`, `RealmIndex` here
- [ ] 2.4 Create `lib/wow-api/types/game-data/covenants.ts` with `CovenantIndex`, `Covenant`, `CovenantMedia`, `SoulbindIndex`, `Soulbind`, `ConduitIndex`, `Conduit`
- [ ] 2.5 Create `lib/wow-api/types/game-data/creatures.ts` with `CreatureFamilyIndex`, `CreatureFamily`, `CreatureTypeIndex`, `CreatureType`, `Creature`, `CreatureDisplayMedia`, `CreatureFamilyMedia`

## Task 3: Create Game Data API types — Guild Crests through Journal

- [ ] 3.1 Create `lib/wow-api/types/game-data/guild-crests.ts` with `GuildCrestComponentsIndex`, `GuildCrestBorderMedia`, `GuildCrestEmblemMedia`
- [ ] 3.2 Create `lib/wow-api/types/game-data/heirlooms.ts` with `HeirloomIndex`, `Heirloom`
- [ ] 3.3 Create `lib/wow-api/types/game-data/items.ts` with `ItemClassIndex`, `ItemClass`, `ItemSubclass`, `Item`, `ItemMedia`, `ItemSetIndex`, `ItemSet`
- [ ] 3.4 Create `lib/wow-api/types/game-data/journal.ts` with `JournalExpansionIndex`, `JournalExpansion`, `JournalEncounterIndex`, `JournalEncounter`, `JournalInstanceIndex`, `JournalInstance`, `JournalInstanceMedia`

## Task 4: Create Game Data API types — Media Search through Mythic Keystones

- [ ] 4.1 Create `lib/wow-api/types/game-data/media-search.ts` with `MediaSearchResult`
- [ ] 4.2 Create `lib/wow-api/types/game-data/modified-crafting.ts` with `ModifiedCraftingIndex`, `ModifiedCraftingCategoryIndex`, `ModifiedCraftingReagentSlotTypeIndex`
- [ ] 4.3 Create `lib/wow-api/types/game-data/mounts.ts` with `MountIndex`, `Mount`
- [ ] 4.4 Create `lib/wow-api/types/game-data/mythic-keystones.ts` with `MythicKeystoneAffixIndex`, `MythicKeystoneAffix`, `MythicKeystoneAffixMedia`, `MythicKeystoneDungeonIndex`, `MythicKeystoneDungeon`, `MythicKeystoneIndex`, `MythicKeystonePeriodIndex`, `MythicKeystonePeriod`, `MythicKeystoneSeasonIndex`, `MythicKeystoneSeason`, `MythicKeystoneLeaderboardIndex`, `MythicKeystoneLeaderboard`, `MythicRaidLeaderboard`

## Task 5: Create Game Data API types — Pets through Playable Specializations

- [ ] 5.1 Create `lib/wow-api/types/game-data/pets.ts` with `PetIndex`, `Pet`, `PetMedia`, `PetAbilityIndex`, `PetAbility`, `PetAbilityMedia`
- [ ] 5.2 Create `lib/wow-api/types/game-data/playable-classes.ts` with existing `PlayableClass`, `PlayableClassIndex` plus new `PlayableClassMedia`, `PlayableClassPvPTalentSlots`
- [ ] 5.3 Create `lib/wow-api/types/game-data/playable-races.ts` with `PlayableRaceIndex`, `PlayableRace`
- [ ] 5.4 Create `lib/wow-api/types/game-data/playable-specializations.ts` with `PlayableSpecializationIndex`, `PlayableSpecialization`, `PlayableSpecializationMedia`

## Task 6: Create Game Data API types — Power Types through Quests

- [ ] 6.1 Create `lib/wow-api/types/game-data/power-types.ts` with `PowerTypeIndex`, `PowerType`
- [ ] 6.2 Create `lib/wow-api/types/game-data/professions.ts` with `ProfessionIndex`, `Profession`, `ProfessionMedia`, `ProfessionSkillTier`, `Recipe`, `RecipeMedia`
- [ ] 6.3 Create `lib/wow-api/types/game-data/pvp-seasons.ts` with `PvPSeasonIndex`, `PvPSeason`, `PvPLeaderboardIndex`, `PvPLeaderboard`, `PvPRewardsIndex`
- [ ] 6.4 Create `lib/wow-api/types/game-data/pvp-tiers.ts` with `PvPTierIndex`, `PvPTier`, `PvPTierMedia`
- [ ] 6.5 Create `lib/wow-api/types/game-data/quests.ts` with `QuestIndex`, `Quest`, `QuestCategoryIndex`, `QuestCategory`, `QuestAreaIndex`, `QuestArea`, `QuestTypeIndex`, `QuestType`

## Task 7: Create Game Data API types — Reputations through WoW Token

- [ ] 7.1 Create `lib/wow-api/types/game-data/reputations.ts` with `ReputationFactionIndex`, `ReputationFaction`, `ReputationTierIndex`, `ReputationTier`
- [ ] 7.2 Create `lib/wow-api/types/game-data/spells.ts` with `Spell`, `SpellMedia`
- [ ] 7.3 Create `lib/wow-api/types/game-data/talents.ts` with `TalentTreeIndex`, `TalentTree`, `TalentTreeNodes`, `TalentIndex`, `Talent`, `PvPTalentIndex`, `PvPTalent`
- [ ] 7.4 Create `lib/wow-api/types/game-data/tech-talents.ts` with `TechTalentTreeIndex`, `TechTalentTree`, `TechTalentIndex`, `TechTalent`, `TechTalentMedia`
- [ ] 7.5 Create `lib/wow-api/types/game-data/titles.ts` with `TitleIndex`, `Title`
- [ ] 7.6 Create `lib/wow-api/types/game-data/toys.ts` with `ToyIndex`, `Toy`
- [ ] 7.7 Create `lib/wow-api/types/game-data/wow-token.ts` with `WoWTokenIndex`
- [ ] 7.8 Create `lib/wow-api/types/game-data/index.ts` barrel file re-exporting all game data types

## Task 8: Create Profile API types

- [ ] 8.1 Create `lib/wow-api/types/profile/character.ts` with all character profile types: `CharacterProfileSummary`, `CharacterAchievementsSummary`, `CharacterAchievementStatistics`, `CharacterAppearanceSummary`, `CharacterCollectionsIndex`, `CharacterHeirloomsCollectionSummary`, `CharacterMountsCollectionSummary`, `CharacterPetsCollectionSummary`, `CharacterToysCollectionSummary`, `CharacterTransmogsCollectionSummary`, `CharacterDungeons`, `CharacterEncountersSummary`, `CharacterRaids`, `CharacterEquipmentSummary`, `CharacterHunterPetsSummary`, `CharacterMediaSummary`, `CharacterMythicKeystoneProfileIndex`, `CharacterMythicKeystoneSeasonDetails`, `CharacterProfessionsSummary`, `CharacterPvPBracketStatistics`, `CharacterPvPSummary`, `CharacterCompletedQuests`, `CharacterReputationsSummary`, `CharacterSoulbinds`, `CharacterSpecializationsSummary`, `CharacterStatisticsSummary`, `CharacterTitlesSummary` — plus preserve existing `CharacterProfile` and `CharacterMedia` shapes
- [ ] 8.2 Create `lib/wow-api/types/profile/guild.ts` with `Guild`, `GuildActivity`, `GuildAchievements`, `GuildRoster`
- [ ] 8.3 Create `lib/wow-api/types/profile/account.ts` with `AccountProfileSummary`, `ProtectedCharacterProfileSummary`, `AccountCollectionsIndex`, `AccountMountsCollectionSummary`, `AccountPetsCollectionSummary`, `AccountToysCollectionSummary`, `AccountHeirloomsCollectionSummary`, `AccountTransmogsCollectionSummary`
- [ ] 8.4 Create `lib/wow-api/types/profile/index.ts` barrel file re-exporting all profile types

## Task 9: Update imports and verify compilation

- [ ] 9.1 Update all existing test files that import from `lib/wow-api/types` or `lib/wow-api` to use the new paths
- [ ] 9.2 Run TypeScript compilation to verify all types compile without errors
- [ ] 9.3 Run existing test suite to verify no regressions
