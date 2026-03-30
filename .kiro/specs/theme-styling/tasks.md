# Tasks

## Task 1: Update default content width

- [x] 1.1 Update `globals.css` `:root` `--max-viewport` from `1024px` to `1280px`
- [x] 1.2 Update `UltrawideProvider` to toggle between `1280px` (off) and `1920px` (on) instead of `1024px`/`1280px`
- [x] 1.3 Verify `npm run build` completes with 0 warnings/errors

## Task 2: Redesign footer — three-column layout

- [x] 2.1 Rewrite `components/layout/footer.tsx` with a responsive three-column grid (`grid-cols-1 md:grid-cols-3`)
- [x] 2.2 Implement Logo_Column with Raider.IO and WarcraftLogs logos as external links (`target="_blank"`, `rel="noopener noreferrer"`, descriptive `alt` text), with "WarcraftLogs" text adjacent to the WarcraftLogs logo
- [x] 2.3 Implement Patreon_Column with support messaging and a link to the Gamerphile Patreon page
- [x] 2.4 Implement Nav_Column as a `<nav aria-label="Footer navigation">` with text-only `Link` components to Home, News, Characters, and UI
- [x] 2.5 Verify `npm run build` completes with 0 warnings/errors

## Task 3: Add legal section to footer

- [x] 3.1 Add a horizontal divider (`<hr>`) below the three-column grid
- [x] 3.2 Add centered copyright line with dynamic year and "Gamerphile", plus "Privacy Policy" and "Terms and Conditions" text links
- [x] 3.3 Add centered Blizzard disclaimer text below the copyright line
- [x] 3.4 Verify `npm run build` completes with 0 warnings/errors

## Task 4: Write unit tests for footer

- [x] 4.1 Write unit tests in `__tests__/unit/footer.test.tsx` covering: three columns rendered, logo links with correct hrefs and `target="_blank"`, WarcraftLogs text, Patreon link, nav links to all core pages, `<nav>` with `aria-label`, legal section content (year, copyright, policy links, disclaimer), divider presence, and `max-w-[var(--max-viewport)]` container
- [x] 4.2 Verify tests pass with `npm run test`

## Task 5: Write property-based tests

- [x] 5.1 Write property test for Property 1 (UltrawideProvider width mapping) in `__tests__/property/theme-styling-properties.test.tsx`
- [x] 5.2 Write property test for Property 2 (Nav link route correctness) in the same file
- [x] 5.3 Write property test for Property 3 (Footer links have accessible names) in the same file
- [x] 5.4 Write property test for Property 4 (External links have security attributes) in the same file
- [x] 5.5 Verify all property tests pass with `npm run test`
