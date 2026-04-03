"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type {
  MythicPlusBestRun,
  EnrichedRunPlayer,
  RunGearItem,
} from "@/lib/raiderio/types";
import { classColor } from "@/lib/class-colors";
import { specIconUrl } from "@/lib/spec-icons";

export interface RunDetailModalProps {
  player: EnrichedRunPlayer;
  run: MythicPlusBestRun;
  open: boolean;
  onClose: () => void;
}

/** Build a spec icon URL via RaiderIO CDN */
function specBadgeUrl(specName: string): string {
  const slug = specName.toLowerCase().replace(/\s+/g, "-");
  return `https://cdnassets.raider.io/images/wow/icons/medium/spec_${slug}.jpg`;
}

function formatRole(role: string): string {
  switch (role.toLowerCase()) {
    case "tank": return "Tank";
    case "healer": return "Healer";
    case "dps": return "DPS";
    default: return role;
  }
}

function roleIcon(role: string): string {
  switch (role.toLowerCase()) {
    case "tank": return "🛡️";
    case "healer": return "💚";
    case "dps": return "⚔️";
    default: return "👤";
  }
}

function upgradeColor(upgrades: number): string {
  switch (upgrades) {
    case 3: return "text-green-400";
    case 2: return "text-yellow-400";
    case 1: return "text-orange-400";
    default: return "text-red-400";
  }
}

const QUALITY_COLORS: Record<number, string> = {
  1: "text-muted-foreground",  // Common
  2: "text-green-400",         // Uncommon
  3: "text-blue-400",          // Rare
  4: "text-purple-400",        // Epic
  5: "text-orange-400",        // Legendary
};

const SLOT_LABELS: Record<string, string> = {
  head: "Head", neck: "Neck", shoulder: "Shoulder", back: "Back",
  chest: "Chest", waist: "Waist", wrist: "Wrist", hands: "Hands",
  legs: "Legs", feet: "Feet", finger1: "Ring 1", finger2: "Ring 2",
  trinket1: "Trinket 1", trinket2: "Trinket 2", mainhand: "Main Hand", offhand: "Off Hand",
};

const SLOT_ORDER = [
  "head", "neck", "shoulder", "back", "chest", "wrist",
  "hands", "waist", "legs", "feet",
  "finger1", "finger2", "trinket1", "trinket2",
  "mainhand", "offhand",
];

function GearSlotRow({ slot, item }: { slot: string; item: RunGearItem | null }) {
  if (!item) return null;
  const qualityClass = QUALITY_COLORS[item.item_quality] ?? "text-foreground";
  const isTier = item.tier != null;

  return (
    <div className="flex items-start justify-between gap-2 py-1">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 w-16 shrink-0">
            {SLOT_LABELS[slot] ?? slot}
          </span>
          <span className={`truncate text-xs font-medium ${qualityClass}`}>
            {item.name}
          </span>
          {isTier && (
            <span className="shrink-0 rounded bg-amber-500/20 px-1 py-px text-[9px] font-semibold text-amber-400">
              T{item.tier}
            </span>
          )}
        </div>
        {(item.enchants_detail.length > 0 || item.gems_detail.length > 0) && (
          <div className="ml-[4.25rem] flex flex-wrap gap-x-2 text-[10px] text-muted-foreground/70">
            {item.enchants_detail.map((e, i) => (
              <span key={`e-${i}`} className="text-green-400/70">⚡ {e.name}</span>
            ))}
            {item.gems_detail.map((g, i) => (
              <span key={`g-${i}`} className="text-cyan-400/70">💎 {g.name}</span>
            ))}
          </div>
        )}
      </div>
      <span className="shrink-0 text-xs font-mono text-muted-foreground">{item.item_level}</span>
    </div>
  );
}

export function RunDetailModal({ player, run, open, onClose }: RunDetailModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "gear">("overview");
  const [copyFeedback, setCopyFeedback] = useState(false);

  const characterName = player.character.name;
  const characterClass = player.character.class?.name ?? "Unknown";
  const characterSpec = player.character.spec?.name ?? "Unknown";
  const role = player.role;
  const region = player.character.region?.slug ?? "us";
  const realm = player.character.realm?.slug ?? "unknown";

  const specIcon = specIconUrl(characterClass, characterSpec);

  const handleCopyTalents = useCallback(async () => {
    const text = player.talentLoadoutText
      ? player.talentLoadoutText
      : `${characterName} - ${characterSpec} ${characterClass}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch { /* clipboard may not be available */ }
  }, [player.talentLoadoutText, characterName, characterSpec, characterClass]);

  const handleCharacterProfile = useCallback(() => {
    router.push(`/${region}/${realm}/${characterName.toLowerCase()}`);
    onClose();
  }, [router, region, realm, characterName, onClose]);

  // Count tier pieces
  const tierCount = player.gear
    ? SLOT_ORDER.filter((s) => {
        const item = player.gear[s as keyof typeof player.gear];
        return item?.tier != null;
      }).length
    : 0;

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-0 shadow-xl focus:outline-none overflow-hidden flex flex-col"
          aria-describedby="run-detail-description"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
            <div className="flex items-center gap-2">
              {/* Spec icon */}
              {specIcon && (
                <img
                  src={specIcon}
                  alt={`${characterSpec} icon`}
                  width={20}
                  height={20}
                  className="rounded-sm"
                />
              )}
              <Dialog.Title className={`text-sm font-semibold ${classColor(characterClass)}`}>
                {characterName}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="rounded-sm p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
                activeTab === "overview"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("gear")}
              className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
                activeTab === "gear"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Gear
            </button>
          </div>

          {/* Body — scrollable */}
          <div id="run-detail-description" className="overflow-y-auto flex-1 px-4 py-4 space-y-3">
            {activeTab === "overview" && (
              <>
                {/* Identity */}
                <div className="flex items-center gap-3">
                  {/* Character thumbnail */}
                  {player.thumbnailUrl ? (
                    <img
                      src={player.thumbnailUrl}
                      alt={`${characterName} avatar`}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-md border border-border object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-card/60 text-xl" aria-hidden="true">
                      {roleIcon(role)}
                    </span>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      {specIcon && (
                        <img
                          src={specIcon}
                          alt=""
                          width={14}
                          height={14}
                          className="rounded-sm"
                        />
                      )}
                      <p className="text-sm font-medium text-foreground">
                        {formatRole(role)} — {characterSpec} {characterClass}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {realm} ({region.toUpperCase()})
                    </p>
                  </div>
                </div>

                {/* Run Info */}
                <div className="rounded-md border border-border bg-card/40 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Run Details
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Dungeon</span>
                      <p className="font-medium text-foreground">{run.dungeon}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Key Level</span>
                      <p className="font-medium text-foreground">+{run.mythic_level}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Score</span>
                      <p className="font-mono font-semibold text-foreground">{run.score.toFixed(1)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Upgrades</span>
                      <p className={`font-medium ${upgradeColor(run.num_keystone_upgrades)}`}>
                        {"★".repeat(run.num_keystone_upgrades) || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Player Stats */}
                <div className="rounded-md border border-border bg-card/40 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Player Info
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Item Level</span>
                      <p className="font-medium text-foreground">
                        {player.itemLevel != null ? Math.round(player.itemLevel) : "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tier Pieces</span>
                      <p className="font-medium text-foreground">{tierCount > 0 ? `${tierCount}pc` : "—"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Trinkets</span>
                      <div className="space-y-0.5">
                        {player.gear?.trinket1 && (
                          <p className={`text-xs font-medium ${QUALITY_COLORS[player.gear.trinket1.item_quality] ?? "text-foreground"}`}>
                            {player.gear.trinket1.name}
                          </p>
                        )}
                        {player.gear?.trinket2 && (
                          <p className={`text-xs font-medium ${QUALITY_COLORS[player.gear.trinket2.item_quality] ?? "text-foreground"}`}>
                            {player.gear.trinket2.name}
                          </p>
                        )}
                        {!player.gear?.trinket1 && !player.gear?.trinket2 && (
                          <p className="text-xs text-foreground">—</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">M+ Score</span>
                      <p className="font-mono font-semibold text-foreground">
                        {player.ranks?.score != null ? player.ranks.score.toFixed(1) : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Talent loadout */}
                <div className="rounded-md border border-border bg-card/40 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                      Talents
                    </p>
                    {player.talentLoadoutText && (
                      <button
                        type="button"
                        onClick={handleCopyTalents}
                        className="text-[10px] text-primary hover:underline cursor-pointer"
                      >
                        {copyFeedback ? "Copied!" : "Copy loadout"}
                      </button>
                    )}
                  </div>
                  {player.talentLoadoutText ? (
                    <p className="mt-1 break-all font-mono text-[10px] leading-relaxed text-muted-foreground">
                      {player.talentLoadoutText}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">No talent data available</p>
                  )}
                </div>

                {/* Rankings */}
                {player.ranks && (
                  <div className="rounded-md border border-border bg-card/40 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                      M+ Rankings
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-sm text-center">
                      <div>
                        <span className="text-muted-foreground text-xs">World</span>
                        <p className="font-mono font-semibold text-foreground">#{player.ranks.world.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Region</span>
                        <p className="font-mono font-semibold text-foreground">#{player.ranks.region.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Realm</span>
                        <p className="font-mono font-semibold text-foreground">#{player.ranks.realm.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile link */}
                <button
                  type="button"
                  onClick={handleCharacterProfile}
                  className="w-full rounded-md border border-border bg-card/40 px-3 py-2 text-xs text-primary hover:bg-accent/30 transition-colors cursor-pointer text-center"
                >
                  View full character profile →
                </button>
              </>
            )}

            {activeTab === "gear" && (
              <div className="divide-y divide-border/30">
                {SLOT_ORDER.map((slot) => (
                  <GearSlotRow
                    key={slot}
                    slot={slot}
                    item={player.gear?.[slot as keyof typeof player.gear] ?? null}
                  />
                ))}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
