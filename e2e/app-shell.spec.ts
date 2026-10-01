import { test, expect, expectHealthyPage } from "./fixtures";

test.describe("App shell and 404 pages", () => {
  test("/does-not-exist renders branded 404 page", async ({ page }) => {
    const response = await page.goto("/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toContainText("404");
    await expect(page.locator("text=Page Not Found")).toBeVisible();
    await expectHealthyPage(page);
  });

  test("/rent/999 renders 404 page", async ({ page }) => {
    const response = await page.goto("/rent/999");
    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toContainText("404");
    await expectHealthyPage(page);
  });
});
