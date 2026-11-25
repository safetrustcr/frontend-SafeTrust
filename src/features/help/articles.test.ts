import { HELP_ARTICLES, getHelpArticle, resolveReturnPath } from "./articles";

describe("help articles", () => {
  it("publishes every guide the rent help panel links to", () => {
    for (const slug of [
      "using-rent-filters",
      "guest-guide",
      "escrow-explained",
      "host-guide",
      "troubleshooting",
    ]) {
      expect(getHelpArticle(slug)?.sections.length).toBeGreaterThan(0);
    }
  });

  it("uses unique slugs", () => {
    const slugs = HELP_ARTICLES.map(({ slug }) => slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("returns undefined for unknown slugs", () => {
    expect(getHelpArticle("not-a-guide")).toBeUndefined();
  });
});

describe("resolveReturnPath", () => {
  it("keeps /rent searches", () => {
    expect(resolveReturnPath("/rent")).toBe("/rent");
    expect(resolveReturnPath("/rent?q=tamarindo&sort=price-high")).toBe(
      "/rent?q=tamarindo&sort=price-high",
    );
    expect(resolveReturnPath(["/rent?q=a", "/rent?q=b"])).toBe("/rent?q=a");
  });

  it("falls back to /rent for missing or foreign paths", () => {
    expect(resolveReturnPath(undefined)).toBe("/rent");
    expect(resolveReturnPath("")).toBe("/rent");
    expect(resolveReturnPath("https://evil.example/rent")).toBe("/rent");
    expect(resolveReturnPath("//evil.example")).toBe("/rent");
    expect(resolveReturnPath("/rental-scam")).toBe("/rent");
    expect(resolveReturnPath("/dashboard")).toBe("/rent");
  });
});
