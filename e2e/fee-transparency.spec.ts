import { test, expect, waitForHydration } from "./fixtures";
import { MOCK_USERS, mockFirebaseAuth } from "./support/mock-auth";
import * as path from "node:path";

const SCREENSHOT_DIR = path.resolve(
  process.cwd(),
  "docs/screenshots/issue-756",
);

// These URLs force feeOption via query param so the test is independent of the
// FEE_OPTION env variable. All dollar-amount assertions below are pinned to
// NEXT_PUBLIC_TRUSTLESS_NETWORK=mainnet (the playwright.config.ts default).
// The 0.3% Trustless Work protocol fee is therefore included in every
// calculation. If you run with NEXT_PUBLIC_TRUSTLESS_NETWORK=testnet the
// server build omits the protocol fee and the fixed amounts ($10.59, $199.79)
// will not match; either override back to mainnet or switch to the testnet
// equivalents ($9.96, $199.16).
const CHECKOUT_URL_OPTION_A =
  "/rent/1/book?checkIn=2026-06-01&checkOut=2026-06-03&adults=1&feeOption=guest";
const CHECKOUT_URL_OPTION_B =
  "/rent/1/book?checkIn=2026-06-01&checkOut=2026-06-03&adults=1&feeOption=host";

async function loginAndNavigate(
  page: import("@playwright/test").Page,
  targetUrl: string,
) {
  await mockFirebaseAuth(page);
  await page.goto(`/login?redirect=${encodeURIComponent(targetUrl)}`);
  const form = page.locator("form");
  await waitForHydration(form);
  await expect(form).toHaveAttribute("data-hydrated", "true");
  await page.getByLabel("Email").fill(MOCK_USERS.guest.email);
  await page.getByLabel("Password").fill(MOCK_USERS.guest.password);
  await page.getByRole("button", { name: "Login", exact: true }).click();

  // Wait for redirect to checkout URL
  await expect(page).toHaveURL(new RegExp("/rent/1/book"));
}

test.describe("Checkout Fee Transparency (Issue #756)", () => {
  test("Option A (guest pays fee): shows stay, tax, service fee gross-up, and escrow release to host", async ({
    page,
  }, testInfo) => {
    await loginAndNavigate(page, CHECKOUT_URL_OPTION_A);

    // Stay line (2 nights × $86 = $172.00)
    const priceEl = page.getByTestId("breakdown-price").first();
    await expect(priceEl).toBeVisible();
    await expect(priceEl).toHaveText("$172.00");

    // Tax line (10% = $17.20)
    const taxEl = page.getByTestId("breakdown-tax").first();
    await expect(taxEl).toBeVisible();
    await expect(taxEl).toHaveText("$17.20");

    // Service fee line (gross-up amount = $10.59)
    const feeEl = page.getByTestId("breakdown-platform-fee").first();
    await expect(feeEl).toBeVisible();
    await expect(feeEl).toHaveText("$10.59");

    // Locked in escrow total ($199.79)
    const totalEl = page.getByTestId("escrow-total").first();
    await expect(totalEl).toBeVisible();
    await expect(totalEl).toHaveText("$199.79");

    // Released to host after check-out notice
    await expect(
      page
        .getByText(/Released to the host after check-out:\s*\$189\.20/)
        .first(),
    ).toBeVisible();

    // "How fees work" popover trigger is visible and can be opened
    const popoverTrigger = page
      .getByRole("button", { name: "How fees work" })
      .first();
    await expect(popoverTrigger).toBeVisible();
    await popoverTrigger.scrollIntoViewIfNeeded();
    await popoverTrigger.click({ force: true });

    // Verify popover contents
    const popover = page.getByTestId("how-fees-work-popover");
    await expect(popover).toBeVisible();
    await expect(
      popover.getByText("How escrow fees work", { exact: true }),
    ).toBeVisible();
    await expect(popover.getByTestId("popover-host-payout")).toHaveText(
      "$189.20",
    );

    const isDesktop = testInfo.project.name === "desktop";
    if (isDesktop) {
      await page.screenshot({
        path: path.join(
          SCREENSHOT_DIR,
          "how-fees-work-popover-desktop-light.png",
        ),
      });
    }
  });

  test("Option B (host pays fee): guest deposits stay + tax, fee deducted from host payout", async ({
    page,
  }) => {
    await loginAndNavigate(page, CHECKOUT_URL_OPTION_B);

    // Stay line ($172.00)
    const priceEl = page.getByTestId("breakdown-price").first();
    await expect(priceEl).toBeVisible();
    await expect(priceEl).toHaveText("$172.00");

    // Tax line ($17.20)
    const taxEl = page.getByTestId("breakdown-tax").first();
    await expect(taxEl).toBeVisible();
    await expect(taxEl).toHaveText("$17.20");

    // In Option B, service fee line is NOT shown to the guest
    await expect(page.getByTestId("breakdown-platform-fee")).toHaveCount(0);

    // Locked in escrow total = $189.20 (stay + tax)
    const totalEl = page.getByTestId("escrow-total").first();
    await expect(totalEl).toBeVisible();
    await expect(totalEl).toHaveText("$189.20");

    // Host receives $179.17 after fees notice
    await expect(
      page.getByText(/Host receives\s*\$179\.17/).first(),
    ).toBeVisible();
  });

  test("Host offer view displays host payout preview with escrow breakdown", async ({
    page,
  }, testInfo) => {
    await mockFirebaseAuth(page);
    await page.goto(
      `/login?redirect=${encodeURIComponent("/dashboard/apartments/1/offers")}`,
    );
    const form = page.locator("form");
    await waitForHydration(form);
    await expect(form).toHaveAttribute("data-hydrated", "true");
    await page.getByLabel("Email").fill(MOCK_USERS.host.email);
    await page.getByLabel("Password").fill(MOCK_USERS.host.password);
    await page.getByRole("button", { name: "Login", exact: true }).click();

    await expect(page).toHaveURL(/\/dashboard\/apartments\/1\/offers/);

    const preview = page.getByTestId("host-payout-preview").first();
    await expect(preview).toBeVisible();
    await expect(preview.getByText("Host Payout Preview")).toBeVisible();

    const isDesktop = testInfo.project.name === "desktop";
    if (isDesktop) {
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "host-payout-preview-desktop.png"),
      });
    }
  });

  test("360px mobile viewport has no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await loginAndNavigate(page, CHECKOUT_URL_OPTION_A);

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });
});

test.describe("Fee Transparency Visual Evidence Capture", () => {
  const configurations = [
    {
      option: "a",
      name: "Option A (guest pays fee)",
      url: CHECKOUT_URL_OPTION_A,
    },
    {
      option: "b",
      name: "Option B (host pays fee)",
      url: CHECKOUT_URL_OPTION_B,
    },
  ];

  for (const config of configurations) {
    for (const theme of ["light", "dark"] as const) {
      test(`captures ${config.name} in ${theme} mode`, async ({
        page,
      }, testInfo) => {
        const isDesktop = testInfo.project.name === "desktop";
        const viewportName = isDesktop ? "desktop" : "mobile";

        if (!isDesktop) {
          // Explicitly test 360px mobile width
          await page.setViewportSize({ width: 360, height: 740 });
        }

        await page.addInitScript((t) => {
          localStorage.setItem("safetrust-theme", t);
        }, theme);

        await loginAndNavigate(page, config.url);
        await expect(page.getByTestId("escrow-total").first()).toBeVisible();

        // Take page screenshot
        const screenshotPath = path.join(
          SCREENSHOT_DIR,
          `option-${config.option}-${viewportName}-${theme}.png`,
        );
        await page.screenshot({ path: screenshotPath, fullPage: true });

        // Capture popover for Option A
        if (config.option === "a") {
          const popoverTrigger = page
            .getByRole("button", { name: "How fees work" })
            .first();
          await popoverTrigger.scrollIntoViewIfNeeded();
          await popoverTrigger.click({ force: true });
          await page.waitForTimeout(300);
          await page.screenshot({
            path: path.join(
              SCREENSHOT_DIR,
              `how-fees-work-popover-${viewportName}-${theme}.png`,
            ),
          });
        }
      });
    }
  }
});
