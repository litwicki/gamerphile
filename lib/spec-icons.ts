/**
 * Map of "ClassName-SpecName" to the Blizzard spell icon slug used for that spec.
 * Icons served via render.worldofwarcraft.com/icons/56/{slug}.jpg
 */
const SPEC_ICON_MAP: Record<string, string> = {
  // Death Knight
  "death knight-blood": "spell_deathknight_bloodpresence",
  "death knight-frost": "spell_deathknight_frostpresence",
  "death knight-unholy": "spell_deathknight_unholypresence",
  // Demon Hunter
  "demon hunter-havoc": "ability_demonhunter_specdps",
  "demon hunter-vengeance": "ability_demonhunter_spectank",
  // Druid
  "druid-balance": "spell_nature_starfall",
  "druid-feral": "ability_druid_catform",
  "druid-guardian": "ability_racial_bearform",
  "druid-restoration": "spell_nature_healingtouch",
  // Evoker
  "evoker-devastation": "classicon_evoker_devastation",
  "evoker-preservation": "classicon_evoker_preservation",
  "evoker-augmentation": "classicon_evoker_augmentation",
  // Hunter
  "hunter-beast mastery": "ability_hunter_bestialdiscipline",
  "hunter-marksmanship": "ability_hunter_focusedaim",
  "hunter-survival": "ability_hunter_camouflage",
  // Mage
  "mage-arcane": "spell_holy_magicalsentry",
  "mage-fire": "spell_fire_firebolt02",
  "mage-frost": "spell_frost_frostbolt02",
  // Monk
  "monk-brewmaster": "spell_monk_brewmaster_spec",
  "monk-mistweaver": "spell_monk_mistweaver_spec",
  "monk-windwalker": "spell_monk_windwalker_spec",
  // Paladin
  "paladin-holy": "spell_holy_holybolt",
  "paladin-protection": "ability_paladin_shieldofthetemplar",
  "paladin-retribution": "spell_holy_auraoflight",
  // Priest
  "priest-discipline": "spell_holy_powerwordshield",
  "priest-holy": "spell_holy_guardianspirit",
  "priest-shadow": "spell_shadow_shadowwordpain",
  // Rogue
  "rogue-assassination": "ability_rogue_deadlybrew",
  "rogue-outlaw": "ability_rogue_waylay",
  "rogue-subtlety": "ability_stealth",
  // Shaman
  "shaman-elemental": "spell_nature_lightning",
  "shaman-enhancement": "spell_shaman_improvedstormstrike",
  "shaman-restoration": "spell_nature_magicimmunity",
  // Warlock
  "warlock-affliction": "spell_shadow_deathcoil",
  "warlock-demonology": "spell_shadow_metamorphosis",
  "warlock-destruction": "spell_shadow_rainoffire",
  // Warrior
  "warrior-arms": "ability_warrior_savageblow",
  "warrior-fury": "ability_warrior_innerrage",
  "warrior-protection": "ability_warrior_defensivestance",
};

/**
 * Get the spec icon URL for a given class and spec name.
 * Falls back to a generic class icon if the spec isn't mapped.
 */
export function specIconUrl(className: string, specName: string): string | null {
  const key = `${className.toLowerCase()}-${specName.toLowerCase()}`;
  const slug = SPEC_ICON_MAP[key];
  if (!slug) return null;
  return `https://render.worldofwarcraft.com/us/icons/56/${slug}.jpg`;
}
