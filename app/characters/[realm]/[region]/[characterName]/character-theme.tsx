"use client";

import { useEffect } from "react";

interface Props {
  cssClass: string;
}

export function CharacterTheme({ cssClass }: Props) {
  useEffect(() => {
    const html = document.documentElement;
    // Swap out whatever theme is currently active
    Array.from(html.classList)
      .filter((c) => c.startsWith("theme-"))
      .forEach((c) => html.classList.remove(c));
    html.classList.add(cssClass);

    return () => {
      // On unmount, restore the user's saved theme
      html.classList.remove(cssClass);
      try {
        const stored = localStorage.getItem("gamerphile-theme") || "midnight";
        const valid = [
          "midnight", "death-knight", "demon-hunter", "druid", "evoker",
          "hunter", "mage", "monk", "paladin", "priest", "rogue",
          "shaman", "warlock", "warrior",
        ];
        html.classList.add("theme-" + (valid.includes(stored) ? stored : "midnight"));
      } catch {
        html.classList.add("theme-midnight");
      }
    };
  }, [cssClass]);

  return null;
}
