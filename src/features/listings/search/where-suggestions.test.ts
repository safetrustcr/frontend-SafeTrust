import {
  applyRentFilters,
  DEFAULT_FILTERS,
  parseFilters,
} from "../model/filters";
import { APARTMENT_LISTINGS } from "../data/demo-listings";
import { applyStaySearch, matchesQuery } from "./match-stay";
import {
  parseStaySearch,
  writeStaySearch,
  EMPTY_STAY_SEARCH,
} from "./stay-search";
import {
  MAX_WHERE_SUGGESTIONS,
  suggestionDraft,
  whereSuggestions,
  type WhereSuggestion,
} from "./where-suggestions";

const TODAY = "2026-03-02";
const labels = (text: string) =>
  whereSuggestions(text, APARTMENT_LISTINGS).map((s) => s.label);

/** What /rent shows for a URL: rent filters, then q, then the stay search. */
function rentResults(query: URLSearchParams) {
  const search = parseStaySearch(query, TODAY);
  return applyStaySearch(
    applyRentFilters(APARTMENT_LISTINGS, parseFilters(query)).filter(
      (listing) => matchesQuery(listing, search.q),
    ),
    search,
    TODAY,
  );
}

function urlFor(suggestion: WhereSuggestion) {
  const draft = suggestionDraft(suggestion);
  const query = new URLSearchParams();
  if (draft.location) query.set("location", draft.location);
  return writeStaySearch({ ...EMPTY_STAY_SEARCH, ...draft }, query);
}

describe("whereSuggestions", () => {
  it("suggests the provinces when the text is empty", () => {
    expect(labels("")).toEqual([
      "San José",
      "Heredia",
      "Alajuela",
      "Cartago",
      "Puntarenas",
      "Guanacaste",
      "Limón",
    ]);
  });

  it.each([
    ["san jose", "San José"],
    ["limon", "Limón"],
    ["  LIMON  ", "Limón"],
    ["san   jose", "San José"],
  ])("%j matches %s", (text, label) => {
    expect(labels(text)[0]).toBe(label);
  });

  it("suggests the province, its neighborhood and its listing for 'limon'", () => {
    expect(labels("limon")).toEqual([
      "Limón",
      "Barrio Roosevelt, Limón",
      "Muelle Viejo Apartment",
    ]);
  });

  it("matches neighborhood names, accents and aliases", () => {
    expect(labels("rio seg")).toEqual([
      "Río Segundo, Alajuela",
      "Airport Garden Apartment",
    ]);
    expect(labels("playa tam")[0]).toBe("Tamarindo, Guanacaste");
  });

  it("ranks prefix matches first within a group", () => {
    const places = whereSuggestions("el", APARTMENT_LISTINGS)
      .filter((s) => s.kind === "place")
      .map((s) => s.label);
    expect(places.slice(0, 3)).toEqual([
      "El Llano, Alajuela",
      "El Tejar, Cartago",
      "Barrio El Carmen, Puntarenas",
    ]);
  });

  it(`returns at most ${MAX_WHERE_SUGGESTIONS} suggestions`, () => {
    expect(labels("a").length).toBe(MAX_WHERE_SUGGESTIONS);
  });

  it("returns nothing for text that matches no place", () => {
    expect(labels("xyz")).toEqual([]);
  });

  it("leaves out places with no stays in the given listings", () => {
    const heredia = APARTMENT_LISTINGS.filter((l) => l.location === "Heredia");
    expect(whereSuggestions("", heredia).map((s) => s.label)).toEqual([
      "Heredia",
    ]);
    expect(whereSuggestions("tamarindo", heredia)).toEqual([]);
  });

  it.each(["", "san", "a", "barrio", "tamarindo", "heredia"])(
    "counts for %j equal what /rent shows after selecting",
    (text) => {
      for (const suggestion of whereSuggestions(text, APARTMENT_LISTINGS)) {
        const results = rentResults(urlFor(suggestion));
        if (suggestion.kind === "listing") {
          expect(results.map((l) => l.id)).toContain(suggestion.id);
        } else {
          expect(results).toHaveLength(suggestion.count);
        }
      }
    },
  );

  it("counts honour the other criteria when given filtered listings", () => {
    const family = applyRentFilters(APARTMENT_LISTINGS, {
      ...DEFAULT_FILTERS,
      categories: ["Family"],
    });
    for (const suggestion of whereSuggestions("", family)) {
      const query = urlFor(suggestion);
      query.set("categories", "Family");
      expect(rentResults(query)).toHaveLength(
        suggestion.kind === "listing" ? 1 : suggestion.count,
      );
    }
  });
});

describe("suggestionDraft", () => {
  const first = (text: string, kind: WhereSuggestion["kind"]) =>
    whereSuggestions(text, APARTMENT_LISTINGS).find((s) => s.kind === kind)!;

  it("writes what the issue's table says for each kind", () => {
    expect(suggestionDraft(first("limon", "province"))).toEqual({
      location: "Limón",
      place: null,
      q: "",
    });
    expect(suggestionDraft(first("tamarindo", "place"))).toEqual({
      location: "Guanacaste",
      place: "tamarindo",
      q: "",
    });
    expect(suggestionDraft(first("tamarindo", "listing"))).toEqual({
      location: "Guanacaste",
      place: "tamarindo",
      q: "Casa Guaria, Tamarindo",
    });
  });
});
