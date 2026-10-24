import { parseStaySearch } from "./stay-search";

/** Fixed "today": every date below sits on or after it, so ranges stay valid. */
const TODAY = "2026-01-01";

const parse = (query: string) =>
  parseStaySearch(new URLSearchParams(query), TODAY);

describe("parseStaySearch", () => {
  it("defaults to any guests on any dates", () => {
    expect(parse("")).toEqual({
      q: "",
      place: null,
      guests: { adults: 0, children: 0, infants: 0, pets: 0 },
      dates: { mode: "any" },
    });
  });

  it("parses guest counts", () => {
    expect(parse("adults=6").guests).toEqual({
      adults: 6,
      children: 0,
      infants: 0,
      pets: 0,
    });
    expect(parse("adults=2&children=1&infants=1&pets=1").guests).toEqual({
      adults: 2,
      children: 1,
      infants: 1,
      pets: 1,
    });
  });

  it("keeps the unbounded adult counts the matchers rely on", () => {
    expect(parse("adults=10").guests.adults).toBe(10);
    expect(parse("adults=99").guests.adults).toBe(16); // clamped to GUEST_LIMITS
  });

  it("ignores invalid guest counts", () => {
    expect(parse("adults=-1&pets=abc&infants=1.5").guests).toEqual({
      adults: 0,
      children: 0,
      infants: 0,
      pets: 0,
    });
  });

  it("parses an exact date range", () => {
    expect(parse("checkIn=2026-05-01&checkOut=2026-05-08").dates).toEqual({
      mode: "exact",
      checkIn: "2026-05-01",
      checkOut: "2026-05-08",
      tolerance: 0,
    });
  });

  it("falls back to any dates for empty, partial or malformed ranges", () => {
    expect(parse("checkIn=&checkOut=").dates).toEqual({ mode: "any" });
    expect(parse("checkIn=2026-05-01").dates).toEqual({ mode: "any" });
    expect(parse("checkOut=2026-05-08").dates).toEqual({ mode: "any" });
    expect(parse("checkIn=May&checkOut=June").dates).toEqual({ mode: "any" });
  });

  it("rejects ranges that end before or on their start", () => {
    expect(parse("checkIn=2026-05-08&checkOut=2026-05-01").dates).toEqual({
      mode: "any",
    });
    expect(parse("checkIn=2026-05-01&checkOut=2026-05-01").dates).toEqual({
      mode: "any",
    });
  });

  it("rejects ranges that start in the past", () => {
    expect(parse("checkIn=2025-12-31&checkOut=2026-01-03").dates).toEqual({
      mode: "any",
    });
  });

  it("keeps guest and date constraints independent", () => {
    expect(parse("adults=2&checkIn=2026-05-01&checkOut=2026-05-08")).toEqual({
      q: "",
      place: null,
      guests: { adults: 2, children: 0, infants: 0, pets: 0 },
      dates: {
        mode: "exact",
        checkIn: "2026-05-01",
        checkOut: "2026-05-08",
        tolerance: 0,
      },
    });
  });

  it("reads the text query and a well-formed place slug", () => {
    const search = parse("q=%20%20tamarindo%20beach%20%20&place=tamarindo");
    expect(search.q).toBe("tamarindo beach");
    expect(search.place).toBe("tamarindo");
  });

  it("drops malformed place slugs", () => {
    expect(parse("place=San Jos%C3%A9!").place).toBeNull();
  });
});
