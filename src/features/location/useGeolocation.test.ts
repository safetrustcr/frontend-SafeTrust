import { act, renderHook, waitFor } from "@testing-library/react";
import { useGeolocation } from "./useGeolocation";
import { resetLocation, useLocationStore } from "./location-store";

const PERMISSION_DENIED = 1;
const POSITION_UNAVAILABLE = 2;
const TIMEOUT = 3;

/** A PermissionStatus whose state the test can change, firing `change`. */
class FakePermissionStatus extends EventTarget {
  name = "geolocation";
  onchange = null;
  constructor(public state: PermissionState) {
    super();
  }
  set(state: PermissionState) {
    this.state = state;
    this.dispatchEvent(new Event("change"));
  }
}

type Pending = { success: PositionCallback; error: PositionErrorCallback };

const positionAt = (latitude: number, longitude: number) =>
  ({ coords: { latitude, longitude } }) as GeolocationPosition;

const geoError = (code: number) =>
  ({
    code,
    PERMISSION_DENIED,
    POSITION_UNAVAILABLE,
    TIMEOUT,
  }) as GeolocationPositionError;

describe("useGeolocation", () => {
  let pending: Pending[];
  let getCurrentPosition: jest.Mock;
  const originals = {
    secure: Object.getOwnPropertyDescriptor(window, "isSecureContext"),
    permissions: Object.getOwnPropertyDescriptor(navigator, "permissions"),
    geolocation: Object.getOwnPropertyDescriptor(navigator, "geolocation"),
  };

  const setGlobal = (target: object, key: string, value: unknown) =>
    Object.defineProperty(target, key, { configurable: true, value });

  const usePermissions = (
    query: () => Promise<PermissionStatus | FakePermissionStatus>,
  ) => setGlobal(navigator, "permissions", { query: jest.fn(query) });

  const last = () => pending[pending.length - 1];

  beforeEach(() => {
    pending = [];
    getCurrentPosition = jest.fn(
      (success: PositionCallback, error: PositionErrorCallback) => {
        pending.push({ success, error });
      },
    );
    setGlobal(window, "isSecureContext", true);
    setGlobal(navigator, "permissions", undefined);
    setGlobal(navigator, "geolocation", { getCurrentPosition });
    act(() => resetLocation());
  });

  afterEach(() => {
    for (const [target, key, descriptor] of [
      [window, "isSecureContext", originals.secure],
      [navigator, "permissions", originals.permissions],
      [navigator, "geolocation", originals.geolocation],
    ] as const) {
      if (descriptor) Object.defineProperty(target, key, descriptor);
      else delete (target as unknown as Record<string, unknown>)[key];
    }
  });

  it("requests only on demand and stores a position rounded to two decimals", async () => {
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.status).toBe("idle");
    expect(getCurrentPosition).not.toHaveBeenCalled();

    act(() => result.current.request());
    expect(result.current.status).toBe("prompting");
    expect(getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 10 * 60_000 },
    );

    act(() => last().success(positionAt(9.9281, -84.0907)));

    await waitFor(() => expect(result.current.status).toBe("granted"));
    expect(result.current.position).toEqual({ lat: 9.93, lng: -84.09 });
  });

  it("asks listings to sort by distance unless the request opts out", () => {
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.autoSortOnPosition).toBe(false);

    act(() => result.current.request());
    expect(result.current.autoSortOnPosition).toBe(true);

    act(() => result.current.clear());
    expect(result.current.autoSortOnPosition).toBe(false);

    act(() => result.current.request({ autoSort: false }));
    expect(result.current.autoSortOnPosition).toBe(false);
  });

  it("does not start a second request while one is pending", () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.request());
    act(() => result.current.request());

    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it("sets denied when the user rejects the permission prompt", async () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.request());
    act(() => last().error(geoError(PERMISSION_DENIED)));

    await waitFor(() => expect(result.current.status).toBe("denied"));
    expect(result.current.position).toBeNull();
  });

  it("becomes retryable when the permission changes from denied to prompt or granted", async () => {
    const permission = new FakePermissionStatus("denied");
    usePermissions(() => Promise.resolve(permission));
    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => expect(result.current.status).toBe("denied"));

    act(() => permission.set("prompt"));
    expect(result.current.status).toBe("idle");

    act(() => permission.set("denied"));
    expect(result.current.status).toBe("denied");
    act(() => permission.set("granted"));
    expect(result.current.status).toBe("idle");

    act(() => result.current.request());
    act(() => last().success(positionAt(9.93, -84.09)));
    expect(result.current.status).toBe("granted");
  });

  it("drops a granted position when the permission is revoked", async () => {
    const permission = new FakePermissionStatus("granted");
    usePermissions(() => Promise.resolve(permission));
    const { result } = renderHook(() => useGeolocation());
    await waitFor(() => expect(navigator.permissions.query).toHaveBeenCalled());

    act(() => result.current.request());
    act(() => last().success(positionAt(9.93, -84.09)));
    expect(result.current.position).not.toBeNull();

    act(() => permission.set("denied"));

    expect(result.current.status).toBe("denied");
    expect(result.current.position).toBeNull();
  });

  it("ignores a late success after Clear location", () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.request());
    const late = last();
    act(() => result.current.clear());
    act(() => late.success(positionAt(9.93, -84.09)));

    expect(result.current.status).toBe("idle");
    expect(result.current.position).toBeNull();
  });

  it("never lets an older request overwrite a newer result", () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.request());
    const older = last();
    act(() => result.current.clear());
    act(() => result.current.request());
    const newer = last();

    act(() => newer.success(positionAt(10.01, -84.21)));
    act(() => older.success(positionAt(9.93, -84.09)));
    act(() => older.error(geoError(POSITION_UNAVAILABLE)));

    expect(result.current.status).toBe("granted");
    expect(result.current.position).toEqual({ lat: 10.01, lng: -84.21 });
  });

  it("distinguishes a timeout from other failures", () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.request());
    act(() => last().error(geoError(TIMEOUT)));
    expect(result.current.status).toBe("timeout");

    act(() => result.current.request());
    act(() => last().error(geoError(POSITION_UNAVAILABLE)));
    expect(result.current.status).toBe("error");
  });

  it.each([
    [
      "geolocation is missing",
      () => delete (navigator as { geolocation?: unknown }).geolocation,
    ],
    [
      "the page is not a secure context",
      () => setGlobal(window, "isSecureContext", false),
    ],
  ])("is unavailable when %s", async (_, setup) => {
    setup();
    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => expect(result.current.status).toBe("unavailable"));
    act(() => result.current.request());
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it("removes its permission listener on unmount without warnings", async () => {
    const permission = new FakePermissionStatus("prompt");
    const remove = jest.spyOn(permission, "removeEventListener");
    usePermissions(() => Promise.resolve(permission));
    const consoleError = jest.spyOn(console, "error");
    const { result, unmount } = renderHook(() => useGeolocation());
    await waitFor(() => expect(navigator.permissions.query).toHaveBeenCalled());
    await act(async () => {});

    act(() => result.current.request());
    const lateResult = last();
    unmount();

    expect(remove).toHaveBeenCalledWith("change", expect.any(Function));
    act(() => lateResult.success(positionAt(9.93, -84.09)));
    act(() => permission.set("denied"));
    // The listener is gone: a revocation after unmount is picked up by the
    // next mount's query, not by this one.
    expect(useLocationStore.getState().status).toBe("granted");
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("does not subscribe when the permission query resolves after unmount", async () => {
    const permission = new FakePermissionStatus("prompt");
    const add = jest.spyOn(permission, "addEventListener");
    let resolve!: (status: FakePermissionStatus) => void;
    usePermissions(() => new Promise((r) => (resolve = r)));
    const { unmount } = renderHook(() => useGeolocation());
    await waitFor(() => expect(navigator.permissions.query).toHaveBeenCalled());

    unmount();
    await act(async () => resolve(permission));

    expect(add).not.toHaveBeenCalled();
  });

  it("keeps the position across unmount and remount", () => {
    const first = renderHook(() => useGeolocation());
    act(() => first.result.current.request());
    act(() => last().success(positionAt(9.93, -84.09)));
    first.unmount();

    const second = renderHook(() => useGeolocation());

    expect(second.result.current.status).toBe("granted");
    expect(second.result.current.position).toEqual({ lat: 9.93, lng: -84.09 });
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["clear", (geo: ReturnType<typeof useGeolocation>) => geo.clear()],
    ["logout reset", () => resetLocation()],
  ])(
    "%s forgets the position and invalidates pending callbacks",
    (_, reset) => {
      const { result } = renderHook(() => useGeolocation());
      act(() => result.current.request());
      act(() => last().success(positionAt(9.93, -84.09)));
      expect(result.current.status).toBe("granted");

      act(() => reset(result.current));
      expect(result.current.status).toBe("idle");
      expect(result.current.position).toBeNull();

      act(() => result.current.request());
      const pendingRequest = last();
      act(() => reset(result.current));
      act(() => pendingRequest.success(positionAt(9.93, -84.09)));

      expect(result.current.status).toBe("idle");
      expect(result.current.position).toBeNull();
    },
  );

  it.each([
    [
      "the permission query rejects",
      () => usePermissions(() => Promise.reject(new Error("nope"))),
    ],
    [
      "the permission query throws",
      () =>
        usePermissions(() => {
          throw new TypeError("unsupported name");
        }),
    ],
    [
      "the Permissions API is missing",
      () => setGlobal(navigator, "permissions", undefined),
    ],
  ])("still works when %s", async (_, setup) => {
    setup();
    const { result } = renderHook(() => useGeolocation());
    await act(async () => {});

    expect(result.current.status).toBe("idle");
    act(() => result.current.request());
    act(() => last().success(positionAt(9.93, -84.09)));
    expect(result.current.status).toBe("granted");
  });
});
