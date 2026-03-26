# Implementation Plan: Sign-In Region Links

## Overview

Refactor `app/signin/page.tsx` to replace the two-step sign-in flow (select region → click button) with direct region links. Active regions (US, EU) become clickable buttons that immediately trigger OAuth. Disabled regions (KR, TW, CN) render as non-interactive spans with proper accessibility attributes. The blue "Sign in with Battle.net" button and `useState` are removed.

## Tasks

- [x] 1. Refactor sign-in page component
  - [x] 1.1 Update the regions array to include a `disabled` flag and extract the `getRegionCallbackUrl` helper function in `app/signin/page.tsx`
    - Add `disabled: boolean` to each region entry: `false` for US/EU, `true` for KR/TW/CN
    - Extract `getRegionCallbackUrl(regionId: string): string` as a named function that returns `/?region=${regionId}`
    - Remove the `useState` import and `selected` state variable
    - _Requirements: 1.2_

  - [x] 1.2 Replace region selector and sign-in button with direct region links
    - Remove the blue "Sign in with Battle.net" `<button>` element entirely
    - For active regions (`disabled: false`): render as `<button>` with `onClick={() => signIn("battlenet", { callbackUrl: getRegionCallbackUrl(region.id) })}`, hover/focus styles, and `aria-label="Sign in with {label}"`
    - For disabled regions (`disabled: true`): render as `<span>` with `role="button"`, `aria-disabled="true"`, `aria-label="{label} region is unavailable"`, `opacity-50`, and `cursor-not-allowed` styling
    - Keep the horizontal flex row layout and region order (USA, Europe, Korea, Taiwan, China)
    - Keep the Battle.net logo banner unchanged
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3_

  - [x] 1.3 Write unit tests for the refactored sign-in page
    - Create `__tests__/unit/signin-page.test.tsx`
    - Mock `next-auth/react` `signIn` function
    - Test that the blue "Sign in with Battle.net" button is not rendered (Req 1.1)
    - Test clicking USA calls `signIn("battlenet", { callbackUrl: "/?region=us" })` (Req 2.1)
    - Test clicking Europe calls `signIn("battlenet", { callbackUrl: "/?region=eu" })` (Req 2.2)
    - Test all five regions render in order: USA, Europe, Korea, Taiwan, China (Req 4.1, 4.2)
    - Test the Battle.net logo image is present (Req 4.3)
    - Test disabled regions have `opacity-50` styling (Req 3.3)
    - _Requirements: 1.1, 2.1, 2.2, 3.3, 4.1, 4.2, 4.3_

- [x] 2. Checkpoint - Verify core implementation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Property-based tests for region behavior
  - [x] 3.1 Write property test: Active region click initiates OAuth with correct region
    - Create `__tests__/property/signin-region-links.test.tsx`
    - **Property 1: Active region click initiates OAuth with correct region**
    - Generate random active regions from `{us, eu}` using `fc.constantFrom`, render the page, click the region button, assert `signIn` was called with `"battlenet"` and a `callbackUrl` containing `region={regionId}`
    - Run minimum 100 iterations via `fc.assert(fc.property(...), { numRuns: 100 })`
    - **Validates: Requirements 2.1, 2.2**

  - [x] 3.2 Write property test: Active regions have accessible sign-in labels
    - **Property 2: Active regions have accessible sign-in labels**
    - For each active region, assert the rendered element has an `aria-label` containing the region's display name and "Sign in"
    - Run minimum 100 iterations
    - **Validates: Requirements 2.4**

  - [x] 3.3 Write property test: Disabled regions have aria-disabled attribute
    - **Property 3: Disabled regions have aria-disabled attribute**
    - Generate random disabled regions from `{kr, tw, cn}` using `fc.constantFrom`, render the page, assert the element has `aria-disabled="true"`
    - Run minimum 100 iterations
    - **Validates: Requirements 3.1, 3.4**

  - [x] 3.4 Write property test: Disabled region clicks do not trigger OAuth
    - **Property 4: Disabled region clicks do not trigger OAuth**
    - Generate random disabled regions, render the page, click the element, assert `signIn` was never called
    - Run minimum 100 iterations
    - **Validates: Requirements 3.2**

- [x] 4. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- The entire implementation is scoped to a single file: `app/signin/page.tsx`
