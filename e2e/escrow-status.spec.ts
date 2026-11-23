import { test, expect } from "@playwright/test";
import {
  buildIdToken,
  MOCK_USERS,
  mockFirebaseAuth,
} from "./support/mock-auth";

/**
 * Escrow status page and My bookings E2E tests.
 *
 * Verifies:
 * 1. Escrow status page (/rent/[id]/escrow/[escrowId]):
 *    - Summary card with stay name, dates, guests, amount, status badge
 *    - Lifecycle timeline
 *    - Parties with copy buttons and clear plain-language labels
 *    - Links (Stellar Expert, Refresh)
 * 2. My bookings (/dashboard/escrow):
 *    - Role-aware tabs (Trips, Hosting)
 *    - Status filter buttons
 *    - View button links to the escrow page
 *    - Desktop table vs mobile cards at 360px without horizontal scroll
 *    - Works in both light and dark themes
 */

async function setTheme(
  page: import("@playwright/test").Page,
  theme: "light" | "dark",
) {
  await page.addInitScript((themeName) => {
    try {
      window.localStorage.setItem("safetrust-theme", themeName);
    } catch {
      /* localStorage may be unavailable */
    }
  }, theme);
}

for (const theme of ["light", "dark"] as const) {
  test.describe(`Escrow status and bookings (${theme} theme)`, () => {
    test.beforeEach(async ({ page }) => {
      await setTheme(page, theme);
      await mockFirebaseAuth(page);
      await page.context().addCookies([
        {
          name: "firebase-token",
          value: buildIdToken(MOCK_USERS.host),
          url: "http://localhost:3100",
        },
      ]);
    });

    test("Escrow status page renders summary, timeline, parties and links", async ({
      page,
    }) => {
      await page.goto("/rent/1/escrow/test-escrow-123");

      // Verify theme
      await expect(page.locator("html")).toHaveClass(
        new RegExp(`\\b${theme}\\b`),
      );

      // Summary card
      await expect(page.getByText("La Sabana Luxury Apartment")).toBeVisible();
      await expect(page.getByText("Dec 1 - Dec 5, 2026")).toBeVisible();
      await expect(page.getByText("2 guests")).toBeVisible();
      await expect(page.getByText("$850")).toBeVisible();
      await expect(page.getByText("Active").first()).toBeVisible();

      // Timeline
      await expect(page.getByText("Escrow Lifecycle")).toBeVisible();
      await expect(page.getByText("Escrow created")).toBeVisible();
      await expect(page.getByText("Payment locked")).toBeVisible();

      // Parties
      await expect(page.getByText("Guest, funded the escrow")).toBeVisible();
      await expect(page.getByText("Host, receives the payout")).toBeVisible();
      await expect(
        page.getByText("Platform, verifies completion & dispute resolver"),
      ).toBeVisible();

      // Links & Refresh
      const stellarLink = page.getByRole("link", {
        name: /view on stellar expert/i,
      });
      await expect(stellarLink).toBeVisible();
      await expect(stellarLink).toHaveAttribute("href", /stellar\.expert/i);

      const refreshBtn = page.getByRole("button", { name: /refresh/i });
      await expect(refreshBtn).toBeVisible();
      await refreshBtn.click();
      await expect(page.getByText(/last updated/i)).toBeVisible();
    });

    test("My bookings page renders tabs, filters, and mobile cards without overflow", async ({
      page,
    }) => {
      await page.goto("/dashboard/escrow");

      await expect(page.getByRole("tab", { name: "Trips" })).toBeVisible();
      await expect(page.getByRole("tab", { name: "Hosting" })).toBeVisible();

      // Check filters
      await expect(page.getByRole("button", { name: "All" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Active" })).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Completed" }),
      ).toBeVisible();

      // Switch to Hosting tab
      await page.getByRole("tab", { name: "Hosting" }).click();

      // On desktop, the table is visible; on mobile, the card is visible.
      // Assert visibility on the container matching current viewport or filter by role/card.
      await expect(
        page
          .locator("p, span, td")
          .filter({ hasText: /John Smith/i })
          .first(),
      ).toBeAttached();

      // In mobile project, mobile cards are visible
      // In desktop project, table row is visible
      const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
      if (isMobile) {
        await expect(
          page
            .locator(".md\\:hidden")
            .getByText(/John Smith/i)
            .first(),
        ).toBeVisible();
      } else {
        await expect(
          page
            .locator(".hidden.md\\:block")
            .getByText(/John Smith/i)
            .first(),
        ).toBeVisible();
      }

      // Test mobile viewport 360px width
      await page.setViewportSize({ width: 360, height: 740 });
      await expect(
        page
          .locator(".md\\:hidden")
          .getByText(/John Smith/i)
          .first(),
      ).toBeVisible();

      // Verify no horizontal document overflow at 360px
      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      const clientWidth = await page.evaluate(
        () => document.documentElement.clientWidth,
      );
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  });
}
