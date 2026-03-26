# Tasks

## Task 1: Add WoW class color definitions to Tailwind config

- [x] 1.1 Add all 13 WoW class color entries to `theme.extend.colors` in `tailwind.config.ts`, each as an object with `DEFAULT` (hex) and `muted` (hex + 66 suffix) keys: death-knight (#C41E3A), demon-hunter (#A330C9), druid (#FF7C0A), evoker (#33937F), hunter (#AAD372), mage (#3FC7EB), monk (#00FF98), paladin (#F48CBA), priest (#FFFFFF), rogue (#FFF468), shaman (#0070DD), warlock (#8788EE), warrior (#C69B6D)
- [x] 1.2 Verify existing theme colors (border, input, ring, background, foreground, primary, secondary, destructive, muted, accent, popover, card) are preserved in the config

## Task 2: Validate generated utility classes

- [x] 2.1 Create a test file `__tests__/unit/class-colors.test.ts` that imports the Tailwind config and verifies all 13 class color keys exist under `theme.extend.colors`
- [x] 2.2 Add test assertions verifying each class color has a `DEFAULT` key matching the expected hex value and a `muted` key matching the hex value with `66` suffix
- [x] 2.3 Add test assertion verifying all pre-existing color keys remain in the config
