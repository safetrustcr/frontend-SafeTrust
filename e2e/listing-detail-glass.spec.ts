import { test, expect, expectHealthyPage } from "./fixtures";

for (const theme of ["light", "dark"] as const) {
  test.describe(`/rent/[id] glass surfaces — ${theme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(
        (themeName) => localStorage.setItem("safetrust-theme", themeName),
        theme,
      );
    });

    test("renders soft backdrop, CSS-only glass cards, and passes a11y at 1280px", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto("/rent/1");
      await expect(page.locator("html")).toHaveClass(
        new RegExp(`\\b${theme}\\b`),
      );

      // Soft page backdrop is present on the route wrapper.
      const shell = page.locator(".dashboard-shell").first();
      await expect(shell).toBeVisible();
      const bgImage = await shell.evaluate(
        (el) => getComputedStyle(el).backgroundImage,
      );
      expect(bgImage).not.toBe("none");

      // CSS-only glass cards: booking price card, desktop summary card, and suggestion cards.
      const glassCards = page.locator(".dashboard-glass-card");
      await expect(glassCards.first()).toBeVisible();
      expect(await glassCards.count()).toBeGreaterThanOrEqual(7);

      const backdrop = await glassCards
        .first()
        .evaluate((el) => getComputedStyle(el).backdropFilter);
      expect(backdrop).toContain("blur");

      // No WebGL GlassSurface / react-glass-ui on this route.
      await expect(page.locator(".dashboard-glass-effect")).toHaveCount(0);
      await expect(page.locator("canvas")).toHaveCount(0);

      // Photo and map remain free of glass overlays.
      const heroImage = page.getByAltText(/main photo/i);
      await expect(heroImage).toBeVisible();
      const insideGlass = await heroImage.evaluate((img) =>
        Boolean(img.closest(".dashboard-glass-card")),
      );
      expect(insideGlass).toBe(false);

      await expectHealthyPage(page);
    });

    test("fits 360px mobile viewport without horizontal overflow and passes a11y", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto("/rent/1");
      await expect(page.locator("html")).toHaveClass(
        new RegExp(`\\b${theme}\\b`),
      );

      await expect(page.locator(".dashboard-shell").first()).toBeVisible();
      await expect(page.locator(".dashboard-glass-card").first()).toBeVisible();

      await expectHealthyPage(page);
    });

    test("falls back to solid --card surface with prefers-reduced-transparency: reduce", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      const cdp = await page.context().newCDPSession(page);
      await cdp.send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
      });
      await page.goto("/rent/1");
      await expect(page.locator("html")).toHaveClass(
        new RegExp(`\\b${theme}\\b`),
      );

      const matchesReducedTransparency = await page.evaluate(
        () =>
          window.matchMedia("(prefers-reduced-transparency: reduce)").matches,
      );
      expect(matchesReducedTransparency).toBe(true);

      const glassCard = page.locator(".dashboard-glass-card").first();
      await expect(glassCard).toBeVisible();

      const styles = await glassCard.evaluate((el) => {
        const cs = getComputedStyle(el);
        const probe = document.createElement("div");
        probe.style.backgroundColor = "hsl(var(--card))";
        document.body.appendChild(probe);
        const cardBg = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return {
          backgroundColor: cs.backgroundColor,
          backdropFilter: cs.backdropFilter,
          cardBg,
        };
      });

      expect(styles.backdropFilter).toBe("none");
      expect(styles.backgroundColor).toBe(styles.cardBg);
    });
  });
}
