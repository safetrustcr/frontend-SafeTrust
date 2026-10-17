import { parseStaySearch } from "./stay-search";

const parse = (query: string) => parseStaySearch(new URLSearchParams(query));

describe("parseStaySearch", () => {
  it("defaults to any guests on any dates", () => {
    expect(parse("")).toEqual({
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

  it("keeps guest and date constraints independent", () => {
    expect(parse("adults=2&checkIn=2026-05-01&checkOut=2026-05-08")).toEqual({
      guests: { adults: 2, children: 0, infants: 0, pets: 0 },
      dates: { mode: "exact", checkIn: "2026-05-01", checkOut: "2026-05-08" },
    });
  });
});
