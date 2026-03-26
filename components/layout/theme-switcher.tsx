"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Palette, Check } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { WOW_THEMES } from "@/lib/themes";

export function ThemeSubMenu() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger className="flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm text-popover-foreground outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
        <Palette className="mr-2 h-4 w-4" />
        Theme
        <span className="ml-auto text-xs text-muted-foreground">▸</span>
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent
          sideOffset={4}
          className="z-50 max-h-[300px] min-w-[160px] overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md"
        >
          {WOW_THEMES.map((t) => (
            <DropdownMenu.Item
              key={t.id}
              onSelect={() => setTheme(t.id)}
              className="flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm text-popover-foreground outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
            >
              {theme === t.id && <Check className="mr-2 h-3 w-3" />}
              {theme !== t.id && <span className="mr-2 w-3" />}
              {t.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  );
}
