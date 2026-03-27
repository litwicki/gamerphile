"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Settings, Check } from "lucide-react";
import { useRegion } from "@/components/region-provider";

const PRIMARY_REGIONS = ["World", "US", "EU", "KR", "TW"] as const;

const SUBREGIONS = [
  "English", "French", "German", "Italian", "Oceanic", "Russian", "Spanish",
  "EU-English", "EU-Portuguese", "EU-Spanish",
  "US-English", "Brazil", "US-Spanish",
  "US-Central", "US-Eastern", "US-Mountain", "US-Pacific",
] as const;

export function RegionSelector() {
  const { region, setRegion } = useRegion();

  function selectRegion(value: string) {
    setRegion(value);
  }

  const itemClass =
    "flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm text-popover-foreground outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="Region settings"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Settings className="h-4 w-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="end"
          className="z-50 max-h-[400px] min-w-[180px] overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md"
        >
          <DropdownMenu.Label className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            Region
          </DropdownMenu.Label>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className={itemClass}>
              Primary
              <span className="ml-auto text-xs text-muted-foreground">▸</span>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent
                sideOffset={4}
                className="z-50 min-w-[140px] rounded-md border border-border bg-popover p-1 shadow-md"
              >
                {PRIMARY_REGIONS.map((r) => (
                  <DropdownMenu.Item key={r} onSelect={() => selectRegion(r)} className={itemClass}>
                    {region === r && <Check className="mr-2 h-3 w-3" />}
                    {region !== r && <span className="mr-2 w-3" />}
                    {r}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className={itemClass}>
              Subregion
              <span className="ml-auto text-xs text-muted-foreground">▸</span>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent
                sideOffset={4}
                className="z-50 max-h-[300px] min-w-[160px] overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md"
              >
                {SUBREGIONS.map((r) => (
                  <DropdownMenu.Item key={r} onSelect={() => selectRegion(r)} className={itemClass}>
                    {region === r && <Check className="mr-2 h-3 w-3" />}
                    {region !== r && <span className="mr-2 w-3" />}
                    {r}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function RegionSubMenu() {
  const { region, setRegion } = useRegion();

  const itemClass =
    "flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm text-popover-foreground outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground";

  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger className="flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm text-popover-foreground outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
        <Settings className="mr-2 h-4 w-4" />
        Region
        <span className="ml-auto text-xs text-muted-foreground">{region}</span>
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent
          sideOffset={4}
          className="z-50 max-h-[400px] min-w-[160px] overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md"
        >
          <DropdownMenu.Label className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            Primary
          </DropdownMenu.Label>
          {PRIMARY_REGIONS.map((r) => (
            <DropdownMenu.Item key={r} onSelect={() => setRegion(r)} className={itemClass}>
              {region === r && <Check className="mr-2 h-3 w-3" />}
              {region !== r && <span className="mr-2 w-3" />}
              {r}
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Label className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            Subregion
          </DropdownMenu.Label>
          {SUBREGIONS.map((r) => (
            <DropdownMenu.Item key={r} onSelect={() => setRegion(r)} className={itemClass}>
              {region === r && <Check className="mr-2 h-3 w-3" />}
              {region !== r && <span className="mr-2 w-3" />}
              {r}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  );
}
