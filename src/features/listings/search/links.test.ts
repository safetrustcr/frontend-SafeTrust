import { listingHref } from "./links";

describe("listingHref", () => {
  it("keeps applied search criteria but drops page-specific selection", () => {
    expect(
      listingHref(
        "/rent",
        new URLSearchParams(
          "location=Lim%C3%B3n&adults=2&checkIn=2030-01-10&checkOut=2030-01-12&selected=5&view=map",
        ),
      ),
    ).toBe(
      "/rent?location=Lim%C3%B3n&adults=2&checkIn=2030-01-10&checkOut=2030-01-12&view=map",
    );
  });

  it("preserves the query on rental detail links", () => {
    expect(
      listingHref("/rent/5", new URLSearchParams("q=nispero&selected=2")),
    ).toBe("/rent/5?q=nispero");
  });

  it("does not add an empty query string", () => {
    expect(listingHref("/guest/suggestions", new URLSearchParams())).toBe(
      "/guest/suggestions",
    );
  });

  it("does not carry map coordinates to another listing page", () => {
    expect(
      listingHref(
        "/guest/suggestions",
        new URLSearchParams(
          "location=Heredia&lat=9.99&lng=-84.11&coordinates=9.99%2C-84.11",
        ),
      ),
    ).toBe("/guest/suggestions?location=Heredia");
  });
});
