import { test, expect } from "./fixtures";

const DARK_BACKGROUND = "rgb(2, 6, 23)";
const ORANGE_500 = "rgb(249, 115, 22)";

for (const path of ["/rent/1", "/guest/suggestions"]) {
  test(`${path} follows the dark theme`, async ({ page }) => {
    await page.addInitScript(() =>
      localStorage.setItem("safetrust-theme", "dark"),
    );
    await page.goto(path);

    const surface = page.locator("div.min-h-screen.bg-background").first();
    await expect(surface).toHaveCSS("background-color", DARK_BACKGROUND);

    // Guest pages share the app brand: --primary must not resolve to blue.
    const primary = await surface.evaluate((element) => {
      const probe = document.createElement("span");
      probe.className = "bg-primary";
      element.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });
    expect(primary).toBe(ORANGE_500);
  });
}
