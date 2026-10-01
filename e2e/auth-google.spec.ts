import { test, expect, expectHealthyPage } from "./fixtures";

test.describe("Google auth journey via emulator", () => {
  test("google provider login in emulator lands on redirect target", async ({
    page,
  }) => {
    await page.goto("/login?redirect=/dashboard/escrow-dashboard");
    await expectHealthyPage(page);

    const googleBtn = page.getByRole("button", { name: /google/i });
    await expect(googleBtn).toBeVisible();

    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      googleBtn.click(),
    ]);

    await popup.waitForLoadState("domcontentloaded");
    await popup.getByRole("button", { name: "Add new account" }).click();
    await popup.locator("#email-input").fill("google-e2e@example.com");
    await popup.locator("#sign-in").click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expectHealthyPage(page);
  });
});
