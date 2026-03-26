"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Avatar from "@radix-ui/react-avatar";
import { User } from "lucide-react";
import { getInitials } from "@/lib/utils";

export interface MenuItemConfig {
  label: string;
  href: string;
}

export const MENU_ITEMS: MenuItemConfig[] = [
  { label: "Guilds", href: "/guilds" },
  { label: "Characters", href: "/characters" },
  { label: "Interface", href: "/interface" },
];

export function AvatarMenu() {
  const { data: session } = useSession();

  const userImage = session?.user?.image;
  const userName = session?.user?.name;
  const initials = getInitials(userName);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="User menu"
          className="inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-3 outline-none hover:bg-accent focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        >
          <Avatar.Root className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted">
            <Avatar.Image
              src={userImage ?? undefined}
              alt={userName ?? "User avatar"}
              className="h-full w-full object-cover"
            />
            <Avatar.Fallback
              delayMs={300}
              className="flex h-full w-full items-center justify-center text-xs font-medium text-muted-foreground"
            >
              {userName ? initials : <User className="h-4 w-4" />}
            </Avatar.Fallback>
          </Avatar.Root>
          {userName && (
            <span className="text-sm font-medium text-foreground">{userName}</span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="end"
          className="z-50 min-w-[160px] rounded-md border border-border bg-popover p-1 shadow-md"
        >
          {MENU_ITEMS.map((item) => (
            <DropdownMenu.Item key={item.href} asChild>
              <Link
                href={item.href}
                className="flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm text-popover-foreground outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              >
                {item.label}
              </Link>
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item
            onSelect={() => signOut({ callbackUrl: "/" })}
            className="flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm text-popover-foreground outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          >
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
