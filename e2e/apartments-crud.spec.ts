import {
  test,
  expect,
  expectHealthyPage,
  expectPathname,
  waitForHydration,
} from "./fixtures";
import { MOCK_USERS, mockFirebaseAuth } from "./support/mock-auth";

const host = MOCK_USERS.host;
const NAME = "Escazú Test Loft";

/** The table (desktop) and the card list (mobile) both render; one is hidden. */
const row = (page: import("@playwright/test").Page, name: string) =>
  page.getByText(name, { exact: true }).filter({ visible: true });

async function loginAsHost(
  page: import("@playwright/test").Page,
  redirect: string,
) {
  await page.goto(`/login?redirect=${redirect}`);
  const form = page.locator("form");
  await waitForHydration(form);
  await expect(form).toHaveAttribute("data-hydrated", "true");
  await page.getByLabel("Email").fill(host.email);
  await page.getByLabel("Password").fill(host.password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expectPathname(page, redirect);
}

test.describe("Host apartments (demo)", () => {
  test.beforeEach(async ({ page }) => {
    await mockFirebaseAuth(page);
  });

  test("create → appears in the list; delete → disappears", async ({
    page,
  }) => {
    await loginAsHost(page, "/dashboard/apartments");
    await expect(
      page.getByRole("heading", { name: "My apartments" }),
    ).toBeVisible();
    await expect(page.getByText("Demo", { exact: true })).toBeVisible();

    await page
      .getByRole("link", { name: "New apartment", exact: true })
      .click();
    await expectPathname(page, "/dashboard/apartments/new");
    await expect(page.getByText("Demo", { exact: true })).toBeVisible();
    await page.getByLabel("Apartment Name *").fill(NAME);
    await page.getByLabel("Street Address *").fill("Calle 5");
    await page.getByLabel("Latitude").fill("9.93");
    await page.getByLabel("Longitude").fill("-84.06");
    await page.getByLabel("Monthly Price (USD) *").fill("1100");
    await page.getByLabel("Warranty Deposit (USD) *").fill("2200");
    await page.getByLabel("Image URL 1").fill("/img/room1.png");
    await expectHealthyPage(page);
    await page.getByRole("button", { name: "Register" }).click();

    await expectPathname(page, "/dashboard/apartments");
    await expect(
      page.getByText("Saved in demo mode (not stored)"),
    ).toBeVisible();
    await expect(row(page, NAME)).toBeVisible();
    await expect(page.getByText("Showing 5 of 7")).toBeVisible();

    await page
      .getByRole("button", { name: `Apartment actions for ${NAME}` })
      .click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    const dialog = page.getByRole("dialog", { name: "Remove apartment" });
    await expect(dialog).toContainText(
      `Remove ${NAME}? It will no longer be listed. Existing bookings and offers aren't affected.`,
    );
    await expectHealthyPage(page);
    await dialog.getByRole("button", { name: "Remove" }).click();

    await expect(dialog).toHaveCount(0);
    await expect(page.getByText(NAME, { exact: true })).toHaveCount(0);
    await expect(page.getByText("Showing 5 of 6")).toBeVisible();
  });

  test("edit loads the record and saves changes", async ({ page }) => {
    await loginAsHost(page, "/dashboard/apartments/2/edit");

    const name = page.getByLabel("Apartment Name *");
    await expect(name).toHaveValue("Los Yoses Apartment");
    await expect(page.getByLabel("Warranty Deposit (USD) *")).not.toHaveValue(
      "",
    );
    await expectHealthyPage(page);
    await name.fill("Los Yoses Apartment (renovated)");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expectPathname(page, "/dashboard/apartments");
    await expect(row(page, "Los Yoses Apartment (renovated)")).toBeVisible();
  });

  test("an unknown apartment id is a 404", async ({ page }) => {
    await loginAsHost(page, "/dashboard/apartments/does-not-exist/edit");
    await expect(
      page.getByRole("heading", { name: "We couldn't find that page" }),
    ).toBeVisible();
  });
});
