import { test, expect, expectHealthyPage, waitForHydration } from "./fixtures";

const strip = (page: import("@playwright/test").Page) =>
  page.getByRole("list", { name: "Destination choices" });

test("destination and category filters update URL, heading, count and results", async ({
  page,
}) => {
  await page.goto("/rent");
  const sanJose = strip(page).getByRole("button", { name: /^San José,/ });
  await waitForHydration(sanJose);
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await sanJose.focus();
  await page.keyboard.press("Enter");
  await expect
    .poll(() => new URL(page.url()).searchParams.get("location"))
    .toBe("San José");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Available for rent in San José",
  );
  await expect(sanJose).toHaveAttribute("aria-pressed", "true");
  const listings = page.getByRole("article");
  await expect(listings).not.toHaveCount(0);
  const count = await listings.count();
  await expect(
    page.getByText(`${count} ${count === 1 ? "unit" : "units"} available`, {
      exact: true,
    }),
  ).toBeVisible();
  for (const listing of await listings.all())
    await expect(listing).toContainText("San José");
  const categories = page.getByRole("group", { name: "Who is this stay for?" });
  await categories.getByRole("button", { name: "Family", exact: true }).click();
  await categories
    .getByRole("button", { name: "Students", exact: true })
    .click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("categories"))
    .toBe("Family,Students");
  await expect(
    categories.getByRole("button", { name: "Family", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await categories.getByRole("button", { name: "All", exact: true }).click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("categories"))
    .toBeNull();
  const all = strip(page).getByRole("button", {
    name: "All of Costa Rica",
    exact: true,
  });
  await all.focus();
  await page.keyboard.press("Space");
  await expect
    .poll(() => new URL(page.url()).searchParams.get("location"))
    .toBeNull();
  await expect(all).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Available for rent in Costa Rica",
  );
  await expectHealthyPage(page);
});

test("rental and suggestions views share search results and preserve selection", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const search =
    "location=Heredia&adults=2&checkIn=2030-01-10&checkOut=2030-01-12";
  await page.goto(`/rent?${search}`);

  await expect(page.getByRole("article")).toHaveCount(2);
  const rentNames = await page.getByRole("article").evaluateAll((articles) =>
    articles
      .map((article) => article.getAttribute("aria-label"))
      .filter((name): name is string => name !== null)
      .sort(),
  );
  expect(rentNames).toEqual(["Jardín de Heredia House", "La Estación Flat"]);

  await page.getByRole("link", { name: "Suggestions view" }).click();
  await expect(page).toHaveURL(new RegExp(`/guest/suggestions\\?${search}`));
  await expect(page.getByText("2 units available")).toBeVisible();

  const suggestionNames = await page
    .getByRole("button", { name: /^Select / })
    .evaluateAll((buttons) =>
      buttons
        .map((button) =>
          button.getAttribute("aria-label")?.replace(/^Select /, ""),
        )
        .filter((name): name is string => name !== undefined)
        .sort(),
    );
  expect(suggestionNames).toEqual(rentNames);

  const searchBeforeFavorite = page.url();
  await page
    .getByRole("button", { name: "Toggle favorite for La Estación Flat" })
    .click();
  expect(page.url()).toBe(searchBeforeFavorite);
  await expect(
    page.getByRole("heading", { name: "Jardín de Heredia House" }),
  ).toBeVisible();

  const secondListing = page.getByRole("button", {
    name: "Select La Estación Flat",
  });
  await secondListing.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(
    new RegExp(`/guest/suggestions\\?${search}&selected=5`),
  );
  await expect(
    page.getByRole("heading", { name: "La Estación Flat" }),
  ).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`/guest/suggestions\\?${search}`));
  await expect(
    page.getByRole("heading", { name: "Jardín de Heredia House" }),
  ).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(
    new RegExp(`/guest/suggestions\\?${search}&selected=5`),
  );

  await page.getByRole("button", { name: "View full details" }).click();
  await expect(page).toHaveURL(new RegExp(`/rent/5\\?${search}`));
  await page.goBack();
  await expect(page).toHaveURL(
    new RegExp(`/guest/suggestions\\?${search}&selected=5`),
  );
  await expect(
    page.getByRole("heading", { name: "La Estación Flat" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Browse rentals" }).click();
  await expect(page).toHaveURL(new RegExp(`/rent\\?${search}`));
  await expect(page.getByRole("article")).toHaveCount(rentNames.length);
  await expectHealthyPage(page);
});

test("clearing an unmatched search also resets rent filters", async ({
  page,
}) => {
  await page.goto("/rent?q=not-a-rental&categories=Family&bedrooms=2");
  await expect(page.getByText("0 units available")).toBeVisible();

  await page.getByRole("button", { name: "Clear search and filters" }).click();

  await expect(page).toHaveURL("/rent");
  await expect(page.getByRole("article").first()).toBeVisible();
});

test("mobile suggestion selection opens a detail link with the search preserved", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(
    "/guest/suggestions?location=Heredia&adults=2&checkIn=2030-01-10&checkOut=2030-01-12",
  );
  await page
    .getByRole("button", { name: "Select Jardín de Heredia House" })
    .click();

  await expect(page).toHaveURL(
    /\/rent\/4\?location=Heredia&adults=2&checkIn=2030-01-10&checkOut=2030-01-12$/,
  );
  await expect(
    page.getByRole("heading", { name: "Jardín de Heredia House" }),
  ).toBeVisible();
});

test("deep-linked destination is visible and scrolling respects reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 360, height: 844 });
  await page.goto("/rent?location=Lim%C3%B3n");
  const selected = strip(page).getByRole("button", { name: /^Limón,/ });
  await expect(selected).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(async () => {
      const a = (await strip(page).boundingBox())!,
        b = (await selected.boundingBox())!;
      return b.x >= a.x && b.x + b.width <= a.x + a.width + 1;
    })
    .toBe(true);
  const image = selected.locator("img");
  await selected.hover();
  expect(
    await image.evaluate((element) => getComputedStyle(element).transform),
  ).toBe("none");
  await page.setViewportSize({ width: 1280, height: 844 });
  const all = strip(page).getByRole("button", {
    name: "All of Costa Rica",
    exact: true,
  });
  await all.click();
  // Let the selection settle first. Playwright scrolls "All" into view before
  // clicking, so scrollLeft is already ~0 here; if the URL update lands after
  // the "scroll right" click, the carousel (correctly) scrolls back to the
  // newly selected tile and the assertion below would see 0.
  await expect(all).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(() => new URL(page.url()).searchParams.get("location"))
    .toBeNull();
  await expect
    .poll(() => strip(page).evaluate((element) => element.scrollLeft))
    .toBeLessThan(5);
  await page.getByRole("button", { name: "Scroll destinations right" }).click();
  await expect
    .poll(() => strip(page).evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
});

for (const width of [360, 768, 1280]) {
  for (const theme of ["light", "dark"]) {
    test(`destination picker fits ${width}px in ${theme} mode`, async ({
      page,
    }, testInfo) => {
      await page.addInitScript(
        (theme) => localStorage.setItem("safetrust-theme", theme),
        theme,
      );
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/rent");
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      const buttons = strip(page).getByRole("button");
      await expect(buttons).toHaveCount(8);
      const images = strip(page).locator("img");
      await expect(images).toHaveCount(7);
      // Lazy images outside the strip's viewport need not load until visited.
      // Scroll only the carousel so the page position remains unchanged.
      for (let index = 0; index < 7; index++) {
        await strip(page).evaluate((list, index) => {
          const image = list.querySelectorAll("img")[index];
          list.scrollBy({
            left:
              image.getBoundingClientRect().left -
              list.getBoundingClientRect().left -
              8,
            behavior: "instant",
          });
        }, index);
        const image = images.nth(index);
        await expect
          .poll(
            () =>
              image.evaluate(
                (element) =>
                  (element as HTMLImageElement).complete &&
                  (element as HTMLImageElement).naturalWidth > 0,
              ),
            {
              message: `Destination image ${index + 1} loads after scrolling into view`,
            },
          )
          .toBe(true);
        await expect(image).not.toHaveAttribute("src", /placeholder/);
      }
      await strip(page).evaluate((list) =>
        list.scrollTo({ left: 0, behavior: "instant" }),
      );
      await expect
        .poll(() => strip(page).evaluate((list) => list.scrollLeft))
        .toBeLessThan(5);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
      const logo = (await page
        .locator('header a[href="/"]')
        .first()
        .boundingBox())!;
      const search = (await page
        .locator("header")
        .getByRole("button", { name: /^Search stays:/ })
        .boundingBox())!;
      if (width >= 768)
        expect(logo.x + logo.width).toBeLessThanOrEqual(search.x);
      await expectHealthyPage(page);
      await page.screenshot({
        path: `/tmp/safetrust-issue-526-${width}-${theme}-${testInfo.project.name}.png`,
      });
    });
  }
}
