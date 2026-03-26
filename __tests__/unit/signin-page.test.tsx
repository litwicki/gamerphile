import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

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

describe("SignInPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Req 1.1 — Blue "Sign in with Battle.net" button is removed
  it("does not render a blue 'Sign in with Battle.net' button", () => {
    render(<SignInPage />);
    const blueButton = screen.queryByRole("button", {
      name: /^sign in with battle\.net$/i,
    });
    expect(blueButton).not.toBeInTheDocument();
  });

  // Req 2.1 — Clicking USA calls signIn with region=us
  it("calls signIn with region=us when USA is clicked", () => {
    render(<SignInPage />);
    fireEvent.click(screen.getByRole("button", { name: /sign in with usa/i }));
    expect(signIn).toHaveBeenCalledWith("battlenet", {
      callbackUrl: "/?region=us",
    });
  });

  // Req 2.2 — Clicking Europe calls signIn with region=eu
  it("calls signIn with region=eu when Europe is clicked", () => {
    render(<SignInPage />);
    fireEvent.click(
      screen.getByRole("button", { name: /sign in with europe/i })
    );
    expect(signIn).toHaveBeenCalledWith("battlenet", {
      callbackUrl: "/?region=eu",
    });
  });

  // Req 4.1, 4.2 — All five regions render in order
  it("renders all five regions in order: USA, Europe, Korea, Taiwan, China", () => {
    render(<SignInPage />);
    const regionElements = screen
      .getAllByRole("button")
      .map((el) => el.textContent);
    expect(regionElements).toEqual([
      "USA",
      "Europe",
      "Korea",
      "Taiwan",
      "China",
    ]);
  });

  // Req 4.3 — Battle.net logo image is present
  it("renders the Battle.net logo image", () => {
    render(<SignInPage />);
    const logo = screen.getByAltText("Battle.net");
    expect(logo).toBeInTheDocument();
  });

  // Req 3.3 — Disabled regions have opacity-50 styling
  it("applies opacity-50 to disabled regions", () => {
    render(<SignInPage />);
    const disabledLabels = ["Korea", "Taiwan", "China"];
    for (const label of disabledLabels) {
      const el = screen.getByText(label);
      expect(el.className).toContain("opacity-50");
    }
  });
});
