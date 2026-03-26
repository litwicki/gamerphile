# Design Document

## Overview

Add World of Warcraft class colors as Tailwind CSS custom colors in the existing theme configuration. This enables `text-{class}`, `bg-{class}`, `border-{class}`, and their `-muted` variants as standard Tailwind utility classes.

## Architecture

### Approach

The implementation extends the existing Tailwind theme in `tailwind.config.ts` by adding WoW class color entries under `theme.extend.colors`. Each class is defined as an object with a `DEFAULT` key (the full hex color) and a `muted` key (the hex color at 40% opacity using 8-digit hex notation). This approach:

- Requires no additional dependencies or plugins
- Leverages Tailwind's built-in color system so `text-*`, `bg-*`, and `border-*` utilities are auto-generated
- Preserves all existing theme colors via the `extend` mechanism

### Color Definitions

The following WoW class colors will be added (source: Wowpedia Class_colors):

| Class Key       | Hex       | Muted (40% opacity) |
|-----------------|-----------|----------------------|
| death-knight    | #C41E3A   | #C41E3A66            |
| demon-hunter    | #A330C9   | #A330C966            |
| druid           | #FF7C0A   | #FF7C0A66            |
| evoker          | #33937F   | #33937F66            |
| hunter          | #AAD372   | #AAD37266            |
| mage            | #3FC7EB   | #3FC7EB66            |
| monk            | #00FF98   | #00FF9866            |
| paladin         | #F48CBA   | #F48CBA66            |
| priest          | #FFFFFF   | #FFFFFF66            |
| rogue           | #FFF468   | #FFF46866            |
| shaman          | #0070DD   | #0070DD66            |
| warlock         | #8788EE   | #8788EE66            |
| warrior         | #C69B6D   | #C69B6D66            |

### Tailwind Config Structure

Each class color is defined as an object with `DEFAULT` and `muted` keys:

```typescript
// tailwind.config.ts - theme.extend.colors
{
  warrior: {
    DEFAULT: "#C69B6D",
    muted: "#C69B6D66",
  },
  // ... same pattern for all 13 classes
}
```

This generates the following utility classes automatically:
- `text-warrior` / `bg-warrior` / `border-warrior` → uses `DEFAULT` (#C69B6D)
- `text-warrior-muted` / `bg-warrior-muted` / `border-warrior-muted` → uses `muted` (#C69B6D66)

### Conflict Analysis

Reviewing the default Tailwind v3 color palette, none of the 13 WoW class names conflict with built-in Tailwind color names (red, blue, green, etc.). No namespacing is needed.

## Files to Modify

| File | Change |
|------|--------|
| `tailwind.config.ts` | Add 13 WoW class color entries under `theme.extend.colors` |

No new files are needed. No changes to `globals.css` are required since the colors are defined as static hex values, not CSS custom properties.

## Correctness Properties

### Property 1: All 13 WoW classes are defined in the Tailwind config

For all class names in the set {death-knight, demon-hunter, druid, evoker, hunter, mage, monk, paladin, priest, rogue, shaman, warlock, warrior}, the Tailwind config `theme.extend.colors` object contains a matching key.

### Property 2: Each class color has both DEFAULT and muted keys

For each WoW class color entry in the Tailwind config, the value is an object containing exactly a `DEFAULT` key and a `muted` key.

### Property 3: Muted values are the DEFAULT hex with 66 (40% opacity) suffix

For each WoW class color entry, the `muted` value equals the `DEFAULT` value concatenated with `66`.

### Property 4: No existing theme colors are removed

The set of color keys in the current `theme.extend.colors` (border, input, ring, background, foreground, primary, secondary, destructive, muted, accent, popover, card) remains present after adding WoW class colors.

### Property 5: Class color hex values match official Wowpedia values

Each class color `DEFAULT` value matches the canonical hex from the Wowpedia Class_colors reference table.
