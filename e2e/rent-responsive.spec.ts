import { expect, test } from "@playwright/test";

for (const width of [320, 390, 768, 1280]) {
  test(`listing views fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ["/rent", "/guest/suggestions"]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const hostSwitch = page.getByRole("link", {
        name: "Switch to host view",
        exact: true,
      });
      await expect(hostSwitch).toBeVisible();
      const bounds = await hostSwitch.boundingBox();
      expect(bounds).not.toBeNull();
      // Layout transforms can round a CSS pixel by a tiny fraction.
      expect(bounds!.height).toBeGreaterThanOrEqual(44 - 0.01);
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
      if (width === 390 || width === 1280) {
        await expect
          .poll(async () =>
            page
              .locator("main img")
              .first()
              .evaluate((image) => (image as HTMLImageElement).naturalWidth),
          )
          .toBeGreaterThan(0);
        await page.screenshot({
          path: `/tmp/safetrust-${route === "/rent" ? "rent" : "suggestions"}-${width}.png`,
          fullPage: false,
        });
      }
    }
  });
}

test("rental controls remain usable with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/rent");
  await expect(page.getByRole("article").first()).toBeVisible();
  await page.getByRole("button", { name: /^Sort/ }).click();
  await page
    .getByRole("button", { name: "Price: Low to High", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /^Filters/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: /^Show .* places$/ }).click();
  await page
    .getByRole("link", { name: "Suggestions view", exact: true })
    .click();
  await expect(page).toHaveURL(/\/guest\/suggestions$/);
});
