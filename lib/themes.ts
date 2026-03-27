export interface WowTheme {
  id: string;
  label: string;
  cssClass: string;
  colorClass: string;
  backgroundImage: string;
}

export const WOW_THEMES: WowTheme[] = [
  { id: "midnight", label: "Midnight", cssClass: "theme-midnight", colorClass: "text-purple-400", backgroundImage: "/themes/midnight.jpg" },
  { id: "death-knight", label: "Death Knight", cssClass: "theme-death-knight", colorClass: "text-death-knight", backgroundImage: "/themes/death-knight.jpg" },
  { id: "demon-hunter", label: "Demon Hunter", cssClass: "theme-demon-hunter", colorClass: "text-demon-hunter", backgroundImage: "/themes/demon-hunter.jpg" },
  { id: "druid", label: "Druid", cssClass: "theme-druid", colorClass: "text-druid", backgroundImage: "/themes/druid.jpg" },
  { id: "evoker", label: "Evoker", cssClass: "theme-evoker", colorClass: "text-evoker", backgroundImage: "/themes/evoker.jpg" },
  { id: "hunter", label: "Hunter", cssClass: "theme-hunter", colorClass: "text-hunter", backgroundImage: "/themes/hunter.jpg" },
  { id: "mage", label: "Mage", cssClass: "theme-mage", colorClass: "text-mage", backgroundImage: "/themes/mage.jpg" },
  { id: "monk", label: "Monk", cssClass: "theme-monk", colorClass: "text-monk", backgroundImage: "/themes/monk.jpg" },
  { id: "paladin", label: "Paladin", cssClass: "theme-paladin", colorClass: "text-paladin", backgroundImage: "/themes/paladin.jpg" },
  { id: "priest", label: "Priest", cssClass: "theme-priest", colorClass: "text-priest", backgroundImage: "/themes/priest.jpg" },
  { id: "rogue", label: "Rogue", cssClass: "theme-rogue", colorClass: "text-rogue", backgroundImage: "/themes/rogue.jpg" },
  { id: "shaman", label: "Shaman", cssClass: "theme-shaman", colorClass: "text-shaman", backgroundImage: "/themes/shaman.jpg" },
  { id: "warlock", label: "Warlock", cssClass: "theme-warlock", colorClass: "text-warlock", backgroundImage: "/themes/warlock.jpg" },
  { id: "warrior", label: "Warrior", cssClass: "theme-warrior", colorClass: "text-warrior", backgroundImage: "/themes/warrior.jpg" },
];
