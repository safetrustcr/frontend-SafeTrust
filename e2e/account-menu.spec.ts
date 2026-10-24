import { test, expect, expectPathname, waitForHydration } from "./fixtures";
import { MOCK_USERS, mockFirebaseAuth } from "./support/mock-auth";

test.describe("Guest account menu", () => {
  test.beforeEach(async ({ page }) => {
    await mockFirebaseAuth(page);
  });

  test("signed out: Messages goes through login and back to the inbox", async ({
    page,
  }) => {
    await page.goto("/rent");
    await expect(page.getByText("Randall Valenciano")).toHaveCount(0);

    const trigger = page.getByRole("button", { name: "Account menu" });
    await expect(trigger).toBeEnabled();
    await waitForHydration(trigger);

    // Keyboard: Enter opens, Escape closes and focus returns to the trigger.
    await trigger.focus();
    await page.keyboard.press("Enter");
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    for (const name of [
      "Messages",
      "Wishlists",
      "Notifications",
      "Profile",
      "Log in",
      "Sign up",
    ]) {
      await expect(menu.getByRole("menuitem", { name })).toBeVisible();
    }
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await page.getByRole("menuitem", { name: "Messages" }).click();
    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard%2Fmessages$/);

    const form = page.locator("form");
    await waitForHydration(form);
    await expect(form).toHaveAttribute("data-hydrated", "true");
    await page.getByLabel("Email").fill(MOCK_USERS.guest.email);
    await page.getByLabel("Password").fill(MOCK_USERS.guest.password);
    await page.getByRole("button", { name: "Login", exact: true }).click();

    await expectPathname(page, "/dashboard/messages");
  });

  test("signed in: shows initials and Log out, no login items", async ({
    page,
  }) => {
    await page.goto("/login?redirect=/rent");
    const form = page.locator("form");
    await waitForHydration(form);
    await expect(form).toHaveAttribute("data-hydrated", "true");
    await page.getByLabel("Email").fill(MOCK_USERS.guest.email);
    await page.getByLabel("Password").fill(MOCK_USERS.guest.password);
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await expectPathname(page, "/rent");

    const trigger = page.getByRole("button", {
      name: "Account menu for Ana Guest",
    });
    await expect(trigger).toHaveText("AG");
    await trigger.click();

    const menu = page.getByRole("menu");
    await expect(menu.getByRole("menuitem", { name: "Log out" })).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: "Log in" })).toHaveCount(0);
    await expect(
      menu.getByRole("menuitem", { name: "Messages" }),
    ).toHaveAttribute("href", "/dashboard/messages");
  });
});
