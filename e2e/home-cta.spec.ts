import { expect, test } from "./fixtures";

test("hero list your property CTA sends new hosts to the apartment form", async ({
  page,
}) => {
  await page.goto("/");
  const cta = page
    .getByRole("main")
    .getByRole("link", { name: "List your property", exact: true });
  await expect(cta).toHaveAttribute(
    "href",
    "/login?redirect=/dashboard/apartments/new",
  );
  await cta.click();
  await expect(page).toHaveURL(
    /\/login\?redirect=(?:%2F|\/)dashboard(?:%2F|\/)apartments(?:%2F|\/)new$/,
  );
});
