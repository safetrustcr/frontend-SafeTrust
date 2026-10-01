import { test, expect, expectHealthyPage } from "./fixtures";

test.describe("Near-me geolocation journey", () => {
  test("granted geolocation sorts near San José with distance label", async ({
    context,
    page,
  }) => {
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 9.93, longitude: -84.09 });

    await page.goto("/rent");
    await expectHealthyPage(page);

    const useLocationBtn = page.locator('button:has-text("Use my location")');
    await useLocationBtn.click();

    // First card should have a distance label
    const firstCard = page.locator('[role="article"]').first();
    await expect(firstCard).toBeVisible();
    await expect(
      firstCard.locator('[data-testid="distance-label"]'),
    ).toContainText("km");
    await expectHealthyPage(page);
  });

  test("denied geolocation gracefully handles error", async ({ browser }) => {
    const context = await browser.newContext();
    const deniedPage = await context.newPage();
    await deniedPage.goto("/rent");
    await expectHealthyPage(deniedPage);

    const useLocationBtn = deniedPage.locator(
      'button:has-text("Use my location")',
    );
    await useLocationBtn.click();

    await expectHealthyPage(deniedPage);
    await context.close();
  });
});
