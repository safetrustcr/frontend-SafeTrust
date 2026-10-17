import { test, expect } from "./fixtures";

test.describe("Rental detail — Where you'll stay map and sticky booking bar", () => {
  test("map lazy loads only upon click and expand dialog traps focus", async ({
    page,
  }) => {
    let tileRequestedBeforeClick = false;

    const BLANK_PNG = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      "base64",
    );

    await page.route(/tile\.openstreetmap\.org/, (route) => {
      tileRequestedBeforeClick = true;
      return route.fulfill({
        status: 200,
        contentType: "image/png",
        body: BLANK_PNG,
      });
    });

    await page.goto("/rent/1");

    // 1. Where you'll stay heading and address are present
    const whereHeading = page.getByRole("heading", {
      name: "Where you'll stay",
    });
    await expect(whereHeading).toBeVisible();

    const showMapBtn = page.getByRole("button", { name: "Show map" });
    await expect(showMapBtn).toBeVisible();

    // Verify no tile requests were dispatched before clicking "Show map"
    expect(tileRequestedBeforeClick).toBe(false);

    // 2. Click "Show map" to trigger lazy loading
    await showMapBtn.click();

    // Expand button becomes available
    const expandBtn = page.getByRole("button", { name: /expand/i });
    await expect(expandBtn).toBeVisible();

    // 3. Click Expand to open dialog
    await expandBtn.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Escape closes dialog and restores focus
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(expandBtn).toBeFocused();
  });

  test("booking summary bar displays search intent, '/ night', and handles exact dates", async ({
    page,
  }) => {
    // Navigate with exact dates and guests in query params
    await page.goto("/rent/1?checkIn=2026-11-01&checkOut=2026-11-06&adults=2");

    const isDesktop = (page.viewportSize()?.width ?? 0) >= 1024;
    const summaryBar = isDesktop
      ? page.getByTestId("booking-summary-desktop-card")
      : page.getByTestId("booking-summary-bar");
    await expect(summaryBar).toBeVisible();

    await expect(summaryBar.getByText("/ night")).toBeVisible();
    await expect(summaryBar.getByText("Nov 1 – 6 · 2 guests")).toBeVisible();

    const bookBtn = summaryBar.getByRole("button", { name: "Book" });
    await expect(bookBtn).toBeVisible();

    // Clicking Book navigates to /rent/[id]/escrow/create with parameters (or login redirect with redirect query param if unauthenticated)
    await bookBtn.click();
    await expect(page).toHaveURL(
      /(?:\/rent\/1\/escrow\/create\?checkIn=2026-11-01&checkOut=2026-11-06|\/login\?redirect=%2Frent%2F1%2Fescrow%2Fcreate%3FcheckIn%3D2026-11-01%26checkOut%3D2026-11-06)/,
    );
  });

  test("booking summary bar prompts to choose dates when dates are missing", async ({
    page,
  }) => {
    await page.goto("/rent/1");

    const isDesktop = (page.viewportSize()?.width ?? 0) >= 1024;
    const summaryBar = isDesktop
      ? page.getByTestId("booking-summary-desktop-card")
      : page.getByTestId("booking-summary-bar");
    await expect(summaryBar).toBeVisible();

    await expect(
      summaryBar.getByText("Add dates for availability"),
    ).toBeVisible();
    const chooseDatesBtn = summaryBar.getByRole("button", {
      name: "Choose dates",
    });
    await expect(chooseDatesBtn).toBeVisible();

    // Click opens date selection dialog
    await chooseDatesBtn.click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  for (const width of [320, 360, 390]) {
    test(`sticky bar does not obscure content at ${width}px viewport`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 740 });
      await page.goto("/rent/1");

      const summaryBar = page.getByTestId("booking-summary-bar");
      await expect(summaryBar).toBeVisible();

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const whereHeading = page.getByRole("heading", {
        name: "Where you'll stay",
      });
      await expect(whereHeading).toBeVisible();

      const summaryBox = await summaryBar.boundingBox();
      const whereBox = await whereHeading.boundingBox();

      expect(summaryBox).not.toBeNull();
      expect(whereBox).not.toBeNull();

      // Verify that the sticky bar does not overlap the "Where you'll stay" heading
      const whereBottom = whereBox!.y + whereBox!.height;
      expect(whereBottom).toBeLessThanOrEqual(summaryBox!.y);

      // Verify that the last content element above the bar is also not obscured
      const showMapBtn = page.getByRole("button", { name: "Show map" });
      const showMapBox = await showMapBtn.boundingBox();
      expect(showMapBox).not.toBeNull();
      const lastContentBottom = showMapBox!.y + showMapBox!.height;
      expect(lastContentBottom).toBeLessThanOrEqual(summaryBox!.y);
    });
  }
});
