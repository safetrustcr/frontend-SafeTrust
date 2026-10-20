import {
  parseGuests,
  parseDates,
  parseStaySearch,
  writeStaySearch,
  formatWhenSummary,
  NO_GUESTS,
  GUEST_LIMITS,
  StaySearch,
} from "./stay-search";

describe("stay-search query serialization and parsing", () => {
  const today = "2026-11-01";

  describe("parseGuests", () => {
    it("parses valid guest counts within limits", () => {
      const params = new URLSearchParams(
        "adults=2&children=1&infants=1&pets=1",
      );
      expect(parseGuests(params)).toEqual({
        adults: 2,
        children: 1,
        infants: 1,
        pets: 1,
      });
    });

    it("clamps values exceeding limits", () => {
      const params = new URLSearchParams(
        `adults=99&children=99&infants=99&pets=99`,
      );
      expect(parseGuests(params)).toEqual({
        adults: GUEST_LIMITS.adults,
        children: GUEST_LIMITS.children,
        infants: GUEST_LIMITS.infants,
        pets: GUEST_LIMITS.pets,
      });
    });

    it("resets to NO_GUESTS if adults is 0 but children/infants/pets are present", () => {
      const params = new URLSearchParams("adults=0&children=2");
      expect(parseGuests(params)).toEqual(NO_GUESTS);
    });

    it("ignores non-integer or negative values", () => {
      const params = new URLSearchParams("adults=abc&children=-2");
      expect(parseGuests(params)).toEqual(NO_GUESTS);
    });
  });

  describe("parseDates", () => {
    it("parses valid exact dates without tolerance", () => {
      const params = new URLSearchParams(
        "checkIn=2026-11-05&checkOut=2026-11-10",
      );
      expect(parseDates(params, today)).toEqual({
        mode: "exact",
        checkIn: "2026-11-05",
        checkOut: "2026-11-10",
        tolerance: 0,
      });
    });

    it("parses exact dates with tolerance flex=1 and flex=2", () => {
      const params1 = new URLSearchParams(
        "checkIn=2026-11-05&checkOut=2026-11-10&flex=1",
      );
      expect(parseDates(params1, today)).toEqual({
        mode: "exact",
        checkIn: "2026-11-05",
        checkOut: "2026-11-10",
        tolerance: 1,
      });

      const params2 = new URLSearchParams(
        "checkIn=2026-11-05&checkOut=2026-11-10&flex=2",
      );
      expect(parseDates(params2, today)).toEqual({
        mode: "exact",
        checkIn: "2026-11-05",
        checkOut: "2026-11-10",
        tolerance: 2,
      });
    });

    it("rejects checkIn prior to today or checkIn >= checkOut", () => {
      const past = new URLSearchParams(
        "checkIn=2026-10-31&checkOut=2026-11-05",
      );
      expect(parseDates(past, today)).toEqual({ mode: "any" });

      const inverted = new URLSearchParams(
        "checkIn=2026-11-10&checkOut=2026-11-05",
      );
      expect(parseDates(inverted, today)).toEqual({ mode: "any" });

      const sameDay = new URLSearchParams(
        "checkIn=2026-11-05&checkOut=2026-11-05",
      );
      expect(parseDates(sameDay, today)).toEqual({ mode: "any" });
    });

    it("rejects stays exceeding MAX_NIGHTS (90 nights)", () => {
      const tooLong = new URLSearchParams(
        "checkIn=2026-11-01&checkOut=2027-03-01",
      );
      expect(parseDates(tooLong, today)).toEqual({ mode: "any" });
    });

    it("parses flexible dates for weekend, week, and month within 12 months", () => {
      const params = new URLSearchParams("stay=week&months=2026-11,2026-12");
      expect(parseDates(params, today)).toEqual({
        mode: "flexible",
        stay: "week",
        months: ["2026-11", "2026-12"],
      });
    });

    it("filters out invalid months or months beyond 12-month window", () => {
      const params = new URLSearchParams(
        "stay=weekend&months=2026-10,2026-11,2027-11,invalid",
      );
      // today is 2026-11, so 2026-10 is past, 2027-11 is 12 months later (last allowed is addMonths(2026-11, 11) = 2027-10)
      expect(parseDates(params, today)).toEqual({
        mode: "flexible",
        stay: "weekend",
        months: ["2026-11"],
      });
    });

    it("falls back to any dates when flexible stay has no valid months", () => {
      const params = new URLSearchParams("stay=weekend&months=2026-10");
      expect(parseDates(params, today)).toEqual({ mode: "any" });
    });
  });

  describe("parseStaySearch and writeStaySearch round-trip", () => {
    it("round-trips an exact search with tolerance", () => {
      const initial: StaySearch = {
        q: "Beachfront Villa",
        place: "san-jose",
        guests: { adults: 2, children: 1, infants: 0, pets: 1 },
        dates: {
          mode: "exact",
          checkIn: "2026-11-10",
          checkOut: "2026-11-15",
          tolerance: 1,
        },
      };

      const query = writeStaySearch(initial, new URLSearchParams());
      expect(query.get("q")).toBe("Beachfront Villa");
      expect(query.get("place")).toBe("san-jose");
      expect(query.get("adults")).toBe("2");
      expect(query.get("children")).toBe("1");
      expect(query.get("pets")).toBe("1");
      expect(query.get("checkIn")).toBe("2026-11-10");
      expect(query.get("checkOut")).toBe("2026-11-15");
      expect(query.get("flex")).toBe("1");

      const parsed = parseStaySearch(query, today);
      expect(parsed).toEqual(initial);
    });

    it("round-trips a flexible search", () => {
      const initial: StaySearch = {
        q: "",
        place: null,
        guests: { adults: 1, children: 0, infants: 0, pets: 0 },
        dates: {
          mode: "flexible",
          stay: "month",
          months: ["2026-11", "2026-12"],
        },
      };

      const query = writeStaySearch(initial, new URLSearchParams());
      expect(query.get("stay")).toBe("month");
      expect(query.get("months")).toBe("2026-11,2026-12");

      const parsed = parseStaySearch(query, today);
      expect(parsed).toEqual(initial);
    });
  });

  describe("formatWhenSummary", () => {
    it("formats mode: any", () => {
      expect(formatWhenSummary({ mode: "any" })).toBe("Any dates");
    });

    it("formats exact dates with and without tolerance", () => {
      expect(
        formatWhenSummary({
          mode: "exact",
          checkIn: "2026-11-01",
          checkOut: "2026-11-06",
          tolerance: 0,
        }),
      ).toBe("Nov 1 – 6");

      expect(
        formatWhenSummary({
          mode: "exact",
          checkIn: "2026-11-01",
          checkOut: "2026-11-06",
          tolerance: 1,
        }),
      ).toBe("Nov 1 – 6 (± 1)");

      expect(
        formatWhenSummary({
          mode: "exact",
          checkIn: "2026-11-01",
          checkOut: "2026-11-06",
          tolerance: 2,
        }),
      ).toBe("Nov 1 – 6 (± 2)");
    });

    it("formats flexible dates with 1, 2, and 3+ months", () => {
      expect(
        formatWhenSummary({
          mode: "flexible",
          stay: "weekend",
          months: ["2026-11"],
        }),
      ).toBe("A weekend in Nov");

      expect(
        formatWhenSummary({
          mode: "flexible",
          stay: "week",
          months: ["2026-11", "2026-12"],
        }),
      ).toBe("A week in Nov or Dec");

      expect(
        formatWhenSummary({
          mode: "flexible",
          stay: "month",
          months: ["2026-11", "2026-12", "2027-01"],
        }),
      ).toBe("A month in Nov, Dec or Jan");

      expect(
        formatWhenSummary({
          mode: "flexible",
          stay: "week",
          months: [],
        }),
      ).toBe("Select months");
    });
  });
});
