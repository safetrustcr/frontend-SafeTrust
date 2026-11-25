import { test, expect, expectHealthyPage, waitForHydration } from "./fixtures";

const cards = (page: import("@playwright/test").Page) =>
  page.getByTestId("hotel-card");

const whereInput = (page: import("@playwright/test").Page) =>
  page.getByLabel("Where to");

test("search from /hotels filters the canonical results page", async ({
  page,
}) => {
  await page.goto("/hotels");
  await expect(whereInput(page)).toHaveValue("");
  await waitForHydration(whereInput(page));

  await whereInput(page).fill("Escalante");
  await page.getByRole("button", { name: "Search" }).click();

  await expect.poll(() => new URL(page.url()).pathname).toBe("/hotels/search");
  await expect
    .poll(() => new URL(page.url()).searchParams.get("where"))
    .toBe("Escalante");
  await expect(page.getByText("1 stay")).toBeVisible();
  await expect(cards(page)).toHaveCount(1);

  const title = cards(page).getByRole("link");
  await expect(title).toHaveText(/Casa Níspero, Barrio Escalante/);
  await expect(title).toHaveAttribute("href", "/hotels/1");

  await expectHealthyPage(page);
});

test("Enter searches on /hotels/search and View all clears the criteria", async ({
  page,
}) => {
  await page.goto("/hotels/search");
  const where = whereInput(page);
  await waitForHydration(where);

  await where.fill("Escalante");
  await where.press("Enter");

  await expect
    .poll(() => new URL(page.url()).searchParams.get("where"))
    .toBe("Escalante");
  await expect(cards(page)).toHaveCount(1);

  await page.getByRole("link", { name: "View all" }).click();

  await expect.poll(() => new URL(page.url()).searchParams.toString()).toBe("");
  await expect.poll(() => cards(page).count()).toBeGreaterThan(1);

  await expectHealthyPage(page);
});

test("invalid or reversed dates in the URL are ignored", async ({ page }) => {
  await page.goto(
    "/hotels/search?where=Escalante&from=2027-11-06&to=2027-11-01",
  );

  await expect(page.getByText("1 stay")).toBeVisible();
  await expect(cards(page)).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Dates", exact: true }),
  ).toContainText("Pick dates");
});

test("the wishlist heart is a named, toggling button", async ({ page }) => {
  await page.goto("/hotels/search");

  const save = page
    .getByRole("button", { name: /^Save .* to wishlist$/ })
    .first();
  await waitForHydration(save);
  await expect(save).toHaveAttribute("aria-pressed", "false");

  await save.click();

  const remove = page
    .getByRole("button", { name: /^Remove .* from wishlist$/ })
    .first();
  await expect(remove).toHaveAttribute("aria-pressed", "true");
});
