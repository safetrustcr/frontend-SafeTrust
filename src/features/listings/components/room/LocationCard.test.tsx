import { fireEvent, render, screen } from "@testing-library/react";
import LocationCard from "./LocationCard";

describe("LocationCard", () => {
  it("disables Get Directions without a callback and says why", () => {
    render(<LocationCard />);
    const button = screen.getByRole("button", {
      name: "Get Directions (location unavailable)",
    });
    expect(button).toBeDisabled();
  });

  it("labels the enabled button as opening a new tab", () => {
    render(<LocationCard onGetDirections={jest.fn()} />);
    expect(
      screen.getByRole("button", {
        name: "Get Directions (opens in a new tab)",
      }),
    ).toBeEnabled();
  });

  it("calls the handlers", async () => {
    const onGetDirections = jest.fn();
    const onViewOnMap = jest.fn();
    render(
      <LocationCard
        onGetDirections={onGetDirections}
        onViewOnMap={onViewOnMap}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Get Directions/ }));
    expect(onGetDirections).toHaveBeenCalledTimes(1);

    for (const button of screen.getAllByRole("button", {
      name: "View on Map",
    })) {
      fireEvent.click(button);
    }
    expect(onViewOnMap).toHaveBeenCalledTimes(2);
  });

  it("reveals the overlay button on keyboard focus", () => {
    render(<LocationCard />);
    const [overlay] = screen.getAllByRole("button", { name: "View on Map" });
    expect(overlay).toHaveClass("focus-visible:opacity-100");
  });
});
