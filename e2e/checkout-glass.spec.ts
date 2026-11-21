import { test, expect } from "@playwright/test";
import {
  buildIdToken,
  MOCK_USERS,
  mockFirebaseAuth,
} from "./support/mock-auth";

/**
 * Booking checkout glass surfaces — /rent/[id]/book review step.
 *
 * Verifies the CSS-only glass surfaces render and that the review step
 * (summary + "Confirm and pay") remains visible in both themes.
 */

const BOOK_PATH =
  "/rent/1/book?checkIn=2030-01-10&checkOut=2030-01-12&adults=2";

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

async function openReviewStep(page: import("@playwright/test").Page) {
  await mockFirebaseAuth(page);
  await page.context().addCookies([
    {
      name: "firebase-token",
      value: buildIdToken(MOCK_USERS.guest),
      url: "http://localhost:3100",
    },
  ]);
  await page.addInitScript(() => {
    if (!localStorage.getItem("safetrust-wallet")) {
      localStorage.setItem(
        "safetrust-wallet",
        JSON.stringify({
          state: {
            address: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
            name: "Test Wallet",
            walletId: "test",
          },
          version: 0,
        }),
      );
    }
  });
  await page.goto(BOOK_PATH);

  const bookNow = page.getByRole("button", { name: /book now/i });
  await expect(bookNow).toBeVisible();
  await bookNow.click();

  // Review step is marked by the escrow step attribute and the confirm button.
  await expect(
    page.getByRole("button", { name: /confirm and pay/i }),
  ).toBeVisible();
}

for (const theme of ["light", "dark"] as const) {
  test.describe(`${theme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await setTheme(page, theme);
    });

    test("opens the review step and shows the summary and confirm button", async ({
      page,
    }) => {
      await openReviewStep(page);
      await expect(page.locator("html")).toHaveClass(
        new RegExp(`\\b${theme}\\b`),
      );

      // "Your booking" summary aside is visible.
      const summary = page.getByRole("complementary", {
        name: /booking summary/i,
      });
      if ((await summary.count()) > 0) {
        await expect(summary.first()).toBeVisible();
      } else {
        // Fall back to the visible "Your booking" heading.
        await expect(page.getByText(/your booking/i).first()).toBeVisible();
      }

      // Review panel and price breakdown are readable.
      await expect(page.getByText(/review your payment/i)).toBeVisible();

      // Confirm and pay is visible and enabled.
      const confirm = page.getByRole("button", {
        name: /confirm and pay/i,
      });
      await expect(confirm).toBeVisible();
      await expect(confirm).toBeEnabled();
    });

    test("renders the glass surfaces with the shared class", async ({
      page,
    }) => {
      await openReviewStep(page);
      await expect(page.locator("html")).toHaveClass(
        new RegExp(`\\b${theme}\\b`),
      );

      // Dates/guests card and the booking summary use the CSS-only glass.
      const glassCards = page.locator(".dashboard-glass-card");
      await expect(glassCards.first()).toBeVisible();
      expect(await glassCards.count()).toBeGreaterThanOrEqual(2);

      // The review box is a more opaque inner panel.
      await expect(
        page.locator(".dashboard-glass-panel").first(),
      ).toBeVisible();
    });
  });
}
