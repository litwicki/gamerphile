# Implementation Plan: AppBar Avatar Menu

## Overview

Replace the text-based authenticated user block in the AppBar with a circular avatar button and Radix dropdown menu. Implementation proceeds bottom-up: auth layer (JWT/session callbacks to fetch and expose the WoW profile avatar URL), utility helper (`getInitials`), new `AvatarMenu` component, and finally AppBar integration.

## Tasks

- [x] 1. Add getInitials helper to lib/utils.ts
  - [x] 1.1 Implement `getInitials(battletag)` in `lib/utils.ts`
    - Extract up to 2 uppercase characters from the portion before the `#` delimiter
    - Return `"?"` for null, undefined, or empty input
    - _Requirements: 1.3_

  - [x] 1.2 Write property test for getInitials
    - **Property 3: Fallback initials derivation**
    - Generate random battletag strings (alphanumeric + `#` + digits), verify output matches first-two-chars-uppercased logic; generate null/undefined/empty inputs and verify `"?"` is returned
    - Test file: `__tests__/property/avatar-menu-properties.test.ts`
    - **Validates: Requirements 1.3**

- [x] 2. Extend auth callbacks to fetch and expose WoW profile avatar URL
  - [x] 2.1 Update JWT callback in `lib/auth/auth.ts`
    - On initial sign-in (when `account` is present), use `account.access_token` to call the Battle.net WoW profile endpoint and retrieve the first character's avatar media URL
    - Store the URL as `token.picture`; if the API call fails, set `token.picture = null` and continue authentication
    - _Requirements: 2.1, 2.2_

  - [x] 2.2 Update session callback in `lib/auth/auth.ts`
    - Map `token.picture` to `session.user.image` so the avatar URL is available client-side
    - _Requirements: 2.3_

  - [x] 2.3 Write property test for session image round-trip
    - **Property 4: Session image round-trip**
    - Generate random avatar URL strings, construct mock WoW API responses, run through the JWT callback logic, verify the session output contains the same URL
    - Test file: `__tests__/property/avatar-menu-properties.test.ts`
    - **Validates: Requirements 2.1, 2.3**

- [x] 3. Checkpoint - Verify auth layer changes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create AvatarMenu component
  - [x] 4.1 Create `components/layout/avatar-menu.tsx`
    - Client component using `useSession()` to read session data
    - Use `@radix-ui/react-dropdown-menu` for `DropdownMenu.Root`, `Trigger`, `Portal`, `Content`, `Item`
    - Use `@radix-ui/react-avatar` for `Avatar.Root`, `Avatar.Image`, `Avatar.Fallback`
    - Define `MENU_ITEMS` array: Guilds (`/guilds`), Characters (`/characters`), Interface (`/interface`)
    - Render menu items as `next/link` elements inside `DropdownMenu.Item`
    - Fallback avatar shows `getInitials(session.user.name)` or a generic `User` icon from `lucide-react`
    - Trigger button must have `aria-label="User menu"`
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4_

  - [x] 4.2 Write property test for auth-state UI rendering
    - **Property 1: Auth-state determines rendered UI**
    - Generate random session states (authenticated with random user data, unauthenticated, loading); verify mutual exclusivity of rendered elements (avatar button, sign-in link, skeleton)
    - Test file: `__tests__/property/avatar-menu-properties.test.ts`
    - **Validates: Requirements 1.1, 4.1, 4.2**

  - [x] 4.3 Write property test for avatar image source
    - **Property 2: Avatar image source matches session**
    - Generate random valid URL strings as `user.image`; render AvatarMenu and verify the img src contains the generated URL
    - Test file: `__tests__/property/avatar-menu-properties.test.ts`
    - **Validates: Requirements 1.2**

  - [x] 4.4 Write property test for menu item hrefs
    - **Property 5: Menu item href correctness**
    - Generate random `MenuItemConfig` arrays, render the dropdown, verify each rendered link's href matches its config entry
    - Test file: `__tests__/property/avatar-menu-properties.test.ts`
    - **Validates: Requirements 3.3**

  - [x] 4.5 Write unit tests for AvatarMenu
    - Test menu opens on click and displays three items in order (Guilds, Characters, Interface)
    - Test menu closes on Escape key press
    - Verify ARIA roles: trigger has `aria-label="User menu"`, menu has `role="menu"`, items have `role="menuitem"`
    - Verify trigger is focusable via Tab
    - Test file: `__tests__/unit/avatar-menu.test.tsx`
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4_

- [x] 5. Integrate AvatarMenu into AppBar
  - [x] 5.1 Update `components/layout/app-bar.tsx`
    - Replace the `status === "authenticated"` block with `<AvatarMenu />`
    - Replace the `status === "loading"` block with a circular skeleton placeholder matching the avatar button size
    - Keep the `status === "unauthenticated"` sign-in link unchanged
    - _Requirements: 1.1, 1.4, 4.1, 4.2_

  - [x] 5.2 Write unit tests for AppBar auth states
    - Render AppBar with `status="loading"`, verify skeleton is present and avatar/sign-in are absent
    - Render AppBar with `status="unauthenticated"`, verify sign-in link is present and avatar is absent
    - Render AppBar with `status="authenticated"`, verify AvatarMenu is rendered
    - Test file: `__tests__/unit/avatar-menu.test.tsx`
    - _Requirements: 1.1, 1.4, 4.1, 4.2_

- [x] 6. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All Radix UI packages (`@radix-ui/react-avatar`, `@radix-ui/react-dropdown-menu`) are already in `package.json`
