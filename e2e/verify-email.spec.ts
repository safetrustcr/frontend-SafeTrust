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
  type MockUser,
} from "./support/mock-auth";

/**
 * /verify-email driven through the real page, Firebase SDK and middleware.
 * Firebase's REST API is answered by `mockFirebaseAuth`, so the address the
 * page shows, the resend call and the status refresh are all real.
 */

async function submitLogin(
  page: import("@playwright/test").Page,
  email: string,
  password: string,
) {
  await waitForHydration(page.locator("form"));
  await expect(page.locator("form")).toHaveAttribute("data-hydrated", "true");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
}

test.describe("Verify email page (mocked Firebase Auth)", () => {
  test("signed-out visitor gets a sign-in prompt", async ({ page }) => {
    const auth = await mockFirebaseAuth(page);

    await page.goto("/verify-email");
    await expectHealthyPage(page);

    await expect(
      page.getByRole("heading", { name: "Verify your email" }),
    ).toBeVisible();
    const signIn = page.getByRole("link", { name: "Sign in" });
    await expect(signIn).toBeVisible();
    await expect(signIn).toHaveAttribute("href", /^\/login\?redirect=/);
    expect(auth.unmockedApiCalls).toEqual([]);
  });

  test("verified user sees the verified state and can continue", async ({
    page,
  }) => {
    const auth = await mockFirebaseAuth(page);

    await page.goto("/login");
    await submitLogin(page, MOCK_USERS.guest.email, MOCK_USERS.guest.password);
    // Only navigate on once login has really completed: it is what persists
    // the Firebase user that /verify-email restores on load.
    await expectPathname(page, "/dashboard/escrow-dashboard");

    await page.goto("/verify-email");
    await expect(
      page.getByRole("heading", { name: "Email verified" }),
    ).toBeVisible();
    await expectHealthyPage(page);

    await page.getByRole("link", { name: "Continue" }).click();
    await expect(page).toHaveURL(/\/dashboard\/escrow-dashboard$/);
    expect(auth.unmockedApiCalls).toEqual([]);
  });

  test("unverified user sees their address, can resend and re-check", async ({
    page,
  }) => {
    const nuevo: MockUser = {
      uid: "e2e-new-1",
      email: "nuevo.safetrust@safetrust.test",
      password: "New-Password-123!",
      displayName: "Nuevo Safetrust",
      roles: ["guest"],
      emailVerified: false,
    };
    const auth = await mockFirebaseAuth(page, [nuevo]);

    await page.goto("/login");
    await submitLogin(page, nuevo.email, nuevo.password);
    await expectPathname(page, "/dashboard/escrow-dashboard");

    await page.goto("/verify-email");
    await expect(page.getByText(nuevo.email, { exact: true })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Verify your email" }),
    ).toBeVisible();
    await expectHealthyPage(page);

    // No code inputs anywhere on the page.
    await expect(page.locator("input")).toHaveCount(0);

    // Resend sends a new link, then cools down with a visible countdown.
    await page.getByRole("button", { name: "Resend email" }).click();
    await expect(
      page.getByRole("button", { name: /Resend in \d+ s/ }),
    ).toBeDisabled();
    await expect(page.getByRole("status")).toHaveText(
      "We sent a new link. It can take a minute to arrive.",
    );
    expect(auth.calls).toContain("sendOobCode");

    // The link has not been used, so re-checking explains what to do.
    await page.getByRole("button", { name: "I've verified my email" }).click();
    await expect(page.getByRole("status")).toHaveText(
      "We couldn't confirm it yet. Open the link in the email, then try again.",
    );
    expect(auth.unmockedApiCalls).toEqual([]);
  });
});
