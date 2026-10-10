import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { applyRememberMe, getRememberMe } from "../persistence";

jest.mock("firebase/auth", () => ({
  browserLocalPersistence: { type: "LOCAL" },
  browserSessionPersistence: { type: "SESSION" },
  setPersistence: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/firebase", () => ({
  auth: { currentUser: null },
}));

describe("auth persistence utilities", () => {
  const KEY = "safetrust.remember";

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("applyRememberMe", () => {
    it("calls setPersistence with browserLocalPersistence and writes '1' to localStorage when remember is true", async () => {
      await applyRememberMe(true);

      expect(setPersistence).toHaveBeenCalledWith(
        auth,
        browserLocalPersistence,
      );
      expect(localStorage.getItem(KEY)).toBe("1");
    });

    it("calls setPersistence with browserSessionPersistence and writes '0' to localStorage when remember is false", async () => {
      await applyRememberMe(false);

      expect(setPersistence).toHaveBeenCalledWith(
        auth,
        browserSessionPersistence,
      );
      expect(localStorage.getItem(KEY)).toBe("0");
    });

    it("does not throw if localStorage is unavailable", async () => {
      const setItemSpy = jest
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("QuotaExceeded / SecurityError");
        });

      await expect(applyRememberMe(true)).resolves.not.toThrow();
      expect(setPersistence).toHaveBeenCalledWith(
        auth,
        browserLocalPersistence,
      );

      setItemSpy.mockRestore();
    });
  });

  describe("getRememberMe", () => {
    it("returns true by default when localStorage is empty", () => {
      expect(getRememberMe()).toBe(true);
    });

    it("returns true when localStorage has '1'", () => {
      localStorage.setItem(KEY, "1");
      expect(getRememberMe()).toBe(true);
    });

    it("returns false when localStorage has '0'", () => {
      localStorage.setItem(KEY, "0");
      expect(getRememberMe()).toBe(false);
    });

    it("returns true when localStorage throws an error", () => {
      const getItemSpy = jest
        .spyOn(Storage.prototype, "getItem")
        .mockImplementation(() => {
          throw new Error("Storage unavailable");
        });

      expect(getRememberMe()).toBe(true);

      getItemSpy.mockRestore();
    });
  });
});
