/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

export const test = base.extend({
  page: async ({ page }, use) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (m) => {
      if (m.type() === "error") {
        consoleErrors.push(m.text());
      }
    });
    page.on("pageerror", (e) => pageErrors.push(e.message));

    await use(page);

    expect(pageErrors, "uncaught page errors").toEqual([]);

    const unexpectedConsoleErrors = consoleErrors.filter((msg) => {
      if (/favicon|ResizeObserver/.test(msg)) {
        return false;
      }
      const currentUrl = page.url();
      if (
        /(?:does-not-exist|rent\/999)/.test(currentUrl) &&
        /404 \(Not Found\)/.test(msg)
      ) {
        return false;
      }
      return true;
    });

    expect(unexpectedConsoleErrors, "console errors").toEqual([]);
  },
});

export async function expectHealthyPage(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow, "horizontal overflow (px)").toBeLessThanOrEqual(0);
  expect(
    await page.locator("button button, a button, button a, a a").count(),
    "nested interactive elements",
  ).toBe(0);
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
}

export { expect };
