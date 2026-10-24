import { NAV_ITEMS, isActive } from "./nav-items";

const activeLabels = (pathname: string) =>
  NAV_ITEMS.filter((item) => isActive(pathname, item)).map((i) => i.label);

describe("isActive", () => {
  it.each([
    ["/dashboard/apartments", ["My apartments"]],
    ["/dashboard/apartments/abc123/edit", ["My apartments"]],
    ["/dashboard/apartments/new", ["New Apartment"]],
    ["/dashboard/hotels/123/edit", ["Hotels"]],
  ])("selects exactly the expected item on %s", (pathname, expected) => {
    expect(activeLabels(pathname)).toEqual(expected);
  });

  it.each([
    "/dashboard/apartments/offers",
    "/dashboard/apartments/abc123/offers",
    "/dashboard/apartments/abc123/offers/",
  ])("leaves the main sidebar neutral on the offers route %s", (pathname) => {
    expect(activeLabels(pathname)).toEqual([]);
  });

  it("never selects more than one item for any known route", () => {
    for (const { href } of NAV_ITEMS) {
      expect(activeLabels(href)).toHaveLength(1);
    }
  });
});
