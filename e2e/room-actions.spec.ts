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
    // The page ignores clicks while the Firebase session is still being
    // restored (useCurrentUser starts in `loading`), so a single click right
    // after load can be dropped. Retry until the app handles it; the URL
    // assertion still proves the guest is sent to login and back.
    await waitForHydration(contact);
    await expect
      .poll(
        async () => {
          if (new URL(page.url()).pathname === "/login") return "login";
          await contact.click({ timeout: 2_000 }).catch(() => {});
          return new URL(page.url()).pathname;
        },
        { timeout: 20_000 },
      )
      .toBe("login");

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
    // The card is server-rendered; a click before hydration is lost.
    await waitForHydration(trigger);
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
    await waitForHydration(reserveButton);
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
    await datePickerTrigger.scrollIntoViewIfNeeded();
    await datePickerTrigger.click();

    const twoNightsOption = page.getByRole("button", {
      name: "2 Nights",
      exact: true,
    });
    await expect(twoNightsOption).toBeVisible();
    await twoNightsOption.click({ force: true });

    const totalEl = drawer.getByTestId("price-calculator-total");
    await expect(totalEl).toBeVisible();
    // 2 nights × $2 = $4.00, plus the default 10% tax ($0.40) and 5% platform
    // fee ($0.20). CI sets neither NEXT_PUBLIC_BOOKING_TAX_RATE nor
    // NEXT_PUBLIC_PLATFORM_FEE_PERCENT.
    await expect(totalEl).toHaveText("$4.60");

    const checkoutButton = drawer.getByRole("button", {
      name: /connect wallet to book|book now/i,
    });
    await expect(checkoutButton).toBeVisible();
  });
});
