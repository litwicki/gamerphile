/**
 * Property-based tests for theme-styling feature.
 *
 * Property 1: UltrawideProvider width mapping
 * Property 2: Nav link route correctness
 * Property 3: Footer links have accessible names
 * Property 4: External links have security attributes
 *
 * **Validates: Requirements 1.1, 1.2, 1.4, 1.5, 2.8, 2.9, 5.4, 5.5**
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import * as fc from "fast-check";
import { render, cleanup } from "@testing-library/react";
import React from "react";

// Mock next/link to render a plain <a>
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => React.createElement("a", { href, ...props }, children),
}));

import { Footer } from "@/components/layout/footer";
import { UltrawideProvider } from "@/components/ultrawide-provider";

// ── Nav items matching the footer's core pages ──

const coreNavItems = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/characters", label: "Characters" },
  { href: "/ui", label: "UI" },
];

afterEach(() => {
  cleanup();
});

// ── Property 1: UltrawideProvider width mapping ──
// Feature: theme-styling, Property 1: UltrawideProvider width mapping
// **Validates: Requirements 1.1, 1.2, 1.4, 1.5**
describe("Property 1: UltrawideProvider width mapping", () => {
  it("--max-viewport equals 1280px when false and 1920px when true", () => {
    fc.assert(
      fc.property(fc.boolean(), (ultrawideState) => {
        // Render the provider — it sets --max-viewport via useEffect based on initial state (false)
        const { unmount } = render(
          <UltrawideProvider>
            <div data-testid="child">content</div>
          </UltrawideProvider>
        );

        // The provider defaults to false. We need to check the CSS property.
        // Since we can't toggle state from outside without the hook, we test
        // the effect directly: the provider sets the property on documentElement.
        // For ultrawideState=true, we simulate by setting localStorage before render.
        unmount();

        // Clean up any previous state
        localStorage.removeItem("gamerphile-ultrawide");

        if (ultrawideState) {
          localStorage.setItem("gamerphile-ultrawide", "true");
        }

        const { unmount: unmount2 } = render(
          <UltrawideProvider>
            <div data-testid="child">content</div>
          </UltrawideProvider>
        );

        const expected = ultrawideState ? "1920px" : "1280px";
        const actual =
          document.documentElement.style.getPropertyValue("--max-viewport");
        expect(actual).toBe(expected);

        unmount2();
        localStorage.removeItem("gamerphile-ultrawide");
      }),
      { numRuns: 100 }
    );
  });
});

// ── Property 2: Nav link route correctness ──
// Feature: theme-styling, Property 2: Nav link route correctness
// **Validates: Requirements 2.8, 2.9**
describe("Property 2: Nav link route correctness", () => {
  it("every nav link href matches the corresponding core page route", () => {
    fc.assert(
      fc.property(
        fc.shuffledSubarray(coreNavItems, { minLength: 1 }),
        (subset) => {
          const { unmount, container } = render(<Footer />);

          const nav = container.querySelector('nav[aria-label="Footer navigation"]');
          expect(nav).not.toBeNull();

          const links = nav!.querySelectorAll("a");
          const renderedMap = new Map<string, string>();
          links.forEach((link) => {
            const text = link.textContent?.trim() ?? "";
            const href = link.getAttribute("href") ?? "";
            renderedMap.set(text, href);
          });

          // For each item in the random subset, verify the href matches
          for (const item of subset) {
            expect(renderedMap.has(item.label)).toBe(true);
            expect(renderedMap.get(item.label)).toBe(item.href);
          }

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Property 3: Footer links have accessible names ──
// Feature: theme-styling, Property 3: Footer links have accessible names
// **Validates: Requirements 5.4**
describe("Property 3: Footer links have accessible names", () => {
  it("every <a> in the footer has either text content or an aria-label", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<Footer />);

        const allLinks = container.querySelectorAll("a");
        expect(allLinks.length).toBeGreaterThan(0);

        allLinks.forEach((link) => {
          const textContent = link.textContent?.trim() ?? "";
          const ariaLabel = link.getAttribute("aria-label") ?? "";
          const hasAccessibleName = textContent.length > 0 || ariaLabel.length > 0;
          expect(hasAccessibleName).toBe(true);
        });

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});

// ── Property 4: External links have security attributes ──
// Feature: theme-styling, Property 4: External links have security attributes
// **Validates: Requirements 5.5**
describe("Property 4: External links have security attributes", () => {
  it('every <a target="_blank"> has rel="noopener noreferrer"', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<Footer />);

        const blankLinks = container.querySelectorAll('a[target="_blank"]');
        expect(blankLinks.length).toBeGreaterThan(0);

        blankLinks.forEach((link) => {
          const rel = link.getAttribute("rel");
          expect(rel).toBe("noopener noreferrer");
        });

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
