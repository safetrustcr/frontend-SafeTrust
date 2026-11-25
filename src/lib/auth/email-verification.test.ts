import { sendEmailVerification, type User } from "firebase/auth";
import {
  RESEND_COOLDOWN_MS,
  refreshVerification,
  sendVerification,
} from "./email-verification";
import { DEFAULT_POST_LOGIN_PATH } from "./redirect";

jest.mock("firebase/auth", () => ({
  sendEmailVerification: jest.fn(),
}));

const sendEmailVerificationMock = sendEmailVerification as jest.Mock;

function makeUser(overrides: Partial<Record<string, unknown>> = {}): User {
  return {
    uid: "u-1",
    email: "nueva@safetrust.test",
    emailVerified: false,
    reload: jest.fn().mockResolvedValue(undefined),
    getIdToken: jest.fn().mockResolvedValue("id-token"),
    ...overrides,
  } as unknown as User;
}

describe("email-verification helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uses a 60 second resend cooldown", () => {
    expect(RESEND_COOLDOWN_MS).toBe(60_000);
  });

  describe("sendVerification", () => {
    it("sends a link back to /verify-email with the default destination", async () => {
      const user = makeUser();

      await sendVerification(user);

      expect(sendEmailVerification).toHaveBeenCalledWith(user, {
        url: `${window.location.origin}/verify-email?redirect=${encodeURIComponent(DEFAULT_POST_LOGIN_PATH)}`,
      });
    });

    it("keeps a validated continue path in the link", async () => {
      const user = makeUser();

      await sendVerification(user, "/dashboard/hotels");

      expect(sendEmailVerification).toHaveBeenCalledWith(user, {
        url: `${window.location.origin}/verify-email?redirect=${encodeURIComponent("/dashboard/hotels")}`,
      });
    });

    it("never sends visitors to an off-site destination", async () => {
      const user = makeUser();

      await sendVerification(user, "https://evil.example/steal");

      expect(sendEmailVerification).toHaveBeenCalledWith(user, {
        url: `${window.location.origin}/verify-email?redirect=${encodeURIComponent(DEFAULT_POST_LOGIN_PATH)}`,
      });
    });

    it("propagates Firebase failures", async () => {
      const user = makeUser();
      sendEmailVerificationMock.mockRejectedValueOnce(
        new Error("network down"),
      );

      await expect(sendVerification(user)).rejects.toThrow("network down");
    });
  });

  describe("refreshVerification", () => {
    it("returns false while the address is unverified and skips the token refresh", async () => {
      const user = makeUser();

      const result = await refreshVerification(user);

      expect(result).toBe(false);
      expect(user.reload).toHaveBeenCalledTimes(1);
      expect(user.getIdToken).not.toHaveBeenCalled();
    });

    it("returns true once verified and forces a fresh ID token", async () => {
      const user = makeUser();
      (user.reload as jest.Mock).mockImplementation(async () => {
        (user as unknown as { emailVerified: boolean }).emailVerified = true;
      });

      const result = await refreshVerification(user);

      expect(result).toBe(true);
      expect(user.reload).toHaveBeenCalledTimes(1);
      expect(user.getIdToken).toHaveBeenCalledWith(true);
    });

    it("propagates reload failures", async () => {
      const user = makeUser({
        reload: jest.fn().mockRejectedValue(new Error("offline")),
      });

      await expect(refreshVerification(user)).rejects.toThrow("offline");
    });
  });
});
