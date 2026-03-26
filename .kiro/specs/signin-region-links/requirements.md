# Requirements Document

## Introduction

The sign-in page currently displays region selector buttons and a separate blue "Sign in with Battle.net" button. This feature replaces that two-step flow by converting each region button into a direct OAuth link. USA and Europe regions trigger the Battle.net OAuth flow directly on click. Korea, Taiwan, and China regions display in a disabled state since their OAuth endpoints are not supported.

## Glossary

- **Sign_In_Page**: The page at `app/signin/page.tsx` that allows users to authenticate via Battle.net OAuth
- **Region_Link**: A clickable element on the Sign_In_Page representing a Battle.net region (US or EU) that directly initiates the OAuth flow for that region
- **Disabled_Region**: A non-interactive element on the Sign_In_Page representing an unsupported Battle.net region (KR, TW, CN)
- **OAuth_Flow**: The Battle.net OAuth 2.0 authorization flow initiated via NextAuth's `signIn("battlenet")` call
- **Sign_In_Button**: The existing blue "Sign in with Battle.net" button that is being removed

## Requirements

### Requirement 1: Remove the Sign In Button

**User Story:** As a user, I want the separate "Sign in with Battle.net" button removed, so that the sign-in flow is simplified to a single click on a region.

#### Acceptance Criteria

1. THE Sign_In_Page SHALL NOT render the blue "Sign in with Battle.net" button
2. THE Sign_In_Page SHALL NOT maintain a selected region state for a separate sign-in action

### Requirement 2: Active Region Links for USA and Europe

**User Story:** As a user, I want to click the USA or Europe region directly to start the Battle.net login, so that I can sign in with fewer steps.

#### Acceptance Criteria

1. WHEN a user clicks the USA Region_Link, THE Sign_In_Page SHALL initiate the OAuth_Flow with a callback URL containing `region=us`
2. WHEN a user clicks the Europe Region_Link, THE Sign_In_Page SHALL initiate the OAuth_Flow with a callback URL containing `region=eu`
3. THE Sign_In_Page SHALL render the USA and Europe regions as visually interactive elements with hover and focus states
4. THE Sign_In_Page SHALL provide accessible labels on each Region_Link indicating the region name and that clicking will initiate sign-in

### Requirement 3: Disabled State for Korea, Taiwan, and China

**User Story:** As a user, I want to see Korea, Taiwan, and China regions displayed as disabled, so that I understand those regions are not currently available for sign-in.

#### Acceptance Criteria

1. THE Sign_In_Page SHALL render Korea, Taiwan, and China as Disabled_Region elements
2. WHEN a user clicks a Disabled_Region, THE Sign_In_Page SHALL NOT initiate the OAuth_Flow
3. THE Sign_In_Page SHALL visually distinguish Disabled_Region elements from active Region_Link elements using reduced opacity or muted styling
4. THE Sign_In_Page SHALL apply `aria-disabled="true"` to each Disabled_Region element to communicate the disabled state to assistive technologies

### Requirement 4: Region Layout Consistency

**User Story:** As a user, I want the region options to remain in a horizontal row layout, so that the page structure stays familiar.

#### Acceptance Criteria

1. THE Sign_In_Page SHALL display all five regions (USA, Europe, Korea, Taiwan, China) in a single horizontal row
2. THE Sign_In_Page SHALL preserve the existing order of regions: USA, Europe, Korea, Taiwan, China
3. THE Sign_In_Page SHALL retain the Battle.net logo banner above the region row
