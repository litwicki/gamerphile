# Requirements Document

## Introduction

Replace the text-based authentication status in the AppBar with an avatar icon button and dropdown menu for authenticated users. The avatar displays the user's WoW profile image (fetched via the `wow.profile` scope). The dropdown menu provides navigation to Guilds, Characters, and Interface pages. Unauthenticated users continue to see the existing Sign In link.

## Glossary

- **AppBar**: The sticky top navigation header rendered by `components/layout/app-bar.tsx`.
- **Avatar_Button**: A clickable circular image element in the top-right area of the AppBar that displays the authenticated user's WoW profile image.
- **Avatar_Menu**: A dropdown menu triggered by the Avatar_Button containing navigation options.
- **Profile_Image**: The user's WoW character avatar image URL obtained via the Battle.net API using the `wow.profile` OAuth scope.
- **Session**: The NextAuth session object containing user authentication state and profile data.
- **Fallback_Avatar**: A placeholder visual (initials or generic icon) displayed when no Profile_Image is available.

## Requirements

### Requirement 1: Display Avatar Button for Authenticated Users

**User Story:** As an authenticated user, I want to see my WoW profile image as an avatar in the AppBar, so that I have a personalized visual indicator of my logged-in state.

#### Acceptance Criteria

1. WHEN a user is authenticated, THE AppBar SHALL display an Avatar_Button in the top-right area instead of the current text-based name and sign-out link.
2. THE Avatar_Button SHALL render the user's Profile_Image as a circular avatar.
3. IF the Profile_Image is unavailable or fails to load, THEN THE Avatar_Button SHALL display a Fallback_Avatar derived from the user's battletag initials.
4. WHILE the authentication status is loading, THE AppBar SHALL display a placeholder skeleton element in the Avatar_Button position.

### Requirement 2: Provide Profile Image via Session

**User Story:** As a developer, I want the user's WoW profile image URL to be available in the session, so that the AppBar can display it without additional API calls on every render.

#### Acceptance Criteria

1. WHEN a user authenticates via Battle.net, THE Session SHALL include the user's Profile_Image URL obtained from the WoW profile API.
2. IF the WoW profile API call fails during authentication, THEN THE Session SHALL set the Profile_Image to null and authentication SHALL proceed without interruption.
3. THE Session SHALL store the Profile_Image URL in the `user.image` field of the GamerphileSession type.

### Requirement 3: Avatar Dropdown Menu

**User Story:** As an authenticated user, I want to click my avatar to see a dropdown menu with navigation options, so that I can quickly access key sections of the application.

#### Acceptance Criteria

1. WHEN the user clicks the Avatar_Button, THE Avatar_Menu SHALL open and display three menu items: "Guilds", "Characters", and "Interface".
2. THE Avatar_Menu SHALL display the menu items in the following order: Guilds, Characters, Interface.
3. WHEN the user clicks a menu item, THE Avatar_Menu SHALL navigate the user to the corresponding page.
4. WHEN the user clicks outside the Avatar_Menu or presses the Escape key, THE Avatar_Menu SHALL close.
5. THE Avatar_Menu SHALL be keyboard-navigable using arrow keys, Enter, and Escape.

### Requirement 4: Unauthenticated User Experience

**User Story:** As an unauthenticated user, I want to see a sign-in option in the AppBar, so that I can authenticate with Battle.net.

#### Acceptance Criteria

1. WHILE the user is unauthenticated, THE AppBar SHALL display the existing "Sign in" link instead of the Avatar_Button.
2. THE AppBar SHALL NOT display the Avatar_Button or Avatar_Menu for unauthenticated users.

### Requirement 5: Accessibility

**User Story:** As a user relying on assistive technology, I want the avatar menu to be fully accessible, so that I can navigate the application using a keyboard or screen reader.

#### Acceptance Criteria

1. THE Avatar_Button SHALL have an accessible label describing its purpose (e.g., "User menu").
2. THE Avatar_Menu SHALL use appropriate ARIA roles for menu, menuitem, and trigger elements.
3. WHEN the Avatar_Menu is open, THE Avatar_Menu SHALL trap focus within the menu items until the menu is closed.
4. THE Avatar_Button SHALL be focusable via keyboard Tab navigation.
