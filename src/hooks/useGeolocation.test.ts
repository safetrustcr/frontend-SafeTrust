import { act, renderHook, waitFor } from "@testing-library/react";
import { useGeolocation } from "./useGeolocation";

describe("useGeolocation", () => {
  let onSuccess: PositionCallback | undefined;
  let onError: PositionErrorCallback | undefined;

  beforeEach(() => {
    onSuccess = undefined;
    onError = undefined;
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(navigator, "permissions", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: jest.fn(
          (success: PositionCallback, error: PositionErrorCallback) => {
            onSuccess = success;
            onError = error;
          },
        ),
      },
    });
  });

  it("requests a rounded position only when request is called", async () => {
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.status).toBe("idle");
    expect(navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled();

    act(() => result.current.request());
    expect(result.current.status).toBe("prompting");

    act(() =>
      onSuccess?.({
        coords: { latitude: 9.9281, longitude: -84.0907 },
      } as GeolocationPosition),
    );

    await waitFor(() => expect(result.current.status).toBe("granted"));
    expect(result.current.position).toEqual({ lat: 9.93, lng: -84.09 });
  });

  it("sets denied when the user rejects the permission prompt", async () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.request());
    act(() =>
      onError?.({ code: 1, PERMISSION_DENIED: 1 } as GeolocationPositionError),
    );

    await waitFor(() => expect(result.current.status).toBe("denied"));
    expect(result.current.position).toBeNull();
  });

  it("sets error when the location request times out", async () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.request());
    act(() =>
      onError?.({ code: 3, PERMISSION_DENIED: 1 } as GeolocationPositionError),
    );

    await waitFor(() => expect(result.current.status).toBe("error"));
  });

  it("clears the position without requesting location again", async () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.request());
    act(() =>
      onSuccess?.({
        coords: { latitude: 9.9281, longitude: -84.0907 },
      } as GeolocationPosition),
    );
    await waitFor(() => expect(result.current.status).toBe("granted"));

    act(() => result.current.clear());

    expect(result.current.status).toBe("idle");
    expect(result.current.position).toBeNull();
    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
  });
});
