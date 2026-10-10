import { DEFAULT_POST_LOGIN_PATH, resolveRedirectPath } from "./redirect";

describe("resolveRedirectPath", () => {
  it("keeps same-origin absolute paths", () => {
    expect(resolveRedirectPath("/dashboard/escrow-dashboard")).toBe(
      "/dashboard/escrow-dashboard",
    );
    expect(resolveRedirectPath("/dashboard/hotel/booking/1/escrow")).toBe(
      "/dashboard/hotel/booking/1/escrow",
    );
    expect(resolveRedirectPath("/dashboard?tab=escrows")).toBe(
      "/dashboard?tab=escrows",
    );
  });

  it("falls back when the parameter is absent or empty", () => {
    expect(resolveRedirectPath(null)).toBe(DEFAULT_POST_LOGIN_PATH);
    expect(resolveRedirectPath(undefined)).toBe(DEFAULT_POST_LOGIN_PATH);
    expect(resolveRedirectPath("")).toBe(DEFAULT_POST_LOGIN_PATH);
  });

  it("rejects absolute URLs so `?redirect=` cannot be an open redirect", () => {
    expect(resolveRedirectPath("https://evil.example/dashboard")).toBe(
      DEFAULT_POST_LOGIN_PATH,
    );
    expect(resolveRedirectPath("http://localhost:3000/dashboard")).toBe(
      DEFAULT_POST_LOGIN_PATH,
    );
    expect(resolveRedirectPath("javascript:alert(1)")).toBe(
      DEFAULT_POST_LOGIN_PATH,
    );
  });

  it("rejects protocol-relative paths", () => {
    expect(resolveRedirectPath("//evil.example/dashboard")).toBe(
      DEFAULT_POST_LOGIN_PATH,
    );
    expect(resolveRedirectPath("/\\evil.example")).toBe(DEFAULT_POST_LOGIN_PATH);
  });

  it("rejects relative paths that are not rooted", () => {
    expect(resolveRedirectPath("dashboard")).toBe(DEFAULT_POST_LOGIN_PATH);
    expect(resolveRedirectPath("../dashboard")).toBe(DEFAULT_POST_LOGIN_PATH);
  });

  it("honours a custom fallback", () => {
    expect(resolveRedirectPath(null, "/login")).toBe("/login");
    expect(resolveRedirectPath("https://evil.example", "/login")).toBe("/login");
  });
});
