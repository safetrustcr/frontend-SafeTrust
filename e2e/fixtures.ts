/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// 1x1 transparent PNG served in place of third-party images.
const BLANK_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

// Wallet logos come from the wallet kit's CDNs; serve a placeholder so
// layouts that show them still render.
const THIRD_PARTY_IMAGES =
  /^https:\/\/(stellar\.creit\.tech|storage\.herewallet\.app)\//;

/** True for requests to the app under test (any localhost port is NOT enough:
 *  the Firebase emulator host 127.0.0.1:9099 counts as third-party). */
const isAppUrl = (url: string, appOrigin: string) => url.startsWith(appOrigin);

export const test = base.extend<{ allowedConsoleErrors: RegExp[] }>({
  // Console errors a test expects, e.g. the browser's "400 (Bad Request)"
  // line when a login is meant to fail. Set with test.use({ ... }).
  allowedConsoleErrors: [[], { option: true }],

  page: async ({ page, allowedConsoleErrors, baseURL }, use) => {
    const appOrigin = new URL(baseURL ?? "http://localhost:3100").origin;

    // Hermetic runs: the browser never reaches the internet. Anything that is
    // not the app itself is blocked unless a more specific route (registered
    // later, e.g. mockFirebaseAuth) answers it first.
    const blocked = new Set<string>();
    await page.route(
      (url) => !isAppUrl(url.href, appOrigin),
      (route) => {
        blocked.add(route.request().url());
        return route.abort("blockedbyclient");
      },
    );
    await page.route(THIRD_PARTY_IMAGES, (route) =>
      route.fulfill({ status: 200, contentType: "image/png", body: BLANK_PNG }),
    );

    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (m) => {
      if (m.type() !== "error") return;
      const source = m.location().url;
      // Noise from third-party requests we blocked on purpose.
      if (source && !isAppUrl(source, appOrigin) && blocked.has(source)) return;
      if (/net::ERR_BLOCKED_BY_CLIENT/.test(m.text())) return;
      // Keep the URL so a failure says which request broke.
      consoleErrors.push(source ? `${m.text()} [${source}]` : m.text());
    });
    page.on("pageerror", (e) => pageErrors.push(e.message));

    await use(page);

    expect(pageErrors, "uncaught page errors").toEqual([]);

    const unexpectedConsoleErrors = consoleErrors.filter((msg) => {
      if (/favicon|ResizeObserver/.test(msg)) {
        return false;
      }
      if (allowedConsoleErrors.some((re) => re.test(msg))) {
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
  // After a client-side navigation the URL updates before the streamed <head>
  // (title, lang) is applied; auditing in between flags a missing title.
  await expect(page).toHaveTitle(/\S/);
  // Compare with the configured viewport, not window.innerWidth: on emulated
  // phones the layout viewport silently widens to fit overflowing content,
  // so innerWidth would grow with it and hide the overflow.
  const viewportWidth = page.viewportSize()?.width ?? 0;
  const overflow =
    (await page.evaluate(() => document.documentElement.scrollWidth)) -
    viewportWidth;
  expect(overflow, "horizontal overflow (px)").toBeLessThanOrEqual(0);
  expect(
    await page.locator("button button, a button, button a, a a").count(),
    "nested interactive elements",
  ).toBe(0);
  // Let entrance animations (e.g. toasts fading in) finish: axe measures
  // contrast with the current opacity and would flag a half-faded element.
  // Infinite ones (spinners, skeleton pulses) are ignored.
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every(
        (a) =>
          a.playState !== "running" ||
          a.effect?.getComputedTiming().iterations === Infinity,
      ),
  );
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
}

/**
 * Waits until React has hydrated `locator`'s element, so clicks and form
 * submits reach React handlers instead of the browser's native behaviour.
 */
export async function waitForHydration(
  locator: import("@playwright/test").Locator,
) {
  await expect
    .poll(() =>
      locator.evaluate((el) =>
        Object.keys(el).some((key) => key.startsWith("__reactProps$")),
      ),
    )
    .toBe(true);
}

export { expect };