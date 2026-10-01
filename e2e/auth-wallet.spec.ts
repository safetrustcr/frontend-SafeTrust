import { test, expect, expectHealthyPage } from "./fixtures";

test.describe("Wallet auth journey", () => {
  test("successful wallet signature establishes session", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { ethereum?: unknown }).ethereum = {
        isMetaMask: true,
        request: async ({ method }: { method: string }) => {
          if (method === "eth_requestAccounts" || method === "eth_accounts") {
            return ["0x1234567890123456789012345678901234567890"];
          }
          if (method === "eth_chainId") {
            return "0x1";
          }
          if (method === "eth_getBalance") {
            return "0x0";
          }
          if (method === "personal_sign") {
            return "0xmocksignature";
          }
          return null;
        },
      };
    });

    await page.goto("/login?redirect=/dashboard/escrow-dashboard");
    await expectHealthyPage(page);

    const walletBtn = page.locator('button:has-text("Login with wallet")');
    await walletBtn.click();

    // Select MetaMask from modal
    const metaMaskOption = page.locator("text=MetaMask").first();
    await expect(metaMaskOption).toBeVisible();
    await metaMaskOption.click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expectHealthyPage(page);
  });

  test("rejected signature stays on /login", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { ethereum?: unknown }).ethereum = {
        isMetaMask: true,
        request: async ({ method }: { method: string }) => {
          if (method === "eth_requestAccounts") {
            throw new Error("User rejected");
          }
          return null;
        },
      };
    });

    await page.goto("/login");
    await expectHealthyPage(page);

    const walletBtn = page.locator('button:has-text("Login with wallet")');
    await walletBtn.click();

    const metaMaskOption = page.locator("text=MetaMask").first();
    await expect(metaMaskOption).toBeVisible();
    await metaMaskOption.click();

    await expect(page).toHaveURL(/\/login/);
    await expectHealthyPage(page);
  });
});
