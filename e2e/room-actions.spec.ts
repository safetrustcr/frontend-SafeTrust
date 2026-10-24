import { test, expect, expectPathname, waitForHydration } from "./fixtures";
import { MOCK_USERS, mockFirebaseAuth } from "./support/mock-auth";

const guest = MOCK_USERS.guest;

test.describe("Room page actions", () => {
  test.beforeEach(async ({ page }) => {
    await mockFirebaseAuth(page);
  });

  test("signed out: Contact → login → back on /room", async ({ page }) => {
    await page.goto("/room");
    await page
      .getByRole("button", { name: "Contact host", exact: true })
      .filter({ visible: true })
      .first()
      .click();

    await expect(page).toHaveURL(/\/login\?redirect=%2Froom$/);

    const form = page.locator("form");
    await waitForHydration(form);
    await expect(form).toHaveAttribute("data-hydrated", "true");
    await page.getByLabel("Email").fill(guest.email);
    await page.getByLabel("Password").fill(guest.password);
    await page.getByRole("button", { name: "Login", exact: true }).click();

    await expectPathname(page, "/room");
  });

  test("View on Map opens a labelled dialog and Escape closes it", async ({
    page,
  }) => {
    await page.goto("/room");
    const trigger = page.getByRole("button", { name: "View on Map" }).last();
    await trigger.focus();
    await trigger.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading")).not.toHaveText("");

    await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
