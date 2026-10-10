import Cookies from "js-cookie";
import {
  setSessionCookie,
  clearSessionCookie,
  getSessionCookie,
  initSessionListener,
  SESSION_COOKIE_NAME,
} from "./session";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { onIdTokenChanged, type Auth, type User } from "firebase/auth";
import { getRememberMe } from "./persistence";

jest.mock("@/lib/firebase", () => ({
  auth: { name: "mock-auth" },
}));

jest.mock("./persistence", () => ({
  getRememberMe: jest.fn(() => true),
}));

jest.mock("firebase/auth", () => ({
  onIdTokenChanged: jest.fn(),
}));

jest.mock("js-cookie", () => ({
  set: jest.fn(),
  remove: jest.fn(),
  get: jest.fn(),
}));

describe("session helper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useGlobalAuthenticationStore.getState().clearAuth();
    (getRememberMe as jest.Mock).mockReturnValue(true);
  });

  it("sets session cookie and updates Zustand token store when remember is true", () => {
    setSessionCookie("test-id-token-123");

    expect(Cookies.set).toHaveBeenCalledWith(
      SESSION_COOKIE_NAME,
      "test-id-token-123",
      expect.objectContaining({
        expires: 1 / 24,
        sameSite: "lax",
        path: "/",
      }),
    );
    expect(useGlobalAuthenticationStore.getState().token).toBe(
      "test-id-token-123",
    );
  });

  it("omits expires when remember is false, creating a browser session cookie", () => {
    (getRememberMe as jest.Mock).mockReturnValue(false);

    setSessionCookie("test-id-token-123");

    expect(Cookies.set).toHaveBeenCalledWith(
      SESSION_COOKIE_NAME,
      "test-id-token-123",
      {
        secure: false,
        sameSite: "lax",
        path: "/",
      },
    );
    expect(useGlobalAuthenticationStore.getState().token).toBe(
      "test-id-token-123",
    );
  });

  it("clears session cookie and resets Zustand auth store", () => {
    useGlobalAuthenticationStore.getState().setToken("existing-token");
    expect(useGlobalAuthenticationStore.getState().token).toBe(
      "existing-token",
    );

    clearSessionCookie();

    expect(Cookies.remove).toHaveBeenCalledWith(SESSION_COOKIE_NAME, {
      path: "/",
    });
    expect(useGlobalAuthenticationStore.getState().token).toBe("");
  });

  it("retrieves session cookie", () => {
    (Cookies.get as jest.Mock).mockReturnValue("cookie-token-val");

    const token = getSessionCookie();
    expect(Cookies.get).toHaveBeenCalledWith(SESSION_COOKIE_NAME);
    expect(token).toBe("cookie-token-val");
  });

  describe("initSessionListener", () => {
    it("subscribes onIdTokenChanged and updates session when token is refreshed", async () => {
      let listenerCallback: (
        user: User | null,
      ) => Promise<void> = async () => {};
      const mockUnsubscribe = jest.fn();

      (onIdTokenChanged as jest.Mock).mockImplementation((_auth, callback) => {
        listenerCallback = callback;
        return mockUnsubscribe;
      });

      const mockAuth = { name: "custom-auth" } as unknown as Auth;
      const unsubscribe = initSessionListener(mockAuth);

      expect(onIdTokenChanged).toHaveBeenCalledWith(
        mockAuth,
        expect.any(Function),
      );

      // Simulate refreshed user token
      const mockUser = {
        getIdToken: jest.fn().mockResolvedValue("refreshed-id-token-999"),
      } as unknown as User;

      await listenerCallback(mockUser);

      expect(mockUser.getIdToken).toHaveBeenCalledTimes(1);
      expect(Cookies.set).toHaveBeenCalledWith(
        SESSION_COOKIE_NAME,
        "refreshed-id-token-999",
        expect.any(Object),
      );
      expect(useGlobalAuthenticationStore.getState().token).toBe(
        "refreshed-id-token-999",
      );

      // Simulate user sign-out
      await listenerCallback(null);
      expect(Cookies.remove).toHaveBeenCalledWith(SESSION_COOKIE_NAME, {
        path: "/",
      });
      expect(useGlobalAuthenticationStore.getState().token).toBe("");

      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});
