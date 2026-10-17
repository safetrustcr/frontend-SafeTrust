import {
  test,
  expect,
  expectHealthyPage,
  expectPathname,
  waitForHydration,
} from "./fixtures";

// The skyline, supporters row, footer nav and the "Dark mode" toggle label
// land with HP-01..HP-06. The tests below that depend on them are
// test.fixme for now — remove .fixme once each ticket lands, which turns
// these into the regression tests pinning down that ticket's contract.

for (const width of [320, 360, 768, 1280]) {
  for (const theme of ["light", "dark"] as const) {
    test(`home fits ${width}px in ${theme} mode without hydration errors`, async ({
      page,
    }) => {
      await page.addInitScript(
        (t) => localStorage.setItem("safetrust-theme", t),
        theme,
      );
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

      await expectHealthyPage(page); // overflow, console/page errors (incl. hydration), axe
    });

    test.fixme(`home section order, supporters and footer land at ${width}px in ${theme} mode (HP-01..HP-06)`, async ({
      page,
    }) => {
      await page.addInitScript(
        (t) => localStorage.setItem("safetrust-theme", t),
        theme,
      );
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");

      // Order: hero -> destinations -> supported by -> escrow steps -> footer
      const headings = await page.getByRole("heading").allTextContents();
      expect(headings.indexOf("Popular destinations")).toBeLessThan(
        headings.indexOf("Supported by"),
      );
      expect(headings.indexOf("Supported by")).toBeLessThan(
        headings.indexOf("How escrow protects you"),
      );

      const supporters = page
        .getByRole("region", { name: "Supported by" })
        .getByRole("link");
      await expect(supporters).toHaveCount(3);
      await expect(
        page.getByRole("navigation", { name: "Footer" }),
      ).toBeVisible();

      await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
      await expectHealthyPage(page);
    });
  }
}

test.fixme("theme toggle switches once per key press and survives reload (HP-01)", async ({
  page,
}) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Dark mode" }).first();
  await waitForHydration(toggle);
  const before = await toggle.getAttribute("aria-pressed");
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).not.toHaveAttribute("aria-pressed", before!);
  await page.keyboard.press("Space");
  await expect(toggle).toHaveAttribute("aria-pressed", before!);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Dark mode" }).first(),
  ).toHaveAttribute("aria-pressed", before!);
});

test("content is visible with reduced motion and with the motion chunk blocked", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  // Matches the dynamic import of ./motion-features in LazyMotionProvider;
  // confirm the exact built chunk name in the network tab once HP-01..HP-06
  // land and tighten this pattern if Next.js hashes it differently.
  await page.route(/motion-features/, (route) => route.abort());
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  for (const name of ["Find a place", "List your property"]) {
    await expect(page.getByRole("link", { name })).toBeVisible();
  }
});

test("decorative skyline never blocks the CTAs", async ({ page }) => {
  await page.goto("/");
  const cta = page.getByRole("link", { name: "Find a place" });
  await waitForHydration(cta);
  await cta.click(); // fails if the image intercepts the pointer
  await expectPathname(page, "/rent");
});

test("popular destinations strip scrolls natively", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  const strip = page.getByRole("list", { name: "Destinations with listings" });
  await strip.evaluate((el) => el.scrollBy({ left: 200 }));
  await expect
    .poll(() => strip.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(0);
});
