import { test, expect } from "./fixtures";

const param = (page: import("@playwright/test").Page, key: string) =>
  new URL(page.url()).searchParams.get(key);

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
});

test("several provinces filter the results and read naturally", async ({
  page,
}) => {
  await page.goto("/rent");
  const filters = page.getByRole("complementary");
  await filters.getByRole("checkbox", { name: /^Heredia/ }).click();
  await expect.poll(() => param(page, "location")).toBe("Heredia");

  await filters.getByRole("checkbox", { name: /^Cartago/ }).click();
  await expect.poll(() => param(page, "locations")).toBe("Heredia,Cartago");
  expect(param(page, "location")).toBeNull();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Heredia and Cartago",
  );

  await page.reload();
  await expect(
    page.getByRole("complementary").getByRole("checkbox", { name: /^Cartago/ }),
  ).toBeChecked();
});

test("a destination tile reflects and clears a province checklist", async ({
  page,
}) => {
  await page.goto("/rent?locations=Heredia,Cartago");
  const allTile = page.getByRole("button", {
    name: "All destinations",
    exact: true,
  });
  await expect(allTile).toHaveAttribute("aria-pressed", "false");
  await allTile.click();

  await expect.poll(() => param(page, "locations")).toBeNull();
  await expect(allTile).toHaveAttribute("aria-pressed", "true");
});

test("price handles work from the keyboard and narrow the results", async ({
  page,
}) => {
  await page.goto("/rent");
  const cards = page.getByRole("article");
  await expect(cards.first()).toBeVisible();
  const before = await cards.count();

  const max = page.getByRole("slider", { name: "Maximum price" });
  await max.focus();
  for (let press = 0; press < 25; press += 1) {
    await page.keyboard.press("ArrowLeft");
  }

  await expect.poll(() => param(page, "max")).toBe("75");
  await expect.poll(() => cards.count()).toBeLessThan(before);
});

test("an option with no stays can't be chosen until filters allow it", async ({
  page,
}) => {
  await page.goto("/rent?max=45");
  const filters = page.getByRole("complementary");
  await expect(
    filters.getByRole("checkbox", { name: /^Limón/ }),
  ).toBeDisabled();

  await filters.getByRole("button", { name: "Clear all filters" }).click();
  await expect(filters.getByRole("checkbox", { name: /^Limón/ })).toBeEnabled();
});
