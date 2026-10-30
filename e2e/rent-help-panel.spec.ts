import { expect, type Page, test } from "@playwright/test";

/**
 * /rent "Help & docs" entry point (issue #700).
 *
 * Launchers: a vertical right-edge tab on lg+ and a toolbar button below lg.
 * The panel is a Radix right-side sheet that must not disturb the rent search
 * (URL, filters, sort, scroll) while it is open.
 */

const isDesktop = () => test.info().project.name === "desktop";

// Mirrors src/config/env.ts: production builds default the trustless network
// to mainnet unless NEXT_PUBLIC_TRUSTLESS_NETWORK is provided at build time.
const expectedNetwork = () =>
  (process.env.NEXT_PUBLIC_TRUSTLESS_NETWORK || "mainnet") as
    "testnet" | "mainnet";

const rentFromParam = (page: Page) => {
  const url = new URL(page.url());
  return encodeURIComponent(url.pathname + url.search);
};

test("desktop: right-edge tab opens the panel without disturbing the search", async ({
  page,
}) => {
  test.skip(!isDesktop(), "desktop-only launcher");

  await page.goto("/rent?q=tamarindo");
  await page.waitForLoadState("networkidle");
  // Wait for the q-filtered results (only the Tamarindo listing matches)
  // before snapshotting the search state the panel must not disturb.
  await expect(page.getByText("1 unit available")).toBeVisible();
  await expect(
    page.getByRole("article", { name: "Casa Guaria, Tamarindo" }),
  ).toBeVisible();

  const tab = page.getByRole("button", { name: "Help & docs" });
  await expect(tab).toBeVisible();
  await expect(tab).toHaveCSS("writing-mode", "vertical-rl");

  // Attached to the right edge, vertically centred, below the header.
  const view = page.viewportSize()!;
  const bounds = await tab.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x + bounds!.width).toBeGreaterThanOrEqual(view.width - 1);
  expect(bounds!.y).toBeGreaterThan(view.height * 0.4);

  // It must never cause horizontal overflow.
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(view.width);

  // The search state is untouched by opening and closing the panel.
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const urlBefore = page.url();

  await tab.click();
  const dialog = page.getByRole("dialog", { name: "Help & docs" });
  await expect(dialog).toBeVisible();

  // The panel hugs the right edge.
  const panel = await dialog.boundingBox();
  expect(panel).not.toBeNull();
  expect(panel!.x + panel!.width).toBeGreaterThanOrEqual(view.width - 1);
  expect(panel!.width).toBeLessThanOrEqual(385); // max-w-sm

  // Focus moves into the panel (Radix lands on the close button); Escape
  // hands focus back to the launcher.
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(tab).toBeFocused();

  expect(page.url()).toBe(urlBefore);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);
  // The q parameter that drove the results is still in the panel's return links.
  expect(rentFromParam(page)).toBe(encodeURIComponent("/rent?q=tamarindo"));
});

test("desktop: all five quick guides and full documentation link back to the search", async ({
  page,
}) => {
  test.skip(!isDesktop(), "desktop-only launcher");

  await page.goto("/rent");
  const tab = page.getByRole("button", { name: "Help & docs" });
  await tab.click();

  const dialog = page.getByRole("dialog", { name: "Help & docs" });
  await expect(dialog).toBeVisible();
  const from = rentFromParam(page);

  const guides: [RegExp, string][] = [
    [/^Finding a place/, "/help/using-rent-filters"],
    [/^Guest guide/, "/help/guest-guide"],
    [/^How escrow payments work/, "/help/escrow-explained"],
    [/^Host guide/, "/help/host-guide"],
    [/^Troubleshooting/, "/help/troubleshooting"],
  ];
  for (const [name, path] of guides) {
    await expect(
      dialog
        .getByRole("link", { name })
        .and(dialog.locator(`a[href="${path}?from=${from}"]`)),
    ).toBeVisible();
  }

  await expect(
    dialog
      .getByRole("link", { name: "Open full documentation" })
      .and(dialog.locator(`a[href="/help?from=${from}"]`)),
  ).toBeVisible();

  // Stellar network info, plus the test-money clarification only on testnet.
  await expect(dialog.getByText(/Stellar network:/)).toContainText(
    expectedNetwork(),
  );
  const note = dialog.getByText(/test money only/i);
  if (expectedNetwork() === "testnet") {
    await expect(note).toBeVisible();
  } else {
    await expect(note).toHaveCount(0);
  }
});

test("help links open served guides that lead back to the search", async ({
  page,
}) => {
  await page.goto("/rent?q=tamarindo");
  await expect(page.getByText("1 unit available")).toBeVisible();

  const launcher = isDesktop()
    ? page.getByRole("button", { name: "Help & docs" })
    : page.getByRole("button", { name: "Help", exact: true });
  await launcher.click();
  const dialog = page.getByRole("dialog", { name: "Help & docs" });
  await expect(dialog).toBeVisible();

  await dialog.getByRole("link", { name: /^How escrow payments work/ }).click();
  await expect(page).toHaveURL(/\/help\/escrow-explained\?from=/);
  await expect(
    page.getByRole("heading", { level: 1, name: "How escrow payments work" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "All guides" }).click();
  await expect(page).toHaveURL(/\/help\?from=/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Help & docs" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /^Troubleshooting/ }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Back to rentals" }).click();
  await expect(page).toHaveURL(/\/rent\?q=tamarindo$/);
  await expect(page.getByText("1 unit available")).toBeVisible();
});

test("help header preserves the rental return path", async ({ page }) => {
  await page.goto("/help/escrow-explained?from=%2Frent%3Fq%3Dtamarindo");
  await expect(
    page.getByRole("link", { name: "Browse rentals" }),
  ).toHaveAttribute("href", "/rent?q=tamarindo");

  await page.goto("/help?from=%2Frent%3Fq%3Dfirst&from=%2Frent%3Fq%3Dsecond");
  await expect(
    page.getByRole("link", { name: "Browse rentals" }),
  ).toHaveAttribute("href", "/rent?q=first");
});

test("desktop: filters and sort survive a help panel round trip", async ({
  page,
}) => {
  test.skip(!isDesktop(), "desktop-only launcher");

  await page.goto("/rent");
  await page.getByRole("button", { name: /^Sort/ }).click();
  await page
    .getByRole("button", { name: "Price: High to Low", exact: true })
    .click();
  await page.keyboard.press("Escape");

  const tab = page.getByRole("button", { name: "Help & docs" });
  await tab.click();
  const dialog = page.getByRole("dialog", { name: "Help & docs" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();

  // The chosen sort remains selected after closing and reopening the popover.
  await page.getByRole("button", { name: /^Sort/ }).click();
  await expect(
    page.getByRole("button", { name: "Price: High to Low", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
});

test("mobile: toolbar Help button replaces the floating tab", async ({
  page,
}) => {
  test.skip(isDesktop(), "mobile/tablet-only launcher");

  await page.goto("/rent");

  const helpButton = page.getByRole("button", { name: "Help", exact: true });
  await expect(helpButton).toBeVisible();
  // The floating right-edge tab exists in the DOM but is hidden below lg.
  await expect(page.getByRole("button", { name: "Help & docs" })).toBeHidden();

  // The toolbar stays inside the viewport and above the bottom sheet zone.
  const view = page.viewportSize()!;
  const bounds = await helpButton.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(view.width);
  expect(bounds!.height).toBeGreaterThanOrEqual(43);

  await helpButton.click();
  const dialog = page.getByRole("dialog", { name: "Help & docs" });
  await expect(dialog).toBeVisible();

  const panel = await dialog.boundingBox();
  expect(panel).not.toBeNull();
  expect(panel!.x + panel!.width).toBeGreaterThanOrEqual(view.width - 1);

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(helpButton).toBeFocused();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(view.width);
});

test("panel launchers respect reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/rent");

  const launcher = isDesktop()
    ? page.getByRole("button", { name: "Help & docs" })
    : page.getByRole("button", { name: "Help", exact: true });

  await launcher.click();
  const dialog = page.getByRole("dialog", { name: "Help & docs" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toBeInViewport({ ratio: 0.5 });
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(launcher).toBeFocused();
});
