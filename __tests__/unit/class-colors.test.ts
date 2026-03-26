import { describe, it, expect } from "vitest";
import config from "../../tailwind.config";

// ─── 2.1 Verify all 13 WoW class color keys exist (Req 1.1, 1.2) ───

const colors = (config.theme?.extend?.colors ?? {}) as Record<string, unknown>;

const expectedClassColors: Record<string, string> = {
  "death-knight": "#C41E3A",
  "demon-hunter": "#A330C9",
  druid: "#FF7C0A",
  evoker: "#33937F",
  hunter: "#AAD372",
  mage: "#3FC7EB",
  monk: "#00FF98",
  paladin: "#F48CBA",
  priest: "#FFFFFF",
  rogue: "#FFF468",
  shaman: "#0070DD",
  warlock: "#8788EE",
  warrior: "#C69B6D",
};

describe("WoW class colors in Tailwind config", () => {
  it("contains all 13 WoW class color keys", () => {
    const classKeys = Object.keys(expectedClassColors);
    expect(classKeys).toHaveLength(13);
    for (const key of classKeys) {
      expect(colors).toHaveProperty(key);
    }
  });

  // ─── 2.2 Verify DEFAULT and muted values for each class color (Req 1.1, 5.1, 5.2) ───

  describe.each(Object.entries(expectedClassColors))(
    "%s color values",
    (className, hex) => {
      const entry = colors[className] as { DEFAULT: string; muted: string };

      it(`has DEFAULT set to ${hex}`, () => {
        expect(entry.DEFAULT).toBe(hex);
      });

      it(`has muted set to ${hex}66`, () => {
        expect(entry.muted).toBe(`${hex}66`);
      });
    }
  );

  // ─── 2.3 Verify pre-existing color keys are preserved (Req 6.1) ───

  it("preserves all pre-existing theme color keys", () => {
    const preExistingKeys = [
      "border",
      "input",
      "ring",
      "background",
      "foreground",
      "primary",
      "secondary",
      "destructive",
      "muted",
      "accent",
      "popover",
      "card",
    ];

    for (const key of preExistingKeys) {
      expect(colors).toHaveProperty(key);
    }
  });
});
