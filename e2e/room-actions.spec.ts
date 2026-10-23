import { test, expect, expectPathname, waitForHydration } from "./fixtures";
import { MOCK_USERS, mockFirebaseAuth } from "./support/mock-auth";

const guest = MOCK_USERS.guest;

test.describe("Room page actions", () => {
  test.beforeEach(async ({ page }) => {
    await mockFirebaseAuth(page);
  });

  test("signed out: Contact → login → back on /room", async ({ page }) => {
    await page.goto("/room");
    const contact = page
      .getByRole("button", { name: "Contact host", exact: true })
      .filter({ visible: true })
      .first();
    await waitForHydration(contact);
    await contact.click();

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

  test("mobile: Reserve opens bottom sheet, picks dates, computes price and reaches checkout", async ({
    page,
    isMobile,
  }) => {
    test.skip(
      !isMobile,
      "Mobile bottom sheet only applies to < 1280px viewports",
    );

    await page.goto("/room");

    const reserveButton = page.getByRole("button", {
      name: "Reserve",
      exact: true,
    });
    await expect(reserveButton).toBeVisible();
    await reserveButton.click();

    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    await expect(
      drawer.getByRole("heading", { name: "Book your stay" }),
    ).toBeVisible();
    await expect(
      drawer.getByRole("heading", { name: "Book This Room" }),
    ).toBeVisible();

    const datePickerTrigger = drawer.getByRole("button", {
      name: /select your dates/i,
    });
    await datePickerTrigger.click();

    const twoNightsOption = page.getByRole("button", {
      name: "2 Nights",
      exact: true,
    });
    await expect(twoNightsOption).toBeVisible();
    await twoNightsOption.click();

    const totalEl = drawer.getByTestId("price-calculator-total");
    await expect(totalEl).toBeVisible();
    await expect(totalEl).toHaveText("$4.46");

    const checkoutButton = drawer.getByRole("button", {
      name: /connect wallet to book|book now/i,
    });
    await expect(checkoutButton).toBeVisible();
  });
});
