import { SECTIONS } from "./sections";
import { EMPTY_STAY_SEARCH } from "./stay-search";
import type { SearchDraft } from "./composer-types";

describe("SECTIONS", () => {
  const baseDraft: SearchDraft = {
    ...EMPTY_STAY_SEARCH,
    location: null,
    nearby: false,
  };

  const whoSection = SECTIONS.find((s) => s.id === "who")!;
  const whereSection = SECTIONS.find((s) => s.id === "where")!;

  describe("Where section summary", () => {
    it("returns 'Nearby' when nearby is true", () => {
      expect(whereSection.summary({ ...baseDraft, nearby: true })).toBe(
        "Nearby",
      );
    });

    it("returns query if present", () => {
      expect(whereSection.summary({ ...baseDraft, q: "San José" })).toBe(
        "San José",
      );
    });

    it("returns location if query is empty", () => {
      expect(whereSection.summary({ ...baseDraft, location: "San José" })).toBe(
        "San José",
      );
    });

    it("returns 'Anywhere' when empty", () => {
      expect(whereSection.summary(baseDraft)).toBe("Anywhere");
    });
  });

  describe("Who section summary", () => {
    it("returns 'Add guests' when all counts are 0", () => {
      expect(whoSection.summary(baseDraft)).toBe("Add guests");
    });

    it("formats singular and plural guests correctly", () => {
      expect(
        whoSection.summary({
          ...baseDraft,
          guests: { adults: 1, children: 0, infants: 0, pets: 0 },
        }),
      ).toBe("1 guest");

      expect(
        whoSection.summary({
          ...baseDraft,
          guests: { adults: 2, children: 1, infants: 0, pets: 0 },
        }),
      ).toBe("3 guests");
    });

    it("includes infants and pets with correct plurals", () => {
      expect(
        whoSection.summary({
          ...baseDraft,
          guests: { adults: 2, children: 1, infants: 1, pets: 1 },
        }),
      ).toBe("3 guests, 1 infant, 1 pet");

      expect(
        whoSection.summary({
          ...baseDraft,
          guests: { adults: 2, children: 0, infants: 2, pets: 3 },
        }),
      ).toBe("2 guests, 2 infants, 3 pets");
    });
  });
});
