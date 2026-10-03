import Cookies from "js-cookie";
import { getRememberMe } from "../persistence";
import {
  setSessionCookie,
  clearSessionCookie,
  getSessionCookie,
  SESSION_COOKIE,
} from "../session";

jest.mock("js-cookie", () => ({
  set: jest.fn(),
  get: jest.fn(),
  remove: jest.fn(),
}));

jest.mock("@/lib/firebase", () => ({
  auth: { name: "mock-auth" },
}));

jest.mock("firebase/auth", () => ({
  onIdTokenChanged: jest.fn(),
}));

jest.mock("../persistence", () => ({
  getRememberMe: jest.fn(),
}));

describe("session cookie utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("setSessionCookie", () => {
    it("sets cookie with 1-hour expiration (expires: 1/24) when remember is true", () => {
      (getRememberMe as jest.Mock).mockReturnValue(true);

      setSessionCookie("sample-token-123");

      expect(Cookies.set).toHaveBeenCalledTimes(1);
      const [cookieName, token, options] = (Cookies.set as jest.Mock).mock
        .calls[0];

      expect(cookieName).toBe(SESSION_COOKIE);
      expect(token).toBe("sample-token-123");
      expect(options).toEqual(
        expect.objectContaining({
          expires: 1 / 24,
          sameSite: "lax",
          path: "/",
        }),
      );
    });

    it("omits expires when remember is false, creating a browser session cookie", () => {
      (getRememberMe as jest.Mock).mockReturnValue(false);

      setSessionCookie("sample-token-123");

      expect(Cookies.set).toHaveBeenCalledTimes(1);
      const [cookieName, token, options] = (Cookies.set as jest.Mock).mock
        .calls[0];

      expect(cookieName).toBe(SESSION_COOKIE);
      expect(token).toBe("sample-token-123");
      expect(options).toEqual({
        secure: false, // NODE_ENV !== "production" in test environment
        sameSite: "lax",
        path: "/",
      });
      expect(options).not.toHaveProperty("expires");
    });
  });

  describe("clearSessionCookie", () => {
    it("removes session cookie with path '/'", () => {
      clearSessionCookie();

      expect(Cookies.remove).toHaveBeenCalledWith(SESSION_COOKIE, {
        path: "/",
      });
    });
  });

  describe("getSessionCookie", () => {
    it("retrieves the session cookie value", () => {
      (Cookies.get as jest.Mock).mockReturnValue("sample-token-123");

      const token = getSessionCookie();

      expect(Cookies.get).toHaveBeenCalledWith(SESSION_COOKIE);
      expect(token).toBe("sample-token-123");
    });
  });
});
