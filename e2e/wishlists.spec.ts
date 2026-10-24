import {
  test,
  expect,
  expectHealthyPage,
  expectPathname,
  waitForHydration,
} from "./fixtures";
import { MOCK_USERS, mockFirebaseAuth } from "./support/mock-auth";

async function login(page: import("@playwright/test").Page) {
  const form = page.locator("form");
  await waitForHydration(form);
  await expect(form).toHaveAttribute("data-hydrated", "true");
  await page.getByLabel("Email").fill(MOCK_USERS.guest.email);
  await page.getByLabel("Password").fill(MOCK_USERS.guest.password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
}

test.describe("Wishlists", () => {
  test.beforeEach(async ({ page }) => {
    await mockFirebaseAuth(page);
  });

  test("signed out: ♥ asks to log in instead of saving", async ({ page }) => {
    await page.goto("/rent");
    const save = page.getByRole("button", {
      name: /save casa níspero.* to wishlists/i,
    });
    await waitForHydration(save);
    await save.click();
    await expect(page).toHaveURL(/\/login\?redirect=%2Frent$/);
  });

  test("save → wishlist → remove", async ({ page }) => {
    await page.goto("/login?redirect=/guest/suggestions");
    await login(page);
    await expectPathname(page, "/guest/suggestions");

    const save = page.getByRole("button", {
      name: "Save Luz de Los Yoses Studio to Wishlists",
    });
    await save.click();
    await expect(
      page.getByRole("status").getByText("Saved to Wishlists"),
    ).toBeAttached();
    await expect(
      page.getByRole("link", { name: "Wishlists, 1 saved" }),
    ).toBeVisible();

    // The save is shared: /rent shows it as saved too.
    await page.goto("/rent");
    await expect(
      page.getByRole("button", {
        name: "Remove Luz de Los Yoses Studio from Wishlists",
      }),
    ).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("link", { name: "Wishlists, 1 saved" }).click();
    await expectPathname(page, "/dashboard/favorites");
    await expect(page.getByText("1 stay", { exact: true })).toBeVisible();
    await expectHealthyPage(page);

    await page.getByRole("link", { name: /saved stays/i }).click();
    await expectPathname(page, "/dashboard/favorites/saved");
    await expect(
      page.getByRole("link", { name: /view stay: luz de los yoses studio/i }),
    ).toHaveAttribute("href", "/rent/2");
    await expectHealthyPage(page);

    await page
      .getByRole("button", {
        name: "Remove Luz de Los Yoses Studio from Wishlists",
      })
      .click();
    await expect(page.getByText("No saved stays yet.")).toBeVisible();
  });

  test("unknown wishlist id is a 404", async ({ page }) => {
    await page.goto("/login?redirect=/dashboard/favorites/other");
    await login(page);
    await expectPathname(page, "/dashboard/favorites/other");
    await expect(
      page.getByRole("heading", { name: "We couldn't find that page" }),
    ).toBeVisible();
  });
});
