import * as path from "node:path";
import type { Page } from "@playwright/test";
import { test, expect, expectPathname, waitForHydration } from "./fixtures";
import { MOCK_USERS, mockFirebaseAuth } from "./support/mock-auth";

// Issue #762: wallet readiness checklist before signing, and host payout
// guidance. The trustline checks themselves are a separate issue, so demo
// mode forces each checklist state with ?readiness=<preset>.

const SCREENSHOT_DIR = path.resolve(
  process.cwd(),
  "docs/screenshots/issue-762",
);
const GUEST_WALLET = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
const checkoutUrl = (preset: string) =>
  `/rent/1/book?checkIn=2027-06-01&checkOut=2027-06-03&adults=1&readiness=${preset}`;

type Theme = "light" | "dark";

async function useTheme(page: Page, theme: Theme) {
  await page.addInitScript(
    (value) => localStorage.setItem("safetrust-theme", value),
    theme,
  );
}

async function seedGuestWallet(page: Page) {
  await page.addInitScript((address) => {
    if (!localStorage.getItem("safetrust-wallet")) {
      localStorage.setItem(
        "safetrust-wallet",
        JSON.stringify({
          state: { address, walletId: "freighter", name: "Freighter" },
          version: 0,
        }),
      );
    }
  }, GUEST_WALLET);
}

async function login(
  page: Page,
  user: (typeof MOCK_USERS)[keyof typeof MOCK_USERS],
  redirect: string,
) {
  await mockFirebaseAuth(page);
  await page.goto(`/login?redirect=${encodeURIComponent(redirect)}`);
  const form = page.locator("form");
  await waitForHydration(form);
  await expect(form).toHaveAttribute("data-hydrated", "true");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expectPathname(page, redirect.split("?")[0]);
}

async function openReview(page: Page, preset: string) {
  await seedGuestWallet(page);
  await login(page, MOCK_USERS.guest, checkoutUrl(preset));
  await page
    .getByRole("button", { name: /Book Now/ })
    .filter({ visible: true })
    .first()
    .click();
  return page
    .getByRole("button", { name: /Confirm and pay/ })
    .filter({ visible: true })
    .first();
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

const shotName = (name: string, project: string, theme: Theme) =>
  path.join(SCREENSHOT_DIR, `${name}-${project}-${theme}.png`);

test.describe("Checkout readiness checklist (#762)", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`host without a trustline blocks Confirm and pay (${theme})`, async ({
      page,
    }, testInfo) => {
      await useTheme(page, theme);
      const confirm = await openReview(page, "host-not-ready");

      const checklist = page.getByTestId("readiness-checklist").first();
      await expect(checklist).toHaveAttribute("data-readiness", "not-ready");
      await expect(page.getByTestId("readiness-host").first()).toContainText(
        "The host hasn't added a USDC trustline",
      );
      await expect(confirm).toBeDisabled();
      await expect(
        page.getByTestId("confirm-blocked-reason").first(),
      ).toHaveText(
        "Fix the items above to continue. Nothing has been charged.",
      );
      await expectNoHorizontalOverflow(page);

      await checklist.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: shotName("checkout-host-not-ready", testInfo.project.name, theme),
        fullPage: true,
      });
    });

    test(`low guest balance shows the amounts and guidance (${theme})`, async ({
      page,
    }, testInfo) => {
      await useTheme(page, theme);
      const confirm = await openReview(page, "guest-low-balance");

      await expect(page.getByTestId("readiness-guest").first()).toContainText(
        /You need \$[\d,.]+ USDC, you have \$50\.00\./,
      );
      await expect(confirm).toBeDisabled();
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: shotName(
          "checkout-guest-low-balance",
          testInfo.project.name,
          theme,
        ),
        fullPage: true,
      });
    });

    test(`guest without a trustline sees the steps (${theme})`, async ({
      page,
    }, testInfo) => {
      await useTheme(page, theme);
      const confirm = await openReview(page, "guest-no-trustline");

      await expect(
        page.getByText("Add a USDC trustline in your wallet").first(),
      ).toBeVisible();
      await expect(confirm).toBeDisabled();
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: shotName(
          "checkout-guest-no-trustline",
          testInfo.project.name,
          theme,
        ),
        fullPage: true,
      });
    });

    test(`checking shows a skeleton (${theme})`, async ({ page }, testInfo) => {
      await useTheme(page, theme);
      const confirm = await openReview(page, "checking");

      const checklist = page.getByTestId("readiness-checklist").first();
      await expect(checklist).toHaveAttribute("data-readiness", "checking");
      await expect(checklist.getByRole("status")).toHaveAttribute(
        "aria-busy",
        "true",
      );
      await expect(confirm).toBeDisabled();
      await page.screenshot({
        path: shotName("checkout-checking", testInfo.project.name, theme),
        fullPage: true,
      });
    });

    test(`couldn't check offers a retry that unblocks (${theme})`, async ({
      page,
    }, testInfo) => {
      await useTheme(page, theme);
      const confirm = await openReview(page, "error");

      const checklist = page.getByTestId("readiness-checklist").first();
      await expect(checklist).toHaveAttribute("data-readiness", "error");
      await expect(confirm).toBeDisabled();
      await page.screenshot({
        path: shotName("checkout-error", testInfo.project.name, theme),
        fullPage: true,
      });

      await checklist.getByRole("button", { name: /Check again/ }).click();
      await expect(checklist).toHaveAttribute("data-readiness", "ready");
      await expect(confirm).toBeEnabled();
      await page.screenshot({
        path: shotName("checkout-ready", testInfo.project.name, theme),
        fullPage: true,
      });
    });
  }

  test("fits a 360 px screen", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await openReview(page, "guest-no-trustline");
    await expect(page.getByTestId("readiness-checklist").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("Host payout guidance (#762)", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`dashboard, profile and listings warn the host (${theme})`, async ({
      page,
    }, testInfo) => {
      await useTheme(page, theme);
      await login(page, MOCK_USERS.host, "/dashboard/escrow-dashboard");

      const banner = page.getByTestId("host-payout-banner");
      await expect(banner).toHaveAttribute("data-status", "not-ready");
      await expect(
        banner.getByRole("heading", {
          name: "Add a USDC trustline to receive payouts",
        }),
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: shotName("host-dashboard", testInfo.project.name, theme),
        fullPage: true,
      });

      await page.goto("/dashboard/profile");
      await expect(page.getByTestId("host-payout-banner")).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: shotName("host-profile", testInfo.project.name, theme),
        fullPage: true,
      });

      await page.goto("/dashboard/profile/security");
      await expect(page.getByTestId("host-payout-banner")).toBeVisible();

      await page.goto("/dashboard/apartments");
      await expect(
        page
          .getByTestId("not-ready-for-bookings")
          .filter({ visible: true })
          .first(),
      ).toHaveText("Not ready for bookings");
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: shotName("host-listings", testInfo.project.name, theme),
        fullPage: true,
      });
    });
  }

  test("guests see no host guidance", async ({ page }) => {
    await login(page, MOCK_USERS.guest, "/dashboard/profile");
    await expect(page.locator("form").first()).toBeVisible();
    await expect(page.getByTestId("host-payout-banner")).toHaveCount(0);
  });
});
