import { expect, test } from "./fixtures";

test.describe("Home footer", () => {
  test("renders the footer landmark and brand link with correct accessible name", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    const nav = footer.getByRole("navigation", { name: "Footer" });
    await expect(nav).toBeVisible();

    const brandLink = nav.getByRole("link", { name: "SafeTrust", exact: true });
    await expect(brandLink).toBeVisible();
    await expect(brandLink).toHaveAttribute("href", "/");

    const homeLink = footer.getByRole("link", { name: "Home", exact: true });
    await expect(homeLink).toHaveAttribute("href", "/");
  });

  test("browse stays link navigates to /rent", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    const browseLink = footer.getByRole("link", {
      name: "Browse stays",
      exact: true,
    });
    await expect(browseLink).toHaveAttribute("href", "/rent");
    await browseLink.click();
    await expect(page).toHaveURL(/\/rent$/);
  });

  test("suggestions link navigates to /guest/suggestions", async ({ page }) => {
    await page.goto("/");
    const suggestionsLink = page
      .locator("footer")
      .getByRole("link", { name: "Suggestions", exact: true });
    await expect(suggestionsLink).toHaveAttribute("href", "/guest/suggestions");
    await suggestionsLink.click();
    await expect(page).toHaveURL(/\/guest\/suggestions$/);
  });

  test("list your property link redirects through login", async ({ page }) => {
    await page.goto("/");
    const listPropertyLink = page
      .locator("footer")
      .getByRole("link", { name: "List your property", exact: true });
    await expect(listPropertyLink).toHaveAttribute(
      "href",
      "/login?redirect=/dashboard/apartments/new",
    );
    await listPropertyLink.click();
    await expect(page).toHaveURL(
      /\/login\?redirect=(?:%2F|\/)dashboard(?:%2F|\/)apartments(?:%2F|\/)new$/,
    );
  });

  test("external GitHub link has proper attributes", async ({ page }) => {
    await page.goto("/");
    const githubLink = page
      .locator("footer")
      .getByRole("link", { name: "GitHub", exact: true });
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/safetrustcr",
    );
    await expect(githubLink).toHaveAttribute("target", "_blank");
    await expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("fits in narrow viewports without horizontal overflow", async ({
    page,
  }) => {
    for (const width of [320, 390, 640, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      const footer = page.locator("footer");
      await expect(footer).toBeVisible();

      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      expect(scrollWidth).toBeLessThanOrEqual(width);
    }
  });
});
