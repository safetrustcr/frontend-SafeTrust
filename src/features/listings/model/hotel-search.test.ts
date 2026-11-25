import {
  hotelSearchHref,
  parseHotelSearch,
  type HotelSearch,
} from "./hotel-search";

const parse = (source: string) => parseHotelSearch(new URLSearchParams(source));

const EMPTY: HotelSearch = { where: "", from: null, to: null };

describe("parseHotelSearch", () => {
  it("returns empty criteria for no params", () => {
    expect(parse("")).toEqual(EMPTY);
  });

  it("trims where and caps it at 80 characters", () => {
    const long = "a".repeat(100);
    expect(parse(`?where=${encodeURIComponent(`  ${long}  `)}`).where).toBe(
      "a".repeat(80),
    );
  });

  it("keeps a valid date range", () => {
    expect(parse("?where=Escalante&from=2026-11-01&to=2026-11-06")).toEqual({
      where: "Escalante",
      from: "2026-11-01",
      to: "2026-11-06",
    });
  });

  it.each([
    ["impossible day", "from=2026-02-30&to=2026-03-02"],
    ["non-ISO date", "from=11/01/2026&to=11/06/2026"],
    ["reversed range", "from=2026-11-06&to=2026-11-01"],
    ["same day", "from=2026-11-01&to=2026-11-01"],
    ["missing end", "from=2026-11-01"],
  ])("drops an invalid range: %s", (_label, qs) => {
    expect(parse(`?${qs}`)).toEqual(EMPTY);
  });
});

describe("hotelSearchHref", () => {
  it("links to the results page without criteria", () => {
    expect(hotelSearchHref({})).toBe("/hotels/search");
    expect(hotelSearchHref({ where: "   " })).toBe("/hotels/search");
  });

  it("trims and encodes the destination", () => {
    const url = new URL(
      hotelSearchHref({ where: "  San José  " }),
      "http://localhost",
    );
    expect(url.pathname).toBe("/hotels/search");
    expect(url.searchParams.get("where")).toBe("San José");
  });

  it("keeps only complete ranges", () => {
    expect(hotelSearchHref({ from: "2026-11-01", to: null })).toBe(
      "/hotels/search",
    );

    const url = new URL(
      hotelSearchHref({
        where: "Escalante",
        from: "2026-11-01",
        to: "2026-11-06",
      }),
      "http://localhost",
    );
    expect(url.searchParams.get("from")).toBe("2026-11-01");
    expect(url.searchParams.get("to")).toBe("2026-11-06");
  });
});
