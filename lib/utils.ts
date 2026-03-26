import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(battletag: string | undefined | null): string {
  if (!battletag || battletag.trim() === "") return "?";
  const name = battletag.split("#")[0];
  if (!name) return "?";
  return name.slice(0, 2).toUpperCase();
}
