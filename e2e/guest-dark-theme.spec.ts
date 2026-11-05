import { test, expect } from "./fixtures";

const DARK_BACKGROUND = "rgb(2, 8, 23)";
const ORANGE_500 = "rgb(249, 115, 22)";
// The Suspense fallback lacks text-foreground, so this only matches the page.
const PAGE_SURFACE = "div.min-h-screen.bg-background.text-foreground";

for (const path of ["/rent/1", "/guest/suggestions"]) {
  test(`${path} follows the dark theme`, async ({ page }) => {
    await page.addInitScript(() =>
      localStorage.setItem("safetrust-theme", "dark"),
    );
    await page.goto(path);

    await expect(page.locator(PAGE_SURFACE).first()).toHaveCSS(
      "background-color",
      DARK_BACKGROUND,
    );

    // Guest pages share the app brand: --primary must not resolve to blue.
    // Polled, and queried fresh each time, because React can swap the surface.
    await expect
      .poll(() =>
        page.evaluate((selector) => {
          const surface = document.querySelector(selector);
          if (!surface) return "";
          const probe = document.createElement("span");
          probe.className = "bg-primary";
          surface.append(probe);
          const color = getComputedStyle(probe).backgroundColor;
          probe.remove();
          return color;
        }, PAGE_SURFACE),
      )
      .toBe(ORANGE_500);
  });
}
