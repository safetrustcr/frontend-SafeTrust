import { test, expect, waitForHydration } from "./fixtures";
import { APARTMENT_LISTINGS } from "../src/lib/mockData/apartmentListings";
import { distanceKm } from "../src/lib/geo";
import { buildIdToken, MOCK_USERS } from "./support/mock-auth";

const searchTrigger = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: /^Search stays:/ });

async function openComposer(page: import("@playwright/test").Page) {
  const trigger = searchTrigger(page);
  await waitForHydration(trigger);
  await trigger.click();
}

test("Where draft applies in one navigation and retains rent filters", async ({
  page,
}) => {
  await page.goto("/rent?categories=Family&bedrooms=2&min=50&max=200");
  await openComposer(page);

  const destination = page.getByRole("searchbox", {
    name: "Search destinations",
  });
  await destination.fill("Escalante");
  await expect(page).toHaveURL(
    "/rent?categories=Family&bedrooms=2&min=50&max=200",
  );

  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("q"))
    .toBe("Escalante");
  const applied = new URL(page.url());
  expect(applied.pathname).toBe("/rent");
  expect(applied.searchParams.get("categories")).toBe("Family");
  expect(applied.searchParams.get("bedrooms")).toBe("2");
  expect(applied.searchParams.get("min")).toBe("50");
  expect(applied.searchParams.get("max")).toBe("200");
  await expect(page.getByRole("article")).not.toHaveCount(0);
});

test("Cancel, Escape, and outside click discard the Where draft", async ({
  page,
}) => {
  await page.goto("/rent?q=original");
  const trigger = searchTrigger(page);
  await openComposer(page);
  const destination = page.getByRole("searchbox", {
    name: "Search destinations",
  });
  await destination.fill("unsaved");
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-label", "Search stays: original");

  await openComposer(page);
  await expect(destination).toHaveValue("original");
  await destination.fill("also unsaved");
  await page.keyboard.press("Escape");
  await expect(destination).not.toBeVisible();

  await openComposer(page);
  await destination.fill("outside click");
  await page.mouse.click(5, 5);
  await expect(destination).not.toBeVisible();
  await expect(page).toHaveURL("/rent?q=original");
});

test("Clear all resets only the draft until Search applies it", async ({
  page,
}) => {
  await page.goto("/rent?q=existing&categories=Family&bedrooms=2");
  await openComposer(page);
  await page.getByRole("button", { name: "Clear all" }).click();
  await expect(
    page.getByRole("searchbox", { name: "Search destinations" }),
  ).toHaveValue("");
  await expect(page).toHaveURL("/rent?q=existing&categories=Family&bedrooms=2");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBeNull();
  expect(new URL(page.url()).searchParams.get("categories")).toBe("Family");
  expect(new URL(page.url()).searchParams.get("bedrooms")).toBe("2");
});

test("Back and reload restore the applied search summary", async ({ page }) => {
  await page.goto("/rent?q=first");
  await openComposer(page);
  await page
    .getByRole("searchbox", { name: "Search destinations" })
    .fill("second");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("q"))
    .toBe("second");

  await page.goBack();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("q"))
    .toBe("first");
  await page.reload();
  await expect(searchTrigger(page)).toHaveAttribute(
    "aria-label",
    "Search stays: first",
  );
});

test("searching from the dashboard targets rent without carrying unrelated filters", async ({
  page,
}) => {
  await page.context().addCookies([
    {
      name: "firebase-token",
      value: buildIdToken(MOCK_USERS.guest),
      url: "http://localhost:3100",
    },
  ]);
  await page.goto("/dashboard/escrow-dashboard?categories=Family&bedrooms=2");
  await openComposer(page);
  await expect(
    page.getByRole("option", { name: /Nearby.*Find what's around you/ }),
  ).toHaveCount(0);
  await page
    .getByRole("searchbox", { name: "Search destinations" })
    .fill("Heredia");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect.poll(() => new URL(page.url()).pathname).toBe("/rent");
  const applied = new URL(page.url());
  expect(applied.searchParams.get("q")).toBe("Heredia");
  expect(applied.searchParams.has("categories")).toBe(false);
  expect(applied.searchParams.has("bedrooms")).toBe(false);
});

test("searching from suggestions retains the listing filters", async ({
  page,
}) => {
  await page.goto(
    "/guest/suggestions?categories=Family&bedrooms=2&min=50&max=200",
  );
  await openComposer(page);
  await page
    .getByRole("searchbox", { name: "Search destinations" })
    .fill("Heredia");
  await page.getByRole("button", { name: "Search", exact: true }).click();

  await expect
    .poll(() => new URL(page.url()).searchParams.get("q"))
    .toBe("Heredia");
  const applied = new URL(page.url());
  expect(applied.pathname).toBe("/guest/suggestions");
  expect(applied.searchParams.get("categories")).toBe("Family");
  expect(applied.searchParams.get("bedrooms")).toBe("2");
  expect(applied.searchParams.get("min")).toBe("50");
  expect(applied.searchParams.get("max")).toBe("200");
  await expect(page.getByText("2 units available")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Jardín de Heredia House" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /La Estación Flat/ }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Casa Níspero/ })).toHaveCount(
    0,
  );
});

test("Nearby requests location only after selection and keeps filters while sorting", async ({
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

  await page.goto("/rent?categories=Family&bedrooms=2");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __geoRequestCount?: number }).__geoRequestCount,
      ),
    )
    .toBe(0);

  await openComposer(page);
  await page
    .getByRole("option", { name: /Nearby.*Find what's around you/ })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __geoRequestCount?: number }).__geoRequestCount,
      ),
    )
    .toBe(1);
  expect(new URL(page.url()).searchParams.get("sort")).toBeNull();

  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Clear location" }),
  ).toBeVisible();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("sort"))
    .toBe("nearest");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __geoRequestCount?: number }).__geoRequestCount,
      ),
    )
    .toBe(1);

  const expected = APARTMENT_LISTINGS.filter(
    (listing) => listing.category === "Family" && listing.bedrooms === 2,
  )
    .map((listing) => ({
      name: listing.name,
      distance: distanceKm({ lat: 9.93, lng: -84.09 }, listing.coordinates),
    }))
    .sort((left, right) => left.distance - right.distance)
    .map(({ name }) => name);
  await expect
    .poll(() =>
      page
        .getByRole("article")
        .evaluateAll((articles) =>
          articles.map((article) => article.getAttribute("aria-label")),
        ),
    )
    .toEqual(expected);
  expect(new URL(page.url()).searchParams.get("categories")).toBe("Family");
  expect(new URL(page.url()).searchParams.get("bedrooms")).toBe("2");
});

for (const width of [360, 768, 1280]) {
  for (const theme of ["light", "dark"]) {
    test(`composer panel fits ${width}px in ${theme} mode`, async ({
      page,
    }, testInfo) => {
      await page.addInitScript(
        (theme) => localStorage.setItem("safetrust-theme", theme),
        theme,
      );
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/rent");
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));

      await openComposer(page);
      await expect(
        page.getByTestId(
          width < 768 ? "search-composer-sheet" : "search-composer-dialog",
        ),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Search stays", exact: true }),
      ).toBeVisible();
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(width);
      await page.screenshot({
        path: testInfo.outputPath(`search-composer-${width}-${theme}.png`),
      });
      await page.keyboard.press("Escape");
    });
  }
}
