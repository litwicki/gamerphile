import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as fc from "fast-check";

// Mock next-auth/react before component import
vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

// Mock next/image to render a plain <img>
vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

import { signIn } from "next-auth/react";
import SignInPage from "@/app/signin/page";

const activeRegions = [
  { id: "us", label: "USA" },
  { id: "eu", label: "Europe" },
] as const;

// Feature: signin-region-links, Property 1: Active region click initiates OAuth with correct region
// **Validates: Requirements 2.1, 2.2**
describe("Property 1: Active region click initiates OAuth with correct region", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clicking any active region calls signIn with battlenet and the correct callback URL", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...activeRegions),
        (region) => {
          vi.clearAllMocks();
          const { unmount } = render(<SignInPage />);

          const button = screen.getByRole("button", {
            name: `Sign in with ${region.label}`,
          });
          fireEvent.click(button);

          expect(signIn).toHaveBeenCalledTimes(1);
          expect(signIn).toHaveBeenCalledWith("battlenet", {
            callbackUrl: expect.stringContaining(`region=${region.id}`),
          });

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: signin-region-links, Property 2: Active regions have accessible sign-in labels
// **Validates: Requirements 2.4**
describe("Property 2: Active regions have accessible sign-in labels", () => {
  it("each active region has an aria-label containing the region name and 'Sign in'", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...activeRegions),
        (region) => {
          const { unmount } = render(<SignInPage />);

          const button = screen.getByRole("button", {
            name: `Sign in with ${region.label}`,
          });

          expect(button).toHaveAttribute("aria-label");
          const ariaLabel = button.getAttribute("aria-label")!;
          expect(ariaLabel).toContain(region.label);
          expect(ariaLabel).toContain("Sign in");

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

const disabledRegions = [
  { id: "kr", label: "Korea" },
  { id: "tw", label: "Taiwan" },
  { id: "cn", label: "China" },
] as const;

// Feature: signin-region-links, Property 3: Disabled regions have aria-disabled attribute
// **Validates: Requirements 3.1, 3.4**
describe("Property 3: Disabled regions have aria-disabled attribute", () => {
  it("each disabled region has aria-disabled='true'", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...disabledRegions),
        (region) => {
          const { unmount } = render(<SignInPage />);

          const element = screen.getByRole("button", {
            name: `${region.label} region is unavailable`,
          });

          expect(element).toHaveAttribute("aria-disabled", "true");

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: signin-region-links, Property 4: Disabled region clicks do not trigger OAuth
// **Validates: Requirements 3.2**
describe("Property 4: Disabled region clicks do not trigger OAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clicking any disabled region does not call signIn", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...disabledRegions),
        (region) => {
          vi.clearAllMocks();
          const { unmount } = render(<SignInPage />);

          const element = screen.getByRole("button", {
            name: `${region.label} region is unavailable`,
          });
          fireEvent.click(element);

          expect(signIn).not.toHaveBeenCalled();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
