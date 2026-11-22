import { act, renderHook, waitFor } from "@testing-library/react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
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

  it("ignores unrelated keys and rehydrates when storage is cleared", () => {
    signIn("u-1");
    renderHook(() => useWishlist());
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
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: null,
          storageArea: window.localStorage,
        }),
      );
    });
    expect(rehydrate).toHaveBeenCalledTimes(1);

    rehydrate.mockRestore();
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
