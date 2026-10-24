import { act, renderHook } from "@testing-library/react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useWishlist, useWishlistStore } from "./useWishlist";
import { savedStays, stayCount } from "./saved-stays";
import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";

jest.mock("@/hooks/useCurrentUser", () => ({ useCurrentUser: jest.fn() }));

const signIn = (uid: string | null) =>
  (useCurrentUser as jest.Mock).mockReturnValue({
    user: uid ? { uid } : null,
    loading: false,
  });

describe("useWishlist", () => {
  beforeEach(() => useWishlistStore.setState({ byUser: {} }));

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

  it("keeps each user's saves separate", () => {
    signIn("u-1");
    const first = renderHook(() => useWishlist());
    act(() => {
      first.result.current.toggle("3");
    });

    signIn("u-2");
    const second = renderHook(() => useWishlist());
    expect(second.result.current.ids).toEqual([]);
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
