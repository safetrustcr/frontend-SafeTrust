import {
  test,
  expect,
  expectHealthyPage,
  expectPathname,
  gotoApp,
  waitForHydration,
} from "./fixtures";
import { MOCK_USERS, mockFirebaseAuth } from "./support/mock-auth";

async function login(page: import("@playwright/test").Page) {
  const form = page.locator("form");
  await waitForHydration(form);
  await expect(form).toHaveAttribute("data-hydrated", "true");
  await page.getByLabel("Email").fill(MOCK_USERS.guest.email);
  await page.getByLabel("Password").fill(MOCK_USERS.guest.password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
}

test.describe("Wishlists", () => {
  test.beforeEach(async ({ page }) => {
    await mockFirebaseAuth(page);
  });

  test("signed out: ♥ asks to log in instead of saving", async ({ page }) => {
    await page.goto("/rent");
    const save = page.getByRole("button", {
      name: /save casa níspero.* to wishlists/i,
    });
    await waitForHydration(save);
    await expect(save).toHaveAttribute("aria-pressed", "false");
    await save.click();
    await expect(page).toHaveURL(/\/login\?redirect=%2Frent$/);
  });

  test("save → wishlist → remove", async ({ page }) => {
    await page.goto("/login?redirect=/guest/suggestions");
    await login(page);
    await expectPathname(page, "/guest/suggestions");
    await expect(
      page.getByRole("link", { name: /^Wishlists/ }),
    ).toHaveAttribute("href", "/dashboard/favorites");

    const save = page.getByRole("button", {
      name: "Save Luz de Los Yoses Studio to Wishlists",
    });
    await waitForHydration(save);
    await expect(save).toHaveAttribute("aria-pressed", "false");
    await save.click();
    await expect(
      page.getByRole("status").getByText("Saved to Wishlists"),
    ).toBeAttached();
    await expect(
      page.getByRole("link", { name: "Wishlists, 1 saved" }),
    ).toBeVisible();

    // The save is shared: /rent shows it as saved too. Don't wait for `load`
    // (it can stall on slow CI runners); waitForHydration below waits for
    // the button this step needs.
    await gotoApp(page, "/rent");
    const removeRent = page.getByRole("button", {
      name: "Remove Luz de Los Yoses Studio from Wishlists",
    });
    await waitForHydration(removeRent);
    await expect(removeRent).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("link", { name: "Wishlists, 1 saved" }).click();
    await expectPathname(page, "/dashboard/favorites");
    await expect(page.getByText("1 stay", { exact: true })).toBeVisible();
    await expectHealthyPage(page);

    await page.getByRole("link", { name: /saved stays/i }).click();
    await expectPathname(page, "/dashboard/favorites/saved");
    await expect(
      page.getByRole("link", { name: /view stay: luz de los yoses studio/i }),
    ).toHaveAttribute("href", "/rent/2");
    await expectHealthyPage(page);

    const removeSaved = page.getByRole("button", {
      name: "Remove Luz de Los Yoses Studio from Wishlists",
    });
    await waitForHydration(removeSaved);
    await removeSaved.click();
    await expect(page.getByText("No saved stays yet.")).toBeVisible();
  });

  test("saved stays survive a new page in the same context", async ({
    page,
    context,
  }) => {
    await page.goto("/login?redirect=/guest/suggestions");
    await login(page);
    await expectPathname(page, "/guest/suggestions");
    await expect(
      page.getByRole("link", { name: /^Wishlists/ }),
    ).toHaveAttribute("href", "/dashboard/favorites");

    const save = page.getByRole("button", {
      name: "Save Luz de Los Yoses Studio to Wishlists",
    });
    await waitForHydration(save);
    await save.click();
    await expect(
      page.getByRole("link", { name: "Wishlists, 1 saved" }),
    ).toBeVisible();

    const second = await context.newPage();
    const appOrigin = new URL(page.url()).origin;
    await second.route(
      (url) => !url.href.startsWith(appOrigin),
      (route) => route.abort("blockedbyclient"),
    );
    await mockFirebaseAuth(second);
    await gotoApp(second, "/rent");
    await expect(
      second.getByRole("link", { name: /^Wishlists/ }),
    ).toHaveAttribute("href", "/dashboard/favorites");

    const saved = second.getByRole("button", {
      name: "Remove Luz de Los Yoses Studio from Wishlists",
    });
    await expect(saved).toHaveAttribute("aria-pressed", "true");
    await expect(
      second.getByRole("link", { name: "Wishlists, 1 saved" }),
    ).toBeVisible();

    await second.close();
  });

  test("a save in another tab updates this open tab", async ({
    page,
    context,
  }) => {
    await page.goto("/login?redirect=/guest/suggestions");
    await login(page);
    await expectPathname(page, "/guest/suggestions");
    await expect(
      page.getByRole("link", { name: /^Wishlists/ }),
    ).toHaveAttribute("href", "/dashboard/favorites");

    const second = await context.newPage();
    const appOrigin = new URL(page.url()).origin;
    await second.route(
      (url) => !url.href.startsWith(appOrigin),
      (route) => route.abort("blockedbyclient"),
    );
    await mockFirebaseAuth(second);
    await gotoApp(second, "/rent");

    // Wait until the second tab is signed in and its storage listener mounted.
    await expect(
      second.getByRole("link", { name: /^Wishlists/ }),
    ).toHaveAttribute("href", "/dashboard/favorites");

    const secondSave = second.getByRole("button", {
      name: /Luz de Los Yoses Studio/,
    });
    await waitForHydration(secondSave);
    await expect(secondSave).toHaveAttribute("aria-pressed", "false");

    // Write the same key the first tab's store writes; the browser delivers a
    // `storage` event to the second tab, which must rehydrate and re-render.
    await page.evaluate(
      ({ key, uid, listingId, version }) => {
        const stored = JSON.parse(localStorage.getItem(key) ?? "null") ?? {
          state: { byUser: {} },
          version,
        };
        stored.state.byUser[uid] = [
          ...(stored.state.byUser[uid] ?? []),
          listingId,
        ];
        localStorage.setItem(key, JSON.stringify(stored));
      },
      {
        key: "safetrust-wishlist",
        uid: MOCK_USERS.guest.uid,
        listingId: "2",
        version: 1,
      },
    );

    await expect(secondSave).toHaveAttribute("aria-pressed", "true");
    await expect(
      second.getByRole("link", { name: "Wishlists, 1 saved" }),
    ).toBeVisible();

    await second.close();
  });

  test("removing a stay in another tab updates this open tab", async ({
    page,
    context,
  }) => {
    await page.goto("/login?redirect=/guest/suggestions");
    await login(page);
    await expectPathname(page, "/guest/suggestions");
    await expect(
      page.getByRole("link", { name: /^Wishlists/ }),
    ).toHaveAttribute("href", "/dashboard/favorites");

    const firstSave = page.getByRole("button", {
      name: "Save Luz de Los Yoses Studio to Wishlists",
    });
    await waitForHydration(firstSave);
    await firstSave.click();
    await expect(
      page.getByRole("link", { name: "Wishlists, 1 saved" }),
    ).toBeVisible();

    const second = await context.newPage();
    const appOrigin = new URL(page.url()).origin;
    await second.route(
      (url) => !url.href.startsWith(appOrigin),
      (route) => route.abort("blockedbyclient"),
    );
    await mockFirebaseAuth(second);
    await gotoApp(second, "/rent");

    const secondRemove = second.getByRole("button", {
      name: "Remove Luz de Los Yoses Studio from Wishlists",
    });
    await waitForHydration(secondRemove);
    await expect(secondRemove).toHaveAttribute("aria-pressed", "true");
    await secondRemove.click();
    await expect(
      second.getByRole("button", {
        name: "Save Luz de Los Yoses Studio to Wishlists",
      }),
    ).toHaveAttribute("aria-pressed", "false");

    const storedAfterRemove = await second.evaluate(
      ({ key, uid }) => {
        const parsed = JSON.parse(localStorage.getItem(key) ?? "null");
        return parsed?.state?.byUser?.[uid] ?? null;
      },
      { key: "safetrust-wishlist", uid: MOCK_USERS.guest.uid },
    );
    expect(storedAfterRemove).toEqual([]);

    await expect(
      page.getByRole("button", {
        name: "Save Luz de Los Yoses Studio to Wishlists",
      }),
    ).toHaveAttribute("aria-pressed", "false");
    await expect(
      page.getByRole("link", { name: "Wishlists", exact: true }),
    ).toBeVisible();

    await second.close();
  });

  test("unknown wishlist id is a 404", async ({ page }) => {
    await page.goto("/login?redirect=/dashboard/favorites/other");
    await login(page);
    await expectPathname(page, "/dashboard/favorites/other");
    await expect(
      page.getByRole("heading", { name: "We couldn't find that page" }),
    ).toBeVisible();
  });
});
