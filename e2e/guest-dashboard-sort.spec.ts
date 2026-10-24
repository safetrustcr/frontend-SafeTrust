import { test, expect, waitForHydration } from "./fixtures";
import { MOCK_USERS, mockFirebaseAuth } from "./support/mock-auth";

test.describe("Guest dashboard sort and filter", () => {
  test.beforeEach(async ({ page }) => {
    await mockFirebaseAuth(page);
    await page.goto("/login?redirect=/dashboard/guest");
    await waitForHydration(page.locator("form"));
    await page.getByLabel("Email").fill(MOCK_USERS.guest.email);
    await page.getByLabel("Password").fill(MOCK_USERS.guest.password);
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/guest/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("sort by price reorders apartments and updates URL", async ({ page }) => {
    // Check initial state
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Available for rent in all of Costa Rica",
    );

    // Open Sort menu
    const sortButton = page.getByRole("button", { name: /^Sort by:/ });
    await expect(sortButton).toBeVisible();
    await sortButton.click();

    // Verify Nearest is NOT shown in guest dashboard
    await expect(page.getByRole("button", { name: "Nearest" })).toHaveCount(0);

    // Click "Price: Low to High"
    await page
      .getByRole("button", { name: "Price: Low to High", exact: true })
      .click();

    // Choice is reflected in URL
    await expect
      .poll(() => new URL(page.url()).searchParams.get("sort"))
      .toBe("price-low");

    // Check that the first card displays the lowest price ($43)
    const firstArticle = page.getByRole("article").first();
    await expect(firstArticle).toBeVisible();
    await expect(firstArticle).toContainText("$43");

    // Survives reload
    await page.reload();
    await expect
      .poll(() => new URL(page.url()).searchParams.get("sort"))
      .toBe("price-low");
    await expect(page.getByRole("article").first()).toContainText("$43");
  });
});
