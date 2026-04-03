/** Map WoW class display names to Tailwind text-color utility classes */
export const CLASS_COLOR_MAP: Record<string, string> = {
  "Death Knight": "text-death-knight",
  "Demon Hunter": "text-demon-hunter",
  Druid: "text-druid",
  Evoker: "text-evoker",
  Hunter: "text-hunter",
  Mage: "text-mage",
  Monk: "text-monk",
  Paladin: "text-paladin",
  Priest: "text-priest",
  Rogue: "text-rogue",
  Shaman: "text-shaman",
  Warlock: "text-warlock",
  Warrior: "text-warrior",
};

export function classColor(className: string | undefined): string {
  if (!className) return "text-foreground";
  return CLASS_COLOR_MAP[className] ?? "text-foreground";
}
