import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "./useMediaQuery";

describe("useMediaQuery", () => {
  let listeners: ((event: MediaQueryListEvent) => void)[] = [];
  let matches = false;

  beforeEach(() => {
    listeners = [];
    matches = false;
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(
        (type: string, listener: (event: MediaQueryListEvent) => void) => {
          if (type === "change") listeners.push(listener);
        },
      ),
      removeEventListener: jest.fn(
        (type: string, listener: (event: MediaQueryListEvent) => void) => {
          if (type === "change") {
            listeners = listeners.filter((l) => l !== listener);
          }
        },
      ),
      dispatchEvent: jest.fn(),
    }));
  });

  it("returns initial match value", () => {
    matches = true;
    const { result } = renderHook(() => useMediaQuery("(min-width: 1280px)"));
    expect(result.current).toBe(true);
  });

  it("updates when media query matches change", () => {
    matches = false;
    const { result } = renderHook(() => useMediaQuery("(min-width: 1280px)"));
    expect(result.current).toBe(false);

    act(() => {
      matches = true;
      listeners.forEach((l) =>
        l({
          matches: true,
          media: "(min-width: 1280px)",
        } as MediaQueryListEvent),
      );
    });

    expect(result.current).toBe(true);
  });

  it("unregisters listener on unmount", () => {
    const { unmount } = renderHook(() => useMediaQuery("(min-width: 1280px)"));
    expect(listeners.length).toBe(1);
    unmount();
    expect(listeners.length).toBe(0);
  });
});
