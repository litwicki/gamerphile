import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Mock next-auth/react ───
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({
    data: null,
    status: "unauthenticated",
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// ─── Mock next/navigation ───
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

import { useSession } from "next-auth/react";
import { AvatarMenu, MENU_ITEMS } from "@/components/layout/avatar-menu";
import { ThemeProvider } from "@/components/theme-provider";
import { UltrawideProvider } from "@/components/ultrawide-provider";
import { CursorTrailProvider } from "@/components/cursor-trail-provider";
import { RegionProvider } from "@/components/region-provider";

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <RegionProvider>
        <UltrawideProvider>
          <CursorTrailProvider>{children}</CursorTrailProvider>
        </UltrawideProvider>
      </RegionProvider>
    </ThemeProvider>
  );
}

// ─── Helpers ───

function mockAuthenticated(overrides?: { name?: string; image?: string | null }) {
  vi.mocked(useSession).mockReturnValue({
    data: {
      user: {
        id: "user-1",
        name: overrides?.name ?? "TestUser#1234",
        email: "test@example.com",
        image: overrides?.image ?? undefined,
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
    },
    status: "authenticated",
    update: vi.fn(),
  });
}

/**
 * Radix DropdownMenu v2 relies on pointer capture and ResizeObserver APIs
 * not available in jsdom. Stub them globally.
 */
beforeAll(() => {
  // Pointer capture stubs
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);

  // ResizeObserver stub
  if (typeof globalThis.ResizeObserver === "undefined") {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;
  }

  // DOMRect stub for Radix positioning
  if (typeof globalThis.DOMRect === "undefined") {
    (globalThis as any).DOMRect = class {
      x = 0; y = 0; width = 0; height = 0;
      top = 0; right = 0; bottom = 0; left = 0;
      toJSON() { return {}; }
      static fromRect() { return new (globalThis as any).DOMRect(); }
    };
  }
});

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ─── 4.5 Unit tests for AvatarMenu ───
// Validates: Requirements 3.1, 3.2, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4

describe("AvatarMenu", () => {
  describe("menu opens on click and displays items in order (Req 3.1, 3.2)", () => {
    it("displays Guilds, Characters, Interface in order when trigger is clicked", async () => {
      mockAuthenticated();
      const user = userEvent.setup();
      render(<AllProviders><AvatarMenu /></AllProviders>);

      const trigger = screen.getByLabelText("User menu");
      await user.click(trigger);

      await waitFor(() => {
        const items = screen.getAllByRole("menuitem");
        // 3 nav items + Theme sub-trigger + Region sub-trigger + Ultrawide + Cursor Trail + Sign out = 8
        expect(items).toHaveLength(8);
        expect(items[0]).toHaveTextContent("Guilds");
        expect(items[1]).toHaveTextContent("Characters");
        expect(items[2]).toHaveTextContent("Interface");
        expect(items[3]).toHaveTextContent("Theme");
        expect(items[4]).toHaveTextContent("Region");
        expect(items[5]).toHaveTextContent("Ultrawide");
        expect(items[6]).toHaveTextContent("Cursor Trail");
        expect(items[7]).toHaveTextContent("Sign out");
      });
    });
  });

  describe("menu closes on Escape key press (Req 3.4)", () => {
    it("removes menu content from DOM when Escape is pressed", async () => {
      mockAuthenticated();
      const user = userEvent.setup();
      render(<AllProviders><AvatarMenu /></AllProviders>);

      const trigger = screen.getByLabelText("User menu");
      await user.click(trigger);

      // Menu should be open
      await waitFor(() => {
        expect(screen.getAllByRole("menuitem")).toHaveLength(8);
      });

      // Press Escape
      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("menuitem")).toBeNull();
      });
    });
  });

  describe("ARIA roles (Req 5.1, 5.2)", () => {
    it('trigger has aria-label="User menu"', () => {
      mockAuthenticated();
      render(<AllProviders><AvatarMenu /></AllProviders>);

      const trigger = screen.getByLabelText("User menu");
      expect(trigger).toBeInTheDocument();
      expect(trigger.tagName.toLowerCase()).toBe("button");
    });

    it('menu has role="menu" when open', async () => {
      mockAuthenticated();
      const user = userEvent.setup();
      render(<AllProviders><AvatarMenu /></AllProviders>);

      const trigger = screen.getByLabelText("User menu");
      await user.click(trigger);

      await waitFor(() => {
        const menu = screen.getByRole("menu");
        expect(menu).toBeInTheDocument();
      });
    });

    it('items have role="menuitem"', async () => {
      mockAuthenticated();
      const user = userEvent.setup();
      render(<AllProviders><AvatarMenu /></AllProviders>);

      const trigger = screen.getByLabelText("User menu");
      await user.click(trigger);

      await waitFor(() => {
        const items = screen.getAllByRole("menuitem");
        expect(items).toHaveLength(MENU_ITEMS.length + 5); // +1 Theme sub-trigger, +1 Region sub-trigger, +1 Ultrawide, +1 Cursor Trail, +1 Sign out
        for (const item of items) {
          expect(item).toHaveAttribute("role", "menuitem");
        }
      });
    });
  });

  describe("trigger is focusable via Tab (Req 5.4)", () => {
    it("trigger button can receive focus via Tab", async () => {
      mockAuthenticated();
      const user = userEvent.setup();
      render(<AllProviders><AvatarMenu /></AllProviders>);

      // Tab into the trigger
      await user.tab();

      const trigger = screen.getByLabelText("User menu");
      expect(trigger).toHaveFocus();
    });
  });
});

// ─── 5.2 Unit tests for AppBar auth states ───
// Validates: Requirements 1.1, 1.4, 4.1, 4.2

import { AppBar } from "@/components/layout/app-bar";

describe("AppBar auth states", () => {
  describe("loading state (Req 1.4)", () => {
    it("renders skeleton placeholder and hides avatar/sign-in", () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: "loading",
        update: vi.fn(),
      });

      render(<AllProviders><AppBar /></AllProviders>);

      // Skeleton should be present
      const skeleton = document.querySelector(".animate-pulse");
      expect(skeleton).toBeInTheDocument();

      // Avatar trigger should be absent
      expect(screen.queryByLabelText("User menu")).toBeNull();

      // Sign-in link should be absent
      expect(screen.queryByText("Sign in")).toBeNull();
    });
  });

  describe("unauthenticated state (Req 4.1, 4.2)", () => {
    it("renders sign-in link and hides avatar", () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: vi.fn(),
      });

      render(<AllProviders><AppBar /></AllProviders>);

      // Sign-in link should be present (desktop + mobile)
      const signInLinks = screen.getAllByText("Sign in");
      expect(signInLinks.length).toBeGreaterThan(0);
      expect(signInLinks[0].closest("a")).toHaveAttribute("href", "/signin");

      // Avatar trigger should be absent
      expect(screen.queryByLabelText("User menu")).toBeNull();

      // Skeleton should be absent
      expect(document.querySelector(".animate-pulse")).toBeNull();
    });
  });

  describe("authenticated state (Req 1.1)", () => {
    it("renders AvatarMenu with user menu trigger", () => {
      mockAuthenticated();

      render(<AllProviders><AppBar /></AllProviders>);

      // Avatar trigger should be present (desktop + mobile)
      const triggers = screen.getAllByLabelText("User menu");
      expect(triggers.length).toBeGreaterThan(0);

      // Sign-in link should be absent
      expect(screen.queryByText("Sign in")).toBeNull();

      // Skeleton should be absent
      expect(document.querySelector(".animate-pulse")).toBeNull();
    });
  });
});
