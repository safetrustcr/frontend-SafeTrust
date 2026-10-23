import {
  test,
  expect,
  expectHealthyPage,
  expectPathname,
  waitForHydration,
} from "./fixtures";
import {
  MOCK_USERS,
  mockFirebaseAuth,
  type MockAuth,
} from "./support/mock-auth";

/**
 * Guest header account menu (issue #650): one AccountMenu shared by the guest
 * header (HotelHeader on /rent, /rent/[id], /guest/suggestions) and the
 * dashboard header. Covers the signed-out and signed-in item sets, the
 * protected-route login round trip and keyboard operation.
 */

const accountTrigger = (page: import("@playwright/test").Page) =>
  page.getByTestId("header-account-menu");

/** Focus the trigger and open the menu with Enter (keyboard-operable path). */
async function openAccountMenu(page: import("@playwright/test").Page) {
  const button = accountTrigger(page);
  await expect(button).toBeEnabled();
  await waitForHydration(button);
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeVisible();
}

async function submitLogin(
  page: import("@playwright/test").Page,
  email: string,
  password: string,
) {
  // Typing before hydration would be lost when React takes over the form.
  await waitForHydration(page.locator("form"));
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
}

test.describe("Guest header account menu", () => {
  test("signed out: Messages → login → lands on /dashboard/messages", async ({
    page,
  }) => {
    const auth: MockAuth = await mockFirebaseAuth(page);
    await page.goto("/rent");

    // The fake identity and the permanent "unread" badge are gone.
    await expect(
      page.locator("header").getByText("Randall Valenciano"),
    ).toHaveCount(0);
    await expect(page.locator("header .bg-orange-500")).toHaveCount(0);
    await expect(accountTrigger(page)).toHaveAccessibleName("Account menu");

    await openAccountMenu(page);
    const menu = page.getByRole("menu");

    // Signed out: protected items return to their target after login.
    await expect(
      menu.getByRole("menuitem", { name: "Messages" }),
    ).toHaveAttribute("href", "/login?redirect=%2Fdashboard%2Fmessages");
    await expect(
      menu.getByRole("menuitem", { name: "Wishlists" }),
    ).toHaveAttribute("href", "/login?redirect=%2Fdashboard%2Ffavorites");
    await expect(
      menu.getByRole("menuitem", { name: "Notifications" }),
    ).toHaveAttribute("href", "/login?redirect=%2Fdashboard%2Fnotifications");
    await expect(
      menu.getByRole("menuitem", { name: "Profile" }),
    ).toHaveAttribute("href", "/guest/profile");
    await expect(menu.getByRole("menuitem", { name: "Log in" })).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: "Sign up" })).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: "Log out" })).toHaveCount(
      0,
    );

    // Radix's modal menu aria-hides the rest of the page while open (focus
    // stays trapped inside the menu), which axe reports as aria-hidden-focus.
    // Scan the page with the menu closed, then reopen to continue.
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expectHealthyPage(page);

    await openAccountMenu(page);
    await menu.getByRole("menuitem", { name: "Messages" }).click();
    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard%2Fmessages/);
    await expectHealthyPage(page);

    await submitLogin(page, MOCK_USERS.guest.email, MOCK_USERS.guest.password);

    await expectPathname(page, "/dashboard/messages");
    await expect(
      page.getByRole("heading", { name: "Your Conversations" }),
    ).toBeVisible();
    expect(auth.unmockedApiCalls, "un-mocked /api calls").toEqual([]);
    await expectHealthyPage(page);
  });

  test("keyboard: Enter and Space open, arrows move, Escape closes", async ({
    page,
  }) => {
    await page.goto("/rent");
    const button = accountTrigger(page);
    await waitForHydration(button);
    await button.focus();

    // Enter opens and moves focus to the first item.
    await page.keyboard.press("Enter");
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await expect(
      menu.getByRole("menuitem", { name: "Messages" }),
    ).toBeFocused();

    // Arrows move between items.
    await page.keyboard.press("ArrowDown");
    await expect(
      menu.getByRole("menuitem", { name: "Wishlists" }),
    ).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(
      menu.getByRole("menuitem", { name: "Notifications" }),
    ).toBeFocused();

    // Escape closes and returns focus to the trigger.
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expect(button).toBeFocused();

    // Space opens it too.
    await page.keyboard.press("Space");
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(button).toBeFocused();

    // 44 px touch target on the trigger.
    const box = await button.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44 - 0.01);
    await expectHealthyPage(page);
  });

  test("signed in: initials, direct links and Log out only", async ({
    page,
  }) => {
    const auth: MockAuth = await mockFirebaseAuth(page);
    await page.goto("/login");
    await submitLogin(page, MOCK_USERS.guest.email, MOCK_USERS.guest.password);
    await expectPathname(page, "/dashboard/escrow-dashboard");

    await page.goto("/rent");
    await expect(accountTrigger(page)).toHaveAccessibleName(
      "Account menu for Ana Guest",
    );
    await expect(page.getByTestId("header-account-initials")).toHaveText("AG");

    await openAccountMenu(page);
    const menu = page.getByRole("menu");
    await expect(
      menu.getByRole("menuitem", { name: "Messages" }),
    ).toHaveAttribute("href", "/dashboard/messages");
    await expect(
      menu.getByRole("menuitem", { name: "Wishlists" }),
    ).toHaveAttribute("href", "/dashboard/favorites");
    await expect(
      menu.getByRole("menuitem", { name: "Notifications" }),
    ).toHaveAttribute("href", "/dashboard/notifications");
    await expect(
      menu.getByRole("menuitem", { name: "Profile" }),
    ).toHaveAttribute("href", "/dashboard/profile");
    await expect(menu.getByRole("menuitem", { name: "Log out" })).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: "Log in" })).toHaveCount(0);
    await expect(menu.getByRole("menuitem", { name: "Sign up" })).toHaveCount(
      0,
    );
    // Scan with the menu closed: the open modal menu aria-hides the page,
    // which axe flags as aria-hidden-focus (focus is trapped in the menu).
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expectHealthyPage(page);
    expect(auth.unmockedApiCalls, "un-mocked /api calls").toEqual([]);
  });

  for (const width of [360, 1280]) {
    for (const theme of ["light", "dark"] as const) {
      test(`open menu fits ${width}px in ${theme} mode`, async ({ page }) => {
        // Registered last, so it wins for this navigation.
        await page.addInitScript(
          (t) => localStorage.setItem("safetrust-theme", t),
          theme,
        );
        await page.setViewportSize({ width, height: 844 });
        await page.goto("/rent");
        await expect(page.locator("html")).toHaveClass(new RegExp(theme));

        await openAccountMenu(page);
        const menu = page.getByRole("menu");
        const box = (await menu.boundingBox())!;
        expect(box).not.toBeNull();
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width + 0.5);
        // The open menu must not widen the page either.
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(width);
        // Overflow, console/page errors and axe must stay clean; the axe scan
        // runs with the menu closed because Radix's modal menu aria-hides the
        // page while open (focus stays trapped inside the menu).
        await page.keyboard.press("Escape");
        await expect(menu).toHaveCount(0);
        await expectHealthyPage(page);
      });
    }
  }
});
