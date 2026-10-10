import { test, expect, waitForHydration } from "./fixtures";

const walletElements = [
  "stellar-wallets-modal",
  "stellar-wallets-button",
  "stellar-accounts-selector",
];

test("wallet elements load only when the wallet picker is requested", async ({
  page,
}) => {
  await page.goto("/login");
  await waitForHydration(page.locator("form"));
  const registered = () =>
    page.evaluate(
      (names) => names.filter((name) => Boolean(customElements.get(name))),
      walletElements,
    );
  expect(await registered()).toEqual([]);
  await page.getByRole("button", { name: "Other Stellar wallets" }).click();
  await expect.poll(registered).toEqual(walletElements);
  await expect(
    page.getByText("Choose a Stellar wallet", { exact: true }),
  ).toBeVisible();
});
