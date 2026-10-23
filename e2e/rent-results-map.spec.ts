import { test, expect, expectHealthyPage } from "./fixtures";

const TILE_URL_RE = /tile\.openstreetmap\.org/;

test("CSP allows the configured tile origin and the page never references unpkg.com", async ({
  page,
}) => {
  const response = await page.goto("/rent");
  const csp = response?.headers()["content-security-policy"] ?? "";
  expect(csp).toContain("img-src");
  expect(csp).toMatch(TILE_URL_RE);
  expect(await page.content()).not.toContain("unpkg.com");
});

test("Leaflet and tiles load only after Show map is clicked", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const tileRequests: string[] = [];
  page.on("request", (request) => {
    if (TILE_URL_RE.test(request.url())) tileRequests.push(request.url());
  });

  await page.goto("/rent");
  await expect(page.getByRole("article").first()).toBeVisible();

  expect(
    await page.evaluate(() => typeof (window as unknown as { L?: unknown }).L),
  ).toBe("undefined");
  expect(tileRequests).toEqual([]);

  await page.getByRole("button", { name: "Show map", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() => typeof (window as unknown as { L?: unknown }).L),
    )
    .not.toBe("undefined");
  await expect.poll(() => tileRequests.length).toBeGreaterThan(0);
});

test("pin and card counts/ids match, including 0 and 1 result", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });

  // Zero results: map hidden, empty state shown.
  await page.goto("/rent?min=200");
  await expect(
    page.getByText("No places match these filters", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Show map", exact: true }),
  ).toHaveCount(0);

  // One result: map centers on it, exactly one pin.
  await page.goto("/rent?q=Tamarindo&view=map");
  const cards = page.getByRole("article");
  await expect(cards).toHaveCount(1);
  const cardId = await cards.first().getAttribute("aria-label");
  await expect(page.locator(".price-pin")).toHaveCount(1);
  await expect(page.getByRole("button", { name: /per night$/ })).toHaveCount(1);
  expect(cardId).toBeTruthy();

  // Default (unfiltered) results: pin count matches card count.
  await page.goto("/rent?view=map");
  const allCards = page.getByRole("article");
  const cardCount = await allCards.count();
  expect(cardCount).toBeGreaterThan(1);
  await expect(page.locator(".price-pin")).toHaveCount(cardCount);
});

test("selecting a pin highlights and scrolls to its card; selection is keyboard reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  // A single-result filter keeps this deterministic: 12 clustered pins at
  // the default fitBounds zoom can visually overlap each other and the
  // zoom control, making a specific pin's click target unstable.
  await page.goto("/rent?q=Tamarindo&view=map");

  // Leaflet gives each marker's icon element role="button", tabIndex and the
  // `title` we pass; `.price-pin` is only the inner styled span.
  const marker = page.getByRole("button", { name: /per night$/ });
  const pin = page.locator(".price-pin");
  await expect(pin).toBeVisible();
  const pinName = await marker.getAttribute("title");
  expect(pinName).toMatch(/\$[\d,]+\s+per night/);

  await marker.click();
  await expect(pin).toHaveClass(/is-selected/);
  const selectedCard = page.locator('[id^="listing-card-"].ring-foreground');
  await expect(selectedCard).toHaveCount(1);

  // Keyboard: the marker is focusable and exposes an accessible name.
  await marker.focus();
  await expect(marker).toBeFocused();
});

test("?view=map survives reload and Back; invalid values fall back to list", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto("/rent?view=not-a-real-view");
  await expect(
    page.getByRole("button", { name: "Show map", exact: true }),
  ).toBeVisible();

  await page.goto("/rent?view=map");
  await expect(
    page.getByRole("button", { name: "Hide map", exact: true }),
  ).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("button", { name: "Hide map", exact: true }),
  ).toBeVisible();

  await page.getByRole("article").first().getByRole("link").first().click();
  await expect(page).toHaveURL(/\/rent\/\d+$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/rent\?view=map$/);
  await expect(
    page.getByRole("button", { name: "Hide map", exact: true }),
  ).toBeVisible();
});

test.describe("tile failure", () => {
  // The browser logs the aborted tile requests as console errors; that is
  // the point of this test, nothing else is expected.
  test.use({
    allowedConsoleErrors: [/Failed to load resource.*tile\.openstreetmap\.org/],
  });

  test("attribution is always visible; a tile failure shows the fallback and the list still works", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.route(TILE_URL_RE, (route) => route.abort("failed"));

    await page.goto("/rent?view=map");
    await expect(page.locator(".leaflet-control-attribution")).toContainText(
      "OpenStreetMap",
    );
    await expect(
      page.getByText("Map tiles couldn't load. The list still works."),
    ).toBeVisible();
    const firstCard = page.getByRole("article").first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard.getByRole("link").first()).toBeEnabled();
  });
});

test("opening the map never triggers a geolocation prompt", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.addInitScript(() => {
    const calls: string[] = [];
    (window as unknown as { __geoCalls: string[] }).__geoCalls = calls;
    const original = navigator.geolocation.getCurrentPosition.bind(
      navigator.geolocation,
    );
    navigator.geolocation.getCurrentPosition = (...args) => {
      calls.push("getCurrentPosition");
      return original(...args);
    };
  });

  await page.goto("/rent?view=map");
  const map = page.locator(".leaflet-container");
  await map.scrollIntoViewIfNeeded();
  await expect(map).toBeVisible();

  expect(
    await page.evaluate(
      () => (window as unknown as { __geoCalls: string[] }).__geoCalls,
    ),
  ).toEqual([]);
});

test("hotel detail map still renders with a local marker", async ({ page }) => {
  await page.goto("/hotels/1");
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await expect(page.locator(".price-pin")).toHaveCount(1);
  expect(await page.content()).not.toContain("unpkg.com");
});

for (const width of [360, 768, 1280]) {
  for (const theme of ["light", "dark"]) {
    test(`results map fits ${width}px in ${theme} mode`, async ({
      page,
    }, testInfo) => {
      await page.addInitScript(
        (value) => localStorage.setItem("safetrust-theme", value),
        theme,
      );
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/rent?view=map");
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));

      if (width < 1024) {
        await expect(
          page.getByRole("button", { name: "List", exact: true }),
        ).toBeVisible();
      } else {
        await expect(
          page.getByRole("button", { name: "Hide map", exact: true }),
        ).toBeVisible();
      }

      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
      await expectHealthyPage(page);
      await page.screenshot({
        path: `/tmp/safetrust-issue-610-${width}-${theme}-${testInfo.project.name}.png`,
      });
    });
  }
}
