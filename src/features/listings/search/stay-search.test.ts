import {
  EMPTY_STAY_SEARCH,
  readStaySearch,
  writeStaySearch,
} from "./stay-search";

describe("stay search URL helpers", () => {
  it("reads the current free-text query", () => {
    expect(readStaySearch(new URLSearchParams("q=tamarindo"))).toEqual({
      q: "tamarindo",
    });
  });

  it("writes a trimmed query and removes it when cleared", () => {
    const params = new URLSearchParams("categories=Family&q=old");

    writeStaySearch({ q: " Tamarindo " }, params);
    expect(params.toString()).toBe("categories=Family&q=Tamarindo");

    writeStaySearch(EMPTY_STAY_SEARCH, params);
    expect(params.toString()).toBe("categories=Family");
  });
});
