import { test, expect, expectHealthyPage, waitForHydration } from "./fixtures";
import {
  MOCK_USERS,
  mockFirebaseAuth,
  type MockAuth,
} from "./support/mock-auth";

/**
 * Email/password journeys driven through the real login form, Firebase SDK,
 * session cookie and middleware. Firebase's REST API is answered by
 * `mockFirebaseAuth` from seeded users, so no emulator, backend or network
 * is involved, and any un-mocked /api/* call fails the test.
 */

const SESSION_COOKIE = "firebase-token";
const DASHBOARD = /\/dashboard\/escrow-dashboard$/;

async function submitLogin(
  page: import("@playwright/test").Page,
  email: string,
  password: string,
) {
  // Typing before hydration would be lost when React takes over the form.
  await waitForHydration(page.locator("form"));
  await expect(page.locator("form")).toHaveAttribute("data-hydrated", "true");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
}

async function sessionCookie(page: import("@playwright/test").Page) {
  const cookies = await page.context().cookies();
  return cookies.find((c) => c.name === SESSION_COOKIE);
}

test.describe("Email auth journey (mocked Firebase Auth)", () => {
  let auth: MockAuth;

  test.beforeEach(async ({ page }) => {
    auth = await mockFirebaseAuth(page);
  });

  test.afterEach(() => {
    expect(auth.unmockedApiCalls, "un-mocked /api calls").toEqual([]);
  });

  test("guest signs in and lands on the page they asked for", async ({
    page,
  }) => {
    const guest = MOCK_USERS.guest;

    // Protected page while signed out -> login, remembering the target.
    await page.goto("/dashboard/escrow-dashboard");
    await expect(page).toHaveURL(
      /\/login\?redirect=%2Fdashboard%2Fescrow-dashboard/,
    );
    await expectHealthyPage(page);

    await submitLogin(page, guest.email, guest.password);

    await expect(page).toHaveURL(DASHBOARD);
    await expect(page.getByText("Login successful!")).toBeVisible();
    expect(await sessionCookie(page)).toBeTruthy();
    expect(auth.calls).toContain("signInWithPassword");
    await expectHealthyPage(page);

    // The session survives a full reload (cookie verified by middleware).
    await page.reload();
    await expect(page).toHaveURL(DASHBOARD);
  });

  test.describe("rejected credentials", () => {
    // Firebase answers a failed sign-in with HTTP 400, which the browser
    // logs as a console error. That is expected here, nothing else is.
    test.use({ allowedConsoleErrors: [/status of 400 \(Bad Request\)/] });

    test("wrong password shows an error and creates no session", async ({
      page,
    }) => {
      await page.goto("/login");
      await submitLogin(page, MOCK_USERS.guest.email, "not-the-password");

      await expect(
        page.locator("form").getByText("Invalid email or password"),
      ).toBeVisible();
      await expect(page).toHaveURL(/\/login$/);
      expect(await sessionCookie(page)).toBeUndefined();
    });

    test("unknown email gets the same error (no account enumeration)", async ({
      page,
    }) => {
      await page.goto("/login");
      await submitLogin(page, "nobody@safetrust.test", "whatever-123");

      await expect(
        page.locator("form").getByText("Invalid email or password"),
      ).toBeVisible();
      expect(await sessionCookie(page)).toBeUndefined();
    });
  });

  test("a guest is denied host-only pages", async ({ page }) => {
    await page.goto("/login?redirect=/dashboard/hotels");
    await submitLogin(page, MOCK_USERS.guest.email, MOCK_USERS.guest.password);

    await expect(
      page.getByRole("heading", { name: "Access denied" }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard\/hotels/);
  });

  test("a host can open host-only pages", async ({ page }) => {
    await page.goto("/login?redirect=/dashboard/hotels");
    await submitLogin(page, MOCK_USERS.host.email, MOCK_USERS.host.password);

    await expect(page).toHaveURL(/\/dashboard\/hotels/);
    await expect(
      page.getByRole("heading", { name: "Hotels", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Access denied" }),
    ).toHaveCount(0);
  });

  test("logging out clears the session and re-protects the dashboard", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/login?redirect=/dashboard/escrow-dashboard");
    await submitLogin(page, MOCK_USERS.guest.email, MOCK_USERS.guest.password);
    await expect(page).toHaveURL(DASHBOARD);

    // Target specifically the first currently visible "Log out" button
    const logout = page
      .getByRole("button", { name: "Log out" })
      .filter({ visible: true })
      .first();

    if (isMobile) {
      // The sidebar is a drawer on mobile. Retry the toggle until it opens,
      // in case the first tap lands before the dashboard has hydrated.
      const menu = page.getByRole("button", { name: "Toggle navigation menu" });
      await expect(async () => {
        if (!(await logout.isVisible())) {
          await menu.click();
        }
        await expect(logout).toBeVisible({ timeout: 2000 });
      }).toPass();
    }

    await logout.click();

    await expect(page).toHaveURL(/\/login$/);
    expect(await sessionCookie(page)).toBeUndefined();

    await page.goto("/dashboard/escrow-dashboard");
    await expect(page).toHaveURL(/\/login\?redirect=/);
  });
});
