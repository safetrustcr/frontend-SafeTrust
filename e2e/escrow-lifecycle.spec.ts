import { test, expect, waitForHydration } from "./fixtures";
import { MOCK_USERS, mockFirebaseAuth } from "./support/mock-auth";

const THEMES = ["light", "dark"] as const;

for (const theme of THEMES) {
  test.describe(`Escrow Lifecycle UI (${theme} theme)`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(
        (value) => localStorage.setItem("safetrust-theme", value),
        theme,
      );

      // Authenticate to access protected dashboard routes
      await mockFirebaseAuth(page);
      await page.goto("/login");
      await waitForHydration(page.locator("form"));
      await page.getByLabel("Email").fill(MOCK_USERS.host.email);
      await page.getByLabel("Password").fill(MOCK_USERS.host.password);
      await page.getByRole("button", { name: "Login", exact: true }).click();
      await expect(page).toHaveURL(/\/dashboard\/escrow-dashboard$/);
    });

    test("renders lifecycle testbench and timeline stepper", async ({
      page,
    }, testInfo) => {
      await page.goto("/dashboard/escrow/demo");
      await waitForHydration(page.locator("body"));

      await expect(
        page.getByText("Escrow Lifecycle Interactive Testbench"),
      ).toBeVisible();

      await expect(page.getByText("Escrow Timeline")).toBeVisible();
      await expect(page.getByText("Stay completed by Host")).toBeVisible();

      // Screenshot default stay_completed state
      const screenshot = await page.screenshot({ fullPage: true });
      await testInfo.attach(
        `escrow-stay-completed-${theme}-${testInfo.project.name}`,
        {
          body: screenshot,
          contentType: "image/png",
        },
      );
    });

    test("verifies Option B Approve and Release confirmation modal", async ({
      page,
    }) => {
      await page.goto("/dashboard/escrow/demo");
      await waitForHydration(page.locator("body"));

      const approveReleaseBtn = page.getByRole("button", {
        name: /approve and release/i,
      });
      await expect(approveReleaseBtn).toBeVisible();
      await approveReleaseBtn.click();

      // Confirmation dialog should be open
      await expect(
        page.getByRole("heading", { name: "Approve and Release Funds?" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Confirm and Release" }),
      ).toBeVisible();
    });

    test("verifies Open Dispute modal fields and validation", async ({
      page,
    }) => {
      await page.goto("/dashboard/escrow/demo");
      await waitForHydration(page.locator("body"));

      const openDisputeBtn = page.getByRole("button", {
        name: /open dispute/i,
      });
      await openDisputeBtn.click();

      await expect(
        page.getByRole("heading", { name: "Open a Dispute" }),
      ).toBeVisible();
      await expect(page.getByLabel(/dispute reason/i)).toBeVisible();
      await expect(page.getByLabel(/description & evidence/i)).toBeVisible();

      // Cancel closes modal
      await page.getByRole("button", { name: "Cancel" }).click();
      await expect(
        page.getByRole("heading", { name: "Open a Dispute" }),
      ).not.toBeVisible();
    });

    test("verifies Resolver view split balance calculations and validation", async ({
      page,
    }, testInfo) => {
      await page.goto("/dashboard/escrow/demo");
      await waitForHydration(page.locator("body"));

      // Switch to Disputed state
      await page.getByLabel(/select lifecycle state/i).selectOption("disputed");

      // Switch to Resolver role
      await page.getByRole("button", { name: "Resolver" }).click();

      await expect(page.getByText("Dispute Resolution Panel")).toBeVisible();
      await expect(
        page.getByRole("button", {
          name: /resolve dispute and execute split/i,
        }),
      ).toBeEnabled();

      // Screenshot disputed resolver state
      const screenshot = await page.screenshot({ fullPage: true });
      await testInfo.attach(
        `escrow-disputed-resolver-${theme}-${testInfo.project.name}`,
        {
          body: screenshot,
          contentType: "image/png",
        },
      );

      // Type unequal split
      const guestInput = page.getByLabel(/guest refund/i);
      await guestInput.fill("1000");

      // Verify submit button is disabled when sum !== balance
      await expect(
        page.getByRole("button", {
          name: /resolve dispute and execute split/i,
        }),
      ).toBeDisabled();

      // Click preset 100% Guest
      await page.getByRole("button", { name: "100% Guest / 0% Host" }).click();
      await expect(
        page.getByRole("button", {
          name: /resolve dispute and execute split/i,
        }),
      ).toBeEnabled();
    });

    test("verifies Option A platform release view", async ({
      page,
    }, testInfo) => {
      await page.goto("/dashboard/escrow/demo");
      await waitForHydration(page.locator("body"));

      // Switch to Option A
      await page
        .getByRole("button", { name: /option a \(platform release\)/i })
        .click();

      // In stay_completed, guest sees "Approve Stay"
      await expect(
        page.getByRole("button", { name: /approve stay/i }),
      ).toBeVisible();

      // Select Approved fixture
      await page
        .getByLabel(/select lifecycle state/i)
        .selectOption("approved_option_a");

      // Guest sees approved release in progress
      await expect(
        page.getByText("Approved, release in progress"),
      ).toBeVisible();

      // Switch to Admin role
      await page.getByRole("button", { name: "Admin" }).click();
      await expect(page.getByText("Platform Release Action")).toBeVisible();
      await expect(
        page.getByText("Platform Releases (Option A)"),
      ).toBeVisible();

      // Screenshot Option A Admin Releases
      const screenshot = await page.screenshot({ fullPage: true });
      await testInfo.attach(
        `escrow-option-a-admin-${theme}-${testInfo.project.name}`,
        {
          body: screenshot,
          contentType: "image/png",
        },
      );
    });
  });
}
