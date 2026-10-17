import { test, expect, waitForHydration } from "./fixtures";

test("Nearby location survives navigation from suggestions to rentals", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 9.9281, longitude: -84.0907 });
  await page.addInitScript(() => {
    const target = window as Window & { __geoRequestCount?: number };
    target.__geoRequestCount = 0;
    const geolocation = navigator.geolocation;
    const request = geolocation.getCurrentPosition.bind(geolocation);
    geolocation.getCurrentPosition = (...args) => {
      target.__geoRequestCount = (target.__geoRequestCount ?? 0) + 1;
      request(...args);
    };
  });

  await page.goto("/guest/suggestions");
  const where = page.getByRole("button", {
    name: "City, province or neighborhood",
  });
  await waitForHydration(where);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __geoRequestCount?: number }).__geoRequestCount,
      ),
    )
    .toBe(0);
  await where.click();
  await page
    .getByRole("option", { name: /Nearby.*Find what's around you/ })
    .click();
  await expect(
    page.getByRole("button", { name: "Clear location" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __geoRequestCount?: number }).__geoRequestCount,
      ),
    )
    .toBe(1);

  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/\/rent\?sort=nearest$/);
  await expect(
    page.getByText(
      "Sorted by relevance: share your location again to sort by distance.",
    ),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Clear location" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __geoRequestCount?: number }).__geoRequestCount,
      ),
    )
    .toBe(1);
  await expect(page.getByRole("article")).not.toHaveCount(0);
});
