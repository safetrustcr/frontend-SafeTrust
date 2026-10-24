import { useRef, useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ListingMapDialog } from "./ListingMapDialog";

jest.mock("@/components/hotels/payment/Map", () => ({
  __esModule: true,
  default: ({
    coordinates,
    hotelName,
  }: {
    coordinates: [number, number];
    hotelName: string;
  }) => (
    <div data-testid="map">
      {hotelName} {coordinates.join(",")}
    </div>
  ),
}));

function Harness({
  coordinates,
  explicit = false,
}: {
  coordinates?: { lat: number; lng: number } | null;
  explicit?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => {
          if (explicit) triggerRef.current?.blur();
          setOpen(true);
        }}
      >
        View on Map
      </button>
      <ListingMapDialog
        open={open}
        onOpenChange={setOpen}
        name="Casa Test"
        address="1 Test Street"
        coordinates={coordinates}
        returnFocusRef={explicit ? triggerRef : undefined}
      />
    </>
  );
}

describe("ListingMapDialog", () => {
  it("opens a labelled dialog with the map and returns focus on Escape", async () => {
    render(<Harness coordinates={{ lat: 9.93, lng: -84.06 }} />);
    const trigger = screen.getByRole("button", { name: "View on Map" });

    trigger.focus();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Casa Test" });
    expect(dialog).toHaveAccessibleDescription("1 Test Street");
    expect(await screen.findByTestId("map")).toHaveTextContent(
      "Casa Test 9.93,-84.06",
    );

    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("returns focus to the trigger even when it was not focused on open", async () => {
    render(<Harness coordinates={{ lat: 9.93, lng: -84.06 }} explicit />);
    const trigger = screen.getByRole("button", { name: "View on Map" });

    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog");
    expect(trigger).not.toHaveFocus();

    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("shows fallback text for invalid coordinates", async () => {
    render(<Harness coordinates={{ lat: 120, lng: 0 }} />);
    fireEvent.click(screen.getByRole("button", { name: "View on Map" }));

    expect(
      await screen.findByText(/exact location isn.t available/i),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("map")).not.toBeInTheDocument();
  });
});
