export interface WowTheme {
  id: string;
  label: string;
  cssClass: string;
}

export const WOW_THEMES: WowTheme[] = [
  { id: "default", label: "Default", cssClass: "" },
  { id: "death-knight", label: "Death Knight", cssClass: "theme-death-knight" },
  { id: "demon-hunter", label: "Demon Hunter", cssClass: "theme-demon-hunter" },
  { id: "druid", label: "Druid", cssClass: "theme-druid" },
  { id: "evoker", label: "Evoker", cssClass: "theme-evoker" },
  { id: "hunter", label: "Hunter", cssClass: "theme-hunter" },
  { id: "mage", label: "Mage", cssClass: "theme-mage" },
  { id: "monk", label: "Monk", cssClass: "theme-monk" },
  { id: "paladin", label: "Paladin", cssClass: "theme-paladin" },
  { id: "priest", label: "Priest", cssClass: "theme-priest" },
  { id: "rogue", label: "Rogue", cssClass: "theme-rogue" },
  { id: "shaman", label: "Shaman", cssClass: "theme-shaman" },
  { id: "warlock", label: "Warlock", cssClass: "theme-warlock" },
  { id: "warrior", label: "Warrior", cssClass: "theme-warrior" },
];
