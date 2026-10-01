import {
  signInWithGoogle,
  completeGoogleRedirect,
  GOOGLE_ERROR_MESSAGES,
} from "./google";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  getAdditionalUserInfo,
  type UserCredential,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { setSessionCookie } from "./session";

jest.mock("@/lib/firebase", () => ({
  auth: { name: "mock-auth" },
}));

jest.mock("./session", () => ({
  setSessionCookie: jest.fn(),
  clearSessionCookie: jest.fn(),
  getSessionCookie: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    setCustomParameters: jest.fn(),
  })),
  signInWithPopup: jest.fn(),
  signInWithRedirect: jest.fn(),
  getRedirectResult: jest.fn(),
  getAdditionalUserInfo: jest.fn(),
}));

describe("google auth helper", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  const createMockCredential = (
    options: {
      displayName?: string;
      email?: string;
      isNewUser?: boolean;
      token?: string;
    } = {},
  ): UserCredential => {
    const {
      displayName = "Tejas Chavan",
      email = "tejas@example.com",
      isNewUser = false,
      token = "mock-id-token-123",
    } = options;

    const mockUser = {
      displayName,
      email,
      getIdToken: jest.fn().mockResolvedValue(token),
    };

    (getAdditionalUserInfo as jest.Mock).mockReturnValue({
      isNewUser,
    });

    return {
      user: mockUser,
      providerId: "google.com",
      operationType: "signIn",
    } as unknown as UserCredential;
  };

  describe("signInWithGoogle", () => {
    it("successfully signs in returning user without triggering /api/auth/sync-user", async () => {
      const cred = createMockCredential({ isNewUser: false });
      (signInWithPopup as jest.Mock).mockResolvedValue(cred);

      const user = await signInWithGoogle();

      expect(signInWithPopup).toHaveBeenCalledTimes(1);
      expect(setSessionCookie).toHaveBeenCalledWith("mock-id-token-123");
      expect(global.fetch).not.toHaveBeenCalled();
      expect(user).toBe(cred.user);
    });

    it("successfully signs in new user and calls /api/auth/sync-user", async () => {
      const cred = createMockCredential({
        displayName: "Jane Marie Doe",
        isNewUser: true,
        token: "jane-token-456",
      });
      (signInWithPopup as jest.Mock).mockResolvedValue(cred);

      const user = await signInWithGoogle();

      expect(setSessionCookie).toHaveBeenCalledWith("jane-token-456");
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/sync-user",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer jane-token-456",
          },
          body: JSON.stringify({
            first_name: "Jane",
            last_name: "Marie Doe",
          }),
        }),
      );
      expect(user).toBe(cred.user);
    });

    it("handles new user with single-word displayName gracefully during sync", async () => {
      const cred = createMockCredential({
        displayName: "Alice",
        isNewUser: true,
        token: "alice-token",
      });
      (signInWithPopup as jest.Mock).mockResolvedValue(cred);

      const user = await signInWithGoogle();

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/sync-user",
        expect.objectContaining({
          body: JSON.stringify({
            first_name: "Alice",
            last_name: "",
          }),
        }),
      );
      expect(user).toBe(cred.user);
    });

    it("does not throw if /api/auth/sync-user fails (backend offline/skeleton mode)", async () => {
      const cred = createMockCredential({ isNewUser: true });
      (signInWithPopup as jest.Mock).mockResolvedValue(cred);
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error("Network offline"),
      );

      const user = await signInWithGoogle();

      expect(setSessionCookie).toHaveBeenCalledWith("mock-id-token-123");
      expect(user).toBe(cred.user);
    });

    it("falls back to signInWithRedirect when popup is blocked", async () => {
      const popupBlockedError = new FirebaseError(
        "auth/popup-blocked",
        "Popup was blocked by browser",
      );
      (signInWithPopup as jest.Mock).mockRejectedValue(popupBlockedError);
      (signInWithRedirect as jest.Mock).mockResolvedValue(undefined);

      const result = await signInWithGoogle();

      expect(signInWithRedirect).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });

    it("rethrows unhandled FirebaseError such as popup-closed-by-user", async () => {
      const popupClosedError = new FirebaseError(
        "auth/popup-closed-by-user",
        "The popup was closed",
      );
      (signInWithPopup as jest.Mock).mockRejectedValue(popupClosedError);

      await expect(signInWithGoogle()).rejects.toThrow(popupClosedError);
      expect(signInWithRedirect).not.toHaveBeenCalled();
    });
  });

  describe("completeGoogleRedirect", () => {
    it("returns null if no redirect result is pending", async () => {
      (getRedirectResult as jest.Mock).mockResolvedValue(null);

      const result = await completeGoogleRedirect();

      expect(getRedirectResult).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
      expect(setSessionCookie).not.toHaveBeenCalled();
    });

    it("completes sign in and syncs new user if redirect result exists", async () => {
      const cred = createMockCredential({
        displayName: "Redirect User",
        isNewUser: true,
        token: "redirect-token-789",
      });
      (getRedirectResult as jest.Mock).mockResolvedValue(cred);

      const user = await completeGoogleRedirect();

      expect(setSessionCookie).toHaveBeenCalledWith("redirect-token-789");
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/sync-user",
        expect.objectContaining({
          body: JSON.stringify({
            first_name: "Redirect",
            last_name: "User",
          }),
        }),
      );
      expect(user).toBe(cred.user);
    });
  });

  describe("GOOGLE_ERROR_MESSAGES", () => {
    it("maps user cancellation errors to null (no toast)", () => {
      expect(GOOGLE_ERROR_MESSAGES["auth/popup-closed-by-user"]).toBeNull();
      expect(GOOGLE_ERROR_MESSAGES["auth/cancelled-popup-request"]).toBeNull();
    });

    it("maps critical errors to user-friendly messages", () => {
      expect(
        GOOGLE_ERROR_MESSAGES["auth/account-exists-with-different-credential"],
      ).toContain("already registered with a password");
      expect(GOOGLE_ERROR_MESSAGES["auth/network-request-failed"]).toBe(
        "Network error. Check your connection and try again.",
      );
      expect(GOOGLE_ERROR_MESSAGES["auth/unauthorized-domain"]).toContain(
        "Google sign-in isn't enabled for this domain",
      );
      expect(GOOGLE_ERROR_MESSAGES["auth/operation-not-allowed"]).toContain(
        "Google sign-in is not enabled",
      );
    });
  });
});
