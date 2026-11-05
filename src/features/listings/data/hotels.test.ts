import { listListings } from "./listings";
import { searchHotels } from "./hotels";

const ALL = { where: "", from: null, to: null };

describe("searchHotels", () => {
  it("returns every fixture without a destination", () => {
    expect(searchHotels(ALL)).toEqual(listListings());
  });

  it("matches name, address or location case-insensitively", () => {
    expect(
      searchHotels({ ...ALL, where: "ESCALANTE" }).map((hotel) => hotel.id),
    ).toEqual(["1"]);
    expect(searchHotels({ ...ALL, where: "heredia" }).length).toBeGreaterThan(
      0,
    );
    expect(searchHotels({ ...ALL, where: "cartago" }).length).toBeGreaterThan(
      0,
    );
  });

  it("returns no stays for an unmatched destination", () => {
    expect(searchHotels({ ...ALL, where: "Atlantis" })).toEqual([]);
  });
});
