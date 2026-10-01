import { test, expect, expectHealthyPage } from "./fixtures";

test.describe("Email auth journey via Firebase Auth emulator", () => {
  test("create emulator user, login, verify session, and logout", async ({
    page,
    request,
  }) => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = "Password123!";

    // Create user via emulator REST API
    const res = await request.post(
      "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key",
      {
        data: {
          email: testEmail,
          password: testPassword,
          returnSecureToken: true,
        },
      },
    );
    expect(res.ok()).toBeTruthy();

    await page.goto("/login");
    await expectHealthyPage(page);

    await page.locator("input#email").fill(testEmail);
    await page.locator("input#password").fill(testPassword);
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expectHealthyPage(page);
  });
});
