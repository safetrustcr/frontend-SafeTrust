import "@testing-library/jest-dom";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { NearMeButton } from "@/components/listings/NearMeButton";
import {
  GeolocationProvider,
  useSharedGeolocation,
} from "./GeolocationProvider";
import { resetLocation } from "@/features/location";

/** NearMeButton as the rent page wires it: fed from the shared provider. */
function SharedNearMeButton() {
  const geo = useSharedGeolocation();
  return geo ? <NearMeButton geo={geo} /> : null;
}

function SharedGeoStatus() {
  const geo = useSharedGeolocation();

  return (
    <div>
      <output>{geo?.status ?? "outside"}</output>
      <button type="button" onClick={() => geo?.request()}>
        Request from another consumer
      </button>
    </div>
  );
}

describe("GeolocationProvider", () => {
  let onSuccess: PositionCallback | undefined;
  const getCurrentPosition = jest.fn(
    (success: PositionCallback, _error: PositionErrorCallback) => {
      onSuccess = success;
    },
  );

  beforeEach(() => {
    act(() => resetLocation());
    onSuccess = undefined;
    getCurrentPosition.mockClear();
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
      value: { getCurrentPosition },
    });
  });

  it("shares one opt-in location request between consumers", async () => {
    render(
      <GeolocationProvider>
        <SharedNearMeButton />
        <SharedGeoStatus />
      </GeolocationProvider>,
    );

    expect(screen.getByText("idle")).toBeInTheDocument();
    expect(getCurrentPosition).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Use my location" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Request from another consumer" }),
    );

    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(screen.getByText("prompting")).toBeInTheDocument();

    act(() =>
      onSuccess?.({
        coords: { latitude: 9.9281, longitude: -84.0907 },
      } as GeolocationPosition),
    );

    await waitFor(() =>
      expect(screen.getByText("granted")).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: "Clear location" }),
    ).toBeInTheDocument();
  });

  it("returns null to consumers outside the provider", () => {
    render(<SharedGeoStatus />);
    expect(screen.getByText("outside")).toBeInTheDocument();
  });

  it("keeps the granted position when the page provider remounts", async () => {
    const firstPage = render(
      <GeolocationProvider>
        <SharedNearMeButton />
        <SharedGeoStatus />
      </GeolocationProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Use my location" }));
    act(() =>
      onSuccess?.({
        coords: { latitude: 9.9281, longitude: -84.0907 },
      } as GeolocationPosition),
    );
    await waitFor(() =>
      expect(screen.getByText("granted")).toBeInTheDocument(),
    );
    firstPage.unmount();

    render(
      <GeolocationProvider>
        <SharedNearMeButton />
        <SharedGeoStatus />
      </GeolocationProvider>,
    );

    expect(screen.getByText("granted")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Clear location" }),
    ).toBeInTheDocument();
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });
});
