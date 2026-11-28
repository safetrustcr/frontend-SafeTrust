import { act, renderHook, waitFor } from "@testing-library/react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSaveStay } from "./useSaveStay";
import {
  migrateWishlistStorage,
  useWishlist,
  useWishlistStore,
  WISHLIST_STORAGE_KEY,
  WISHLIST_STORAGE_VERSION,
} from "./useWishlist";
import { savedStays, stayCount } from "./saved-stays";
import { APARTMENT_LISTINGS } from "../data/demo-listings";

jest.mock("@/hooks/useCurrentUser", () => ({ useCurrentUser: jest.fn() }));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/rent",
}));

const signIn = (uid: string | null) =>
  (useCurrentUser as jest.Mock).mockReturnValue({
    user: uid ? { uid } : null,
    loading: false,
  });

const storedWishlist = () => {
  const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
};

describe("useWishlist", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useWishlistStore.setState({ byUser: {} });
  });

  it("toggles a listing on and off", () => {
    signIn("u-1");
    const { result } = renderHook(() => useWishlist());

    act(() => {
      expect(result.current.toggle("2")).toBe(true);
    });
    expect(result.current.isSaved("2")).toBe(true);

    act(() => {
      expect(result.current.toggle("2")).toBe(false);
    });
    expect(result.current.ids).toEqual([]);
  });

  it("keeps each user's saves separate", async () => {
    signIn("u-1");
    const first = renderHook(() => useWishlist());
    act(() => {
      first.result.current.toggle("3");
    });

    signIn("u-2");
    const second = renderHook(() => useWishlist());
    expect(second.result.current.ids).toEqual([]);
    expect(second.result.current.isSaved("3")).toBe(false);

    await act(async () => {
      await useWishlistStore.persist.rehydrate();
    });
    expect(second.result.current.ids).toEqual([]);
    expect(second.result.current.isSaved("3")).toBe(false);
  });

  it("never saves while signed out", () => {
    signIn(null);
    const { result } = renderHook(() => useWishlist());

    act(() => {
      expect(result.current.toggle("2")).toBe(false);
    });
    expect(result.current.signedIn).toBe(false);
    expect(useWishlistStore.getState().byUser).toEqual({});
  });

  it("persists saves to localStorage with a version", () => {
    signIn("u-1");
    const { result } = renderHook(() => useWishlist());

    act(() => {
      result.current.toggle("2");
    });

    expect(storedWishlist()).toEqual({
      state: { byUser: { "u-1": ["2"] } },
      version: WISHLIST_STORAGE_VERSION,
    });
  });

  it("moves session saves to localStorage once", () => {
    const legacy = JSON.stringify({
      state: { byUser: { "u-1": ["2"] } },
      version: 0,
    });
    localStorage.clear();
    sessionStorage.setItem(WISHLIST_STORAGE_KEY, legacy);

    migrateWishlistStorage();

    expect(localStorage.getItem(WISHLIST_STORAGE_KEY)).toBe(legacy);
    expect(sessionStorage.getItem(WISHLIST_STORAGE_KEY)).toBeNull();

    const current = JSON.stringify({
      state: { byUser: { "u-2": ["3"] } },
      version: WISHLIST_STORAGE_VERSION,
    });
    localStorage.setItem(WISHLIST_STORAGE_KEY, current);
    sessionStorage.setItem(WISHLIST_STORAGE_KEY, legacy);

    migrateWishlistStorage();

    expect(localStorage.getItem(WISHLIST_STORAGE_KEY)).toBe(current);
    expect(sessionStorage.getItem(WISHLIST_STORAGE_KEY)).toBeNull();
  });

  it("rehydrates when another tab updates the wishlist", async () => {
    signIn("u-1");
    const { result } = renderHook(() => useWishlist());
    expect(result.current.hydrated).toBe(true);

    const next = JSON.stringify({
      state: { byUser: { "u-1": ["4"] } },
      version: WISHLIST_STORAGE_VERSION,
    });

    act(() => {
      localStorage.setItem(WISHLIST_STORAGE_KEY, next);
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: WISHLIST_STORAGE_KEY,
          newValue: next,
          storageArea: window.localStorage,
        }),
      );
    });

    await waitFor(() => expect(result.current.ids).toEqual(["4"]));
  });

  it("ignores unrelated keys and rehydrates when storage is cleared", async () => {
    signIn("u-1");
    const { result } = renderHook(() => useWishlist());
    act(() => {
      result.current.toggle("2");
    });
    expect(result.current.ids).toEqual(["2"]);

    const rehydrate = jest.spyOn(useWishlistStore.persist, "rehydrate");

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "unrelated-key",
          storageArea: window.localStorage,
        }),
      );
    });
    expect(rehydrate).not.toHaveBeenCalled();

    act(() => {
      localStorage.clear();
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: null,
          storageArea: window.localStorage,
        }),
      );
    });
    expect(rehydrate).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.ids).toEqual([]));

    rehydrate.mockRestore();
  });

  it("preserves saves from another tab when toggling", async () => {
    signIn("u-1");
    // Tab A saved "2" directly in storage
    localStorage.setItem(
      WISHLIST_STORAGE_KEY,
      JSON.stringify({
        state: { byUser: { "u-1": ["2"] } },
        version: WISHLIST_STORAGE_VERSION,
      }),
    );

    // Tab B (current tab) has empty in-memory state before processing event
    const { result } = renderHook(() => useWishlist());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    // Tab B saves "4"
    act(() => {
      result.current.toggle("4");
    });

    // Both "2" and "4" should be saved
    expect(result.current.ids).toEqual(["2", "4"]);
    expect(storedWishlist()).toEqual({
      state: { byUser: { "u-1": ["2", "4"] } },
      version: WISHLIST_STORAGE_VERSION,
    });
  });

  it("does not overwrite newer in-memory saves with an older storage document", async () => {
    signIn("u-1");
    const { result } = renderHook(() => useWishlist());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.toggle("4");
    });
    expect(result.current.ids).toEqual(["4"]);

    // Stale storage event from another tab arrives that only has "2"
    const staleDoc = JSON.stringify({
      state: { byUser: { "u-1": ["2"] } },
      version: WISHLIST_STORAGE_VERSION,
    });

    act(() => {
      localStorage.setItem(WISHLIST_STORAGE_KEY, staleDoc);
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: WISHLIST_STORAGE_KEY,
          newValue: staleDoc,
          storageArea: window.localStorage,
        }),
      );
    });

    // "4" should still be preserved alongside "2"
    await waitFor(() => expect(result.current.ids).toEqual(["2", "4"]));
  });

  it("reconciles ordered remote removals across tabs without restoring deleted saves", async () => {
    signIn("u-1");
    const { result } = renderHook(() => useWishlist());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    // Tab A saves "2"
    act(() => {
      expect(result.current.toggle("2")).toBe(true);
    });
    expect(result.current.ids).toEqual(["2"]);

    // Tab B (an independent store instance) removes "2"
    await jest.isolateModulesAsync(async () => {
      const tabB = await import("./useWishlist");
      tabB.useWishlistStore.getState().toggle("u-1", "2");
    });

    const nextDoc = localStorage.getItem(WISHLIST_STORAGE_KEY);
    expect(storedWishlist()).toEqual({
      state: { byUser: { "u-1": [] } },
      version: WISHLIST_STORAGE_VERSION,
    });

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: WISHLIST_STORAGE_KEY,
          newValue: nextDoc,
          storageArea: window.localStorage,
        }),
      );
    });

    await waitFor(() => expect(result.current.ids).toEqual([]));
    expect(storedWishlist()).toEqual({
      state: { byUser: { "u-1": [] } },
      version: WISHLIST_STORAGE_VERSION,
    });
  });

  it("does not restore a remotely removed save when toggling before handling the storage event", async () => {
    signIn("u-1");
    localStorage.setItem(
      WISHLIST_STORAGE_KEY,
      JSON.stringify({
        state: { byUser: { "u-1": ["2"] } },
        version: WISHLIST_STORAGE_VERSION,
      }),
    );

    const { result } = renderHook(() => useWishlist());
    await waitFor(() => expect(result.current.ids).toEqual(["2"]));

    // Tab B removes "2" before Tab A processes any storage event
    await jest.isolateModulesAsync(async () => {
      const tabB = await import("./useWishlist");
      tabB.useWishlistStore.getState().toggle("u-1", "2");
    });

    // Tab A toggles "4" before receiving the storage event
    act(() => {
      expect(result.current.toggle("4")).toBe(true);
    });

    expect(result.current.ids).toEqual(["4"]);
    expect(storedWishlist()).toEqual({
      state: { byUser: { "u-1": ["4"] } },
      version: WISHLIST_STORAGE_VERSION,
    });
  });

  it("rejects malformed user lists at read boundaries while preserving valid ones", async () => {
    localStorage.setItem(
      WISHLIST_STORAGE_KEY,
      JSON.stringify({
        state: {
          byUser: {
            "u-1": {},
            "u-2": ["3"],
            "u-3": ["1", 123],
          },
        },
        version: WISHLIST_STORAGE_VERSION,
      }),
    );

    signIn("u-1");
    const { result } = renderHook(() => useWishlist());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    expect(result.current.ids).toEqual([]);
    expect(result.current.isSaved("1")).toBe(false);

    act(() => {
      expect(result.current.toggle("2")).toBe(true);
    });
    expect(result.current.ids).toEqual(["2"]);
    expect(storedWishlist()).toEqual({
      state: { byUser: { "u-1": ["2"], "u-2": ["3"] } },
      version: WISHLIST_STORAGE_VERSION,
    });
  });

  it("rolls back state and announces failure when localStorage.setItem throws", async () => {
    signIn("u-1");
    const { result } = renderHook(() => useSaveStay());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    const storedBefore = localStorage.getItem(WISHLIST_STORAGE_KEY);
    const setItemSpy = jest
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

    try {
      act(() => {
        result.current.toggleSaved("2");
      });

      expect(result.current.isSaved("2")).toBe(false);
      expect(useWishlistStore.getState().byUser).toEqual({});
      expect(localStorage.getItem(WISHLIST_STORAGE_KEY)).toBe(storedBefore);
      expect(result.current.announcement).toBe(
        "Could not update Wishlists. Please check browser storage.",
      );
    } finally {
      setItemSpy.mockRestore();
    }
  });

  it("completes readiness and allows saving when storage is corrupted or fails", async () => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, "corrupt-json{{{");
    signIn("u-1");
    const { result } = renderHook(() => useWishlist());

    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.loading).toBe(false);

    act(() => {
      expect(result.current.toggle("2")).toBe(true);
    });
    expect(result.current.ids).toEqual(["2"]);
  });

  it("re-reads storage when the first consumer attaches", async () => {
    signIn("u-1");
    // While unmounted, another tab writes to localStorage
    localStorage.setItem(
      WISHLIST_STORAGE_KEY,
      JSON.stringify({
        state: { byUser: { "u-1": ["5"] } },
        version: WISHLIST_STORAGE_VERSION,
      }),
    );

    const { result } = renderHook(() => useWishlist());
    await waitFor(() => expect(result.current.ids).toEqual(["5"]));
  });
});

describe("savedStays", () => {
  it("maps ids to listings and skips deleted ones", () => {
    expect(
      savedStays(["2", "deleted", "1"], APARTMENT_LISTINGS).map((l) => l.id),
    ).toEqual(["2", "1"]);
    expect(stayCount(1)).toBe("1 stay");
    expect(stayCount(3)).toBe("3 stays");
  });
});
