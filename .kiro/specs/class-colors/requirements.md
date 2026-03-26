# Requirements Document

## Introduction

This feature adds World of Warcraft class color utility classes to the application's Tailwind CSS configuration. Each WoW class gets a set of CSS utility classes for text, background, and border colors, plus muted variants of each. The colors follow the official class color hex values from Wowpedia.

## Glossary

- **Tailwind_Config**: The `tailwind.config.ts` file that defines custom theme extensions including colors
- **CSS_Globals**: The `app/globals.css` file containing base styles and CSS custom properties
- **Class_Color**: A hex color value officially assigned to a World of Warcraft playable class
- **Muted_Variant**: A reduced-opacity version of a class color, achieved by lowering the alpha channel
- **Utility_Class**: A Tailwind CSS class that applies a single style property (e.g., `bg-warrior`, `text-warrior`, `border-warrior`)

## Requirements

### Requirement 1: Define WoW Class Colors in Tailwind Configuration

**User Story:** As a developer, I want WoW class colors defined in the Tailwind theme, so that I can use them as standard Tailwind utility classes throughout the app.

#### Acceptance Criteria

1. THE Tailwind_Config SHALL define color entries for all 13 WoW classes: Death Knight (#C41E3A), Demon Hunter (#A330C9), Druid (#FF7C0A), Evoker (#33937F), Hunter (#AAD372), Mage (#3FC7EB), Monk (#00FF98), Paladin (#F48CBA), Priest (#FFFFFF), Rogue (#FFF468), Shaman (#0070DD), Warlock (#8788EE), Warrior (#C69B6D)
2. THE Tailwind_Config SHALL use lowercase hyphenated class names as color keys: death-knight, demon-hunter, druid, evoker, hunter, mage, monk, paladin, priest, rogue, shaman, warlock, warrior
3. THE Tailwind_Config SHALL define each class color under the `extend.colors` section of the theme so that existing Tailwind colors remain available

### Requirement 2: Generate Text Color Utility Classes

**User Story:** As a developer, I want text color utility classes for each WoW class, so that I can colorize text to match a character's class.

#### Acceptance Criteria

1. WHEN a developer applies a `text-{class}` utility class (e.g., `text-warrior`), THE Tailwind_Config SHALL set the text color to the corresponding WoW class hex value
2. THE Tailwind_Config SHALL generate text color utilities for all 13 WoW classes

### Requirement 3: Generate Background Color Utility Classes

**User Story:** As a developer, I want background color utility classes for each WoW class, so that I can set background colors to match a character's class.

#### Acceptance Criteria

1. WHEN a developer applies a `bg-{class}` utility class (e.g., `bg-warrior`), THE Tailwind_Config SHALL set the background color to the corresponding WoW class hex value
2. THE Tailwind_Config SHALL generate background color utilities for all 13 WoW classes

### Requirement 4: Generate Border Color Utility Classes

**User Story:** As a developer, I want border color utility classes for each WoW class, so that I can set border colors to match a character's class.

#### Acceptance Criteria

1. WHEN a developer applies a `border-{class}` utility class (e.g., `border-warrior`), THE Tailwind_Config SHALL set the border color to the corresponding WoW class hex value
2. THE Tailwind_Config SHALL generate border color utilities for all 13 WoW classes

### Requirement 5: Generate Muted Variant Utility Classes

**User Story:** As a developer, I want muted versions of each class color utility, so that I can use subtler class-colored elements for backgrounds and secondary UI.

#### Acceptance Criteria

1. THE Tailwind_Config SHALL define a muted variant for each WoW class color accessible via the `-muted` suffix (e.g., `bg-warrior-muted`, `text-warrior-muted`, `border-warrior-muted`)
2. THE Tailwind_Config SHALL set each muted variant to the class color at 40% opacity
3. THE Tailwind_Config SHALL generate muted variants for all 13 WoW classes

### Requirement 6: Preserve Existing Tailwind Theme Colors

**User Story:** As a developer, I want the new class colors to coexist with existing theme colors, so that adding WoW colors does not break any current styling.

#### Acceptance Criteria

1. THE Tailwind_Config SHALL add WoW class colors using the `extend` mechanism so that default and custom theme colors remain intact
2. IF a WoW class color key conflicts with an existing Tailwind color key, THEN THE Tailwind_Config SHALL namespace the WoW color to avoid overwriting the existing color
