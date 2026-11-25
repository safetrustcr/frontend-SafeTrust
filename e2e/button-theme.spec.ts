import { test, expect, waitForHydration } from "./fixtures";

const themes = [
  {
    theme: "light",
    background: "rgb(255, 255, 255)",
    color: "rgb(15, 23, 42)",
  },
  {
    theme: "dark",
    background: "rgb(249, 115, 22)",
    color: "rgb(2, 6, 23)",
  },
] as const;

for (const { theme, background, color } of themes) {
  test(`primary button follows the ${theme} theme`, async ({ page }) => {
    await page.addInitScript(
      (value) => localStorage.setItem("safetrust-theme", value),
      theme,
    );
    await page.goto("/login");
    await waitForHydration(page.locator("form"));

    const submit = page.getByRole("button", { name: "Login", exact: true });
    await expect(submit).toHaveCSS("background-color", background);
    await expect(submit).toHaveCSS("color", color);
  });
}
