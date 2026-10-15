import {
  EMPTY_STAY_SEARCH,
  MAX_NIGHTS,
  NO_GUESTS,
  Q_MAX_LENGTH,
  parseDates,
  parseGuests,
  parseStaySearch,
  writeStaySearch,
  type StaySearch,
} from "./stay-search";

// Fixed "today" so these tests never rot; parse() re-validates relative to it.
const TODAY = "2026-10-15";

const parse = (source: string | URLSearchParams) =>
  parseStaySearch(
    typeof source === "string" ? new URLSearchParams(source) : source,
    TODAY,
  );

const write = (search: StaySearch) =>
  writeStaySearch(search, new URLSearchParams()).toString();

const roundTrip = (search: StaySearch) => parse(write(search));

describe("parseStaySearch / writeStaySearch round-trip", () => {
  it("any: empty params stay empty", () => {
    expect(roundTrip(EMPTY_STAY_SEARCH)).toEqual(EMPTY_STAY_SEARCH);
    expect(write(EMPTY_STAY_SEARCH)).toBe("");
  });

  it("any: free-text, place and guests survive", () => {
    const search: StaySearch = {
      q: "tamarindo beach",
      place: "tamarindo-beach",
      guests: { adults: 2, children: 1, infants: 0, pets: 1 },
      dates: { mode: "any" },
    };
    expect(roundTrip(search)).toEqual(search);
  });

  it.each([0, 1, 2] as const)("exact: tolerance %i survives", (tolerance) => {
    const search: StaySearch = {
      q: "escalante",
      place: null,
      guests: { adults: 2, children: 0, infants: 0, pets: 0 },
      dates: {
        mode: "exact",
        checkIn: "2026-11-01",
        checkOut: "2026-11-06",
        tolerance,
      },
    };
    const written = write(search);
    if (tolerance === 0) expect(written).not.toContain("flex=");
    else expect(written).toContain(`flex=${tolerance}`);
    expect(roundTrip(search)).toEqual(search);
  });

  it.each(["weekend", "week", "month"] as const)(
    "flexible: stay=%s survives",
    (stay) => {
      const search: StaySearch = {
        q: "",
        place: null,
        guests: { adults: 1, children: 2, infants: 1, pets: 0 },
        dates: { mode: "flexible", stay, months: ["2026-11", "2027-01"] },
      };
      expect(roundTrip(search)).toEqual(search);
    },
  );

  it("keeps unrelated keys already in the query", () => {
    const query = new URLSearchParams("location=Lim%C3%B3n&bedrooms=2");
    writeStaySearch(parse("q=tamarindo&adults=2"), query);
    expect(query.toString()).toBe(
      "location=Lim%C3%B3n&bedrooms=2&q=tamarindo&adults=2",
    );
    expect(query.get("location")).toBe("Limón");
  });

  it("removes stale search keys from the query", () => {
    const query = new URLSearchParams("flex=1&checkIn=2026-01-01&adults=9x");
    writeStaySearch(parse("adults=0&children=2"), query);
    expect(query.toString()).toBe("");
  });
});

describe("parseGuests", () => {
  it.each([
    ["adults=-1", NO_GUESTS],
    ["adults=1.5", NO_GUESTS],
    ["adults=1e2", NO_GUESTS],
    ["adults=abc", NO_GUESTS],
    ["adults=%2B2", NO_GUESTS],
    ["adults=9999", NO_GUESTS], // more than 3 digits is not an integer here
    ["adults=999", { adults: 16, children: 0, infants: 0, pets: 0 }],
    [
      "adults=2&children=1&infants=1&pets=1",
      { adults: 2, children: 1, infants: 1, pets: 1 },
    ],
    ["adults=16&children=3", { adults: 16, children: 0, infants: 0, pets: 0 }],
    ["adults=2&children=999", { adults: 2, children: 14, infants: 0, pets: 0 }],
    ["adults=1&infants=9", { adults: 1, children: 0, infants: 5, pets: 0 }],
    ["adults=1&pets=9", { adults: 1, children: 0, infants: 0, pets: 5 }],
  ])("%s normalizes to %o", (query, expected) => {
    expect(parseGuests(new URLSearchParams(query))).toEqual(expected);
  });

  it.each([
    "children=2",
    "infants=1",
    "pets=1",
    "children=2&infants=1&pets=1",
    "adults=0&children=2",
    "adults=0&infants=1",
    "adults=0&pets=1",
  ])("%s (no adult) is not a valid party", (query) => {
    expect(parseGuests(new URLSearchParams(query))).toEqual(NO_GUESTS);
  });

  it("has no guests by default", () => {
    expect(parseGuests(new URLSearchParams(""))).toEqual(NO_GUESTS);
  });
});

describe("parseDates", () => {
  it("defaults to any", () => {
    expect(parseDates(new URLSearchParams(""), TODAY)).toEqual({
      mode: "any",
    });
  });

  it("accepts a valid exact range, including a same-day start", () => {
    expect(
      parseDates(
        new URLSearchParams("checkIn=2026-10-15&checkOut=2026-10-17"),
        TODAY,
      ),
    ).toEqual({
      mode: "exact",
      checkIn: "2026-10-15",
      checkOut: "2026-10-17",
      tolerance: 0,
    });
  });

  it.each([
    ["checkIn=2026-11-06&checkOut=2026-11-01", "reversed range"],
    ["checkIn=2026-11-01&checkOut=2026-11-01", "zero nights"],
    ["checkIn=2026-10-14&checkOut=2026-10-20", "check-in in the past"],
    ["checkIn=2026-02-30&checkOut=2026-03-05", "impossible calendar day"],
    ["checkIn=2026-11-01&checkOut=2026-11-40", "impossible check-out"],
    ["checkIn=2026-10-15&checkOut=2027-01-14", "more than 90 nights (91)"],
    ["checkIn=2026-11-01", "missing check-out"],
    ["checkOut=2026-11-06", "missing check-in"],
    ["checkIn=&checkOut=2026-11-06", "empty check-in"],
  ])("%s drops the range (%s)", (query) => {
    expect(parseDates(new URLSearchParams(query), TODAY)).toEqual({
      mode: "any",
    });
  });

  it(`accepts exactly ${MAX_NIGHTS} nights`, () => {
    expect(
      parseDates(
        new URLSearchParams("checkIn=2026-10-15&checkOut=2027-01-13"),
        TODAY,
      ),
    ).toMatchObject({ mode: "exact" });
  });

  it.each([
    ["flex=0", 0],
    ["flex=1", 1],
    ["flex=2", 2],
    ["flex=3", 0],
    ["flex=abc", 0],
    ["flex=", 0],
  ])("%s normalizes to tolerance %i", (flex, tolerance) => {
    const dates = parseDates(
      new URLSearchParams(`checkIn=2026-11-01&checkOut=2026-11-06&${flex}`),
      TODAY,
    );
    expect(dates).toEqual({
      mode: "exact",
      checkIn: "2026-11-01",
      checkOut: "2026-11-06",
      tolerance,
    });
  });

  it.each([
    ["weekend", "2026-11"],
    ["week", "2026-10"],
    ["month", "2027-09"],
  ])("accepts stay=%s with month %s inside the window", (stay, month) => {
    expect(
      parseDates(new URLSearchParams(`stay=${stay}&months=${month}`), TODAY),
    ).toEqual({ mode: "flexible", stay, months: [month] });
  });

  it("dedupes and sorts months", () => {
    expect(
      parseDates(
        new URLSearchParams("stay=week&months=2027-01,2026-11,2026-11"),
        TODAY,
      ),
    ).toEqual({
      mode: "flexible",
      stay: "week",
      months: ["2026-11", "2027-01"],
    });
  });

  it.each([
    ["months=2026-09", "before the 12-month window"],
    ["months=2027-10", "after the 12-month window"],
    ["months=2026-13", "impossible month"],
    ["months=2026-11-01", "not a month"],
    ["months=", "empty"],
    ["months=banana", "garbage"],
  ])("drops month %s (%s) and falls back to any", (months) => {
    expect(
      parseDates(new URLSearchParams(`stay=week&${months}`), TODAY),
    ).toEqual({ mode: "any" });
  });

  it.each([
    ["stay=bogus", "unknown stay length"],
    ["stay=", "empty stay length"],
    ["", "missing stay length"],
  ])("ignores months without a valid stay (%s: %s)", (stay) => {
    expect(
      parseDates(new URLSearchParams(`${stay}&months=2026-11`), TODAY),
    ).toEqual({ mode: "any" });
  });

  it("lets exact dates win over flexible fields", () => {
    const params = new URLSearchParams(
      "checkIn=2026-11-01&checkOut=2026-11-06&stay=week&months=2026-11",
    );
    const search = parse(params);
    expect(search.dates).toEqual({
      mode: "exact",
      checkIn: "2026-11-01",
      checkOut: "2026-11-06",
      tolerance: 0,
    });
    const written = write(search);
    expect(written).toContain("checkIn=2026-11-01");
    expect(written).not.toContain("stay=");
    expect(written).not.toContain("months=");
    expect(parse(written).dates).toEqual(search.dates);
  });

  it("never applies half an exact range, even with flexible fields present", () => {
    expect(
      parseDates(
        new URLSearchParams(
          "checkIn=2026-11-06&checkOut=2026-11-01&stay=week&months=2026-11",
        ),
        TODAY,
      ),
    ).toEqual({ mode: "any" });
  });
});

describe("parseStaySearch", () => {
  it("collapses whitespace and trims q", () => {
    expect(parse("q=%20%20tamarindo%20%20%20beach%20").q).toBe(
      "tamarindo beach",
    );
    expect(parse("q=%20").q).toBe("");
  });

  it(`truncates q to ${Q_MAX_LENGTH} characters`, () => {
    const long = "a".repeat(Q_MAX_LENGTH + 20);
    expect(parse(`q=${long}`).q).toBe("a".repeat(Q_MAX_LENGTH));
  });

  it.each([
    ["tamarindo-beach", "tamarindo-beach"],
    ["escalante", "escalante"],
    ["a1-b2", "a1-b2"],
  ])("keeps place id %s", (place, expected) => {
    expect(parse(`place=${place}`).place).toBe(expected);
  });

  it.each([
    ["Lim%C3%B3n", "accents"],
    ["Tamarindo", "uppercase"],
    ["tamarindo beach", "spaces"],
    ["a".repeat(49), "longer than 48 characters"],
    ["tamarindo/beach", "slash"],
  ])("rejects place %s (%s)", (place) => {
    expect(parse(`place=${place}`).place).toBeNull();
  });

  it("normalizes the issue's URL examples", () => {
    expect(
      parse(
        "location=Lim%C3%B3n&adults=2&checkIn=2026-11-01&checkOut=2026-11-06",
      ),
    ).toEqual({
      q: "",
      place: null,
      guests: { adults: 2, children: 0, infants: 0, pets: 0 },
      dates: {
        mode: "exact",
        checkIn: "2026-11-01",
        checkOut: "2026-11-06",
        tolerance: 0,
      },
    });
    expect(
      parse("q=tamarindo&adults=2&children=1&stay=week&months=2026-11,2026-12"),
    ).toEqual({
      q: "tamarindo",
      place: null,
      guests: { adults: 2, children: 1, infants: 0, pets: 0 },
      dates: {
        mode: "flexible",
        stay: "week",
        months: ["2026-11", "2026-12"],
      },
    });
    expect(write(parse("adults=0&children=2"))).toBe("");
    expect(write(parse("checkIn=2026-11-06&checkOut=2026-11-01"))).toBe("");
  });

  it("does not read or write anything outside STAY_SEARCH_KEYS", () => {
    const search = parse("token=secret&lat=9.9&lng=-84&adults=2");
    expect(search).toEqual({
      q: "",
      place: null,
      guests: { adults: 2, children: 0, infants: 0, pets: 0 },
      dates: { mode: "any" },
    });
    expect(write(search)).toBe("adults=2");
  });
});
