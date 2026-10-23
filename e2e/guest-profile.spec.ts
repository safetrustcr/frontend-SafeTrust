import {
  test,
  expect,
  expectHealthyPage,
  expectPathname,
  waitForHydration,
} from "./fixtures";
import { MOCK_USERS, mockFirebaseAuth } from "./support/mock-auth";

/**
 * Public /guest/profile (issue #655): signed-out visitors get the benefits
 * plus Log in / Create account buttons whose ?redirect= survives both auth
 * forms; signed-in visitors go straight to the real profile; the rest of
 * /guest/* stays behind middleware.
 */

async function submitLogin(
  page: import("@playwright/test").Page,
  email: string,
  password: string,
) {
  await waitForHydration(page.locator("form"));
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
}

test.describe("Public guest profile", () => {
  test("signed out: benefits, auth links and no identity", async ({ page }) => {
    const auth = await mockFirebaseAuth(page);
    await page.goto("/guest/profile");

    // Loads without a login bounce.
    await expectPathname(page, "/guest/profile");
    await expect(
      page.getByRole("heading", { level: 1, name: "Your SafeTrust account" }),
    ).toBeVisible();
    for (const benefit of [
      "Save stays",
      "Message hosts",
      "Protected deposits",
    ]) {
      await expect(page.getByText(benefit)).toBeVisible();
    }

    const login = page.getByRole("link", { name: "Log in", exact: true });
    const createAccount = page.getByRole("link", {
      name: "Create account",
      exact: true,
    });
    await expect(login).toHaveAttribute(
      "href",
      "/login?redirect=%2Fdashboard%2Fprofile",
    );
    await expect(createAccount).toHaveAttribute(
      "href",
      "/register?redirect=%2Fdashboard%2Fprofile",
    );
    await expect(
      page.getByRole("link", { name: "Back to stays" }),
    ).toHaveAttribute("href", "/rent");

    // No name, e-mail or identity of anybody for a signed-out visitor.
    const html = await page.content();
    for (const identity of [
      MOCK_USERS.guest.email,
      MOCK_USERS.host.email,
      MOCK_USERS.guest.displayName ?? "",
      MOCK_USERS.host.displayName ?? "",
    ]) {
      if (identity)
        expect(html, `page leaks ${identity}`).not.toContain(identity);
    }

    // Keyboard: both calls to action are reachable in order.
    await login.focus();
    await expect(login).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(createAccount).toBeFocused();

    await expectHealthyPage(page);
    expect(auth.unmockedApiCalls, "un-mocked /api calls").toEqual([]);
  });

  test("Profile → Create account → back to profile through both forms", async ({
    page,
  }) => {
    const auth = await mockFirebaseAuth(page);

    // Start like a visitor: the account menu's Profile item lands here.
    await page.goto("/rent");
    const trigger = page.getByTestId("header-account-menu");
    await waitForHydration(trigger);
    await trigger.click();
    const menu = page.getByRole("menu");
    await expect(
      menu.getByRole("menuitem", { name: "Profile" }),
    ).toHaveAttribute("href", "/guest/profile");
    await menu.getByRole("menuitem", { name: "Profile" }).click();
    await expectPathname(page, "/guest/profile");
    await expect(
      page.getByRole("heading", { name: "Your SafeTrust account" }),
    ).toBeVisible();

    // Create account carries the return path to the register form.
    await page
      .getByRole("link", { name: "Create account", exact: true })
      .click();
    await expectPathname(page, "/register");
    await expect(page).toHaveURL(/redirect=%2Fdashboard%2Fprofile/);

    // Switching back to login keeps it (this used to drop the param).
    const loginLink = page.getByRole("link", { name: "Log in", exact: true });
    await waitForHydration(loginLink);
    await expect(loginLink).toHaveAttribute(
      "href",
      "/login?redirect=%2Fdashboard%2Fprofile",
    );
    await loginLink.click();
    await expectPathname(page, "/login");
    await expect(page).toHaveURL(/redirect=%2Fdashboard%2Fprofile/);
    await expectHealthyPage(page);

    // Logging in lands on the real profile.
    await submitLogin(page, MOCK_USERS.guest.email, MOCK_USERS.guest.password);
    await expectPathname(page, "/dashboard/profile");
    await expect(
      page.getByRole("heading", { name: "Edit profile" }),
    ).toBeVisible();
    expect(auth.unmockedApiCalls, "un-mocked /api calls").toEqual([]);
  });

  test("signed in: goes straight to the real profile, no signed-out flash", async ({
    page,
  }) => {
    await mockFirebaseAuth(page);
    await page.goto("/login");
    await submitLogin(page, MOCK_USERS.guest.email, MOCK_USERS.guest.password);
    await expectPathname(page, "/dashboard/escrow-dashboard");

    await page.goto("/guest/profile");
    await expectPathname(page, "/dashboard/profile");
    await expect(
      page.getByRole("heading", { name: "Your SafeTrust account" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Create account", exact: true }),
    ).toHaveCount(0);
  });

  test("the rest of /guest/* stays protected", async ({ page }) => {
    await page.goto("/guest/not-a-public-page");

    await expect(page).toHaveURL(
      /\/login\?redirect=%2Fguest%2Fnot-a-public-page/,
    );
  });

  for (const width of [360, 1280]) {
    for (const theme of ["light", "dark"] as const) {
      test(`layout and accessibility at ${width}px in ${theme} mode`, async ({
        page,
      }) => {
        // Registered last, so it wins for this navigation.
        await page.addInitScript(
          (t) => localStorage.setItem("safetrust-theme", t),
          theme,
        );
        await page.setViewportSize({ width, height: 844 });
        await page.goto("/guest/profile");
        await expect(page.locator("html")).toHaveClass(new RegExp(theme));

        await expect(
          page.getByRole("heading", {
            level: 1,
            name: "Your SafeTrust account",
          }),
        ).toBeVisible();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(width);
        await expectHealthyPage(page);
      });
    }
  }
});
