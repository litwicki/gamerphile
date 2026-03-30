# Requirements Document

## Introduction

This feature covers theme and styling improvements to the Gamerphile Next.js application. The changes include increasing the default content width from 1024px to 1280px (with ultrawide extending to 1920px), and a complete redesign of the footer into a three-column layout with partner logos, a Patreon widget, and a site navigation section, followed by a legal/copyright area.

## Glossary

- **Application**: The Gamerphile Next.js web application
- **Footer**: The persistent bottom section of the Application rendered on every page
- **UltrawideProvider**: The React context provider that manages the ultrawide display mode toggle and sets the `--max-viewport` CSS custom property
- **Default_Width**: The standard maximum content width (1280px) used when ultrawide mode is disabled
- **Ultrawide_Width**: The expanded maximum content width (1920px) used when ultrawide mode is enabled
- **Logo_Column**: The first column of the Footer displaying partner logos (Raider.IO and WarcraftLogs)
- **Patreon_Column**: The second column of the Footer displaying a Patreon support widget
- **Nav_Column**: The third column of the Footer displaying text-only navigation links to core pages
- **Legal_Section**: The area below the three Footer columns containing copyright, policy links, and a Blizzard disclaimer
- **Core_Pages**: The primary navigable pages of the Application: Home, News, Characters, and UI

## Requirements

### Requirement 1: Update Default Content Width

**User Story:** As a user, I want the website content area to be wider by default, so that I can see more content without wasted horizontal space on modern displays.

#### Acceptance Criteria

1. THE UltrawideProvider SHALL set the `--max-viewport` CSS custom property to 1280px when ultrawide mode is disabled
2. THE UltrawideProvider SHALL set the `--max-viewport` CSS custom property to 1920px when ultrawide mode is enabled
3. THE Application SHALL update the `:root` CSS custom property `--max-viewport` default value from 1024px to 1280px
4. WHEN the user toggles ultrawide mode on, THE Application SHALL render content at a maximum width of 1920px
5. WHEN the user toggles ultrawide mode off, THE Application SHALL render content at a maximum width of 1280px

### Requirement 2: Footer Three-Column Layout

**User Story:** As a user, I want a well-organized footer with partner logos, a Patreon widget, and site navigation, so that I can easily find support links and navigate the site.

#### Acceptance Criteria

1. THE Footer SHALL display three columns arranged horizontally on desktop viewports
2. THE Footer SHALL stack the three columns vertically on mobile viewports
3. THE Logo_Column SHALL display the Raider.IO logo as a clickable link opening raider.io in a new tab
4. THE Logo_Column SHALL display the WarcraftLogs logo as a clickable link opening warcraftlogs.com in a new tab
5. THE Logo_Column SHALL display the text "WarcraftLogs" adjacent to the WarcraftLogs logo image with equal height to the logo image
6. THE Patreon_Column SHALL display a widget encouraging users to join Patreon and help fund the website
7. THE Patreon_Column SHALL include a clickable link or button directing users to the Gamerphile Patreon page
8. THE Nav_Column SHALL display text-only links to each of the Core_Pages: Home, News, Characters, and UI
9. WHEN a user clicks a Nav_Column link, THE Application SHALL navigate to the corresponding Core_Pages route

### Requirement 3: Footer Legal Section

**User Story:** As a user, I want to see copyright information, legal links, and a Blizzard disclaimer in the footer, so that I understand the legal context of the site.

#### Acceptance Criteria

1. THE Footer SHALL display a horizontal divider separating the three-column section from the Legal_Section
2. THE Legal_Section SHALL display a centered copyright message containing the current year and "Gamerphile"
3. THE Legal_Section SHALL display text links for "Privacy Policy" and "Terms and Conditions" adjacent to the copyright message
4. THE Legal_Section SHALL display a disclaimer stating that World of Warcraft is a registered trademark of Blizzard Entertainment and that all game images and content belong to Blizzard Entertainment
5. THE Legal_Section SHALL center-align the disclaimer text below the copyright and policy links

### Requirement 4: Footer Responsive Behavior

**User Story:** As a user on a mobile device, I want the footer to remain readable and well-structured, so that I can access all footer content regardless of screen size.

#### Acceptance Criteria

1. WHILE the viewport width is below the desktop breakpoint (768px), THE Footer SHALL stack the Logo_Column, Patreon_Column, and Nav_Column vertically
2. WHILE the viewport width is at or above the desktop breakpoint (768px), THE Footer SHALL display the Logo_Column, Patreon_Column, and Nav_Column in a horizontal row
3. THE Footer SHALL constrain its content to the `--max-viewport` CSS custom property width
4. THE Footer SHALL maintain readable text sizes and adequate spacing on all viewport widths

### Requirement 5: Footer Accessibility

**User Story:** As a user relying on assistive technology, I want the footer to be accessible, so that I can navigate and understand all footer content.

#### Acceptance Criteria

1. THE Footer SHALL include a `nav` element with an accessible label for the Nav_Column links
2. THE Footer SHALL provide descriptive `alt` text for the Raider.IO logo image
3. THE Footer SHALL provide descriptive `alt` text for the WarcraftLogs logo image
4. THE Footer SHALL ensure all clickable links have accessible names via visible text or `aria-label` attributes
5. WHEN external links open in a new tab, THE Footer SHALL include `rel="noopener noreferrer"` on those links
