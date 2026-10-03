import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import DestinationCarousel from "./DestinationCarousel";
import { STUB_HOTELS } from "@/lib/mockData/hotels";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const getCardTitles = () =>
  screen
    .queryAllByRole("heading", { level: 3 })
    .map((heading) => heading.textContent);

describe("DestinationCarousel", () => {
  it("renders the first page of destinations", () => {
    render(<DestinationCarousel destinations={STUB_HOTELS} />);

    expect(getCardTitles()).toEqual([
      "La sabana sur",
      "Los yoses",
      "Paseo Colón Loft",
      "Heredia Central",
    ]);
  });

  it("pages forward and backward through the destinations", () => {
    render(<DestinationCarousel destinations={STUB_HOTELS} />);

    const previous = screen.getByRole("button", {
      name: /previous destinations/i,
    });
    const next = screen.getByRole("button", { name: /next destinations/i });

    expect(previous).toBeDisabled();
    expect(next).toBeEnabled();

    fireEvent.click(next);

    expect(getCardTitles()).toEqual(["Alajuela Heights", "Cartago View"]);
    expect(previous).toBeEnabled();
    expect(next).toBeDisabled();

    fireEvent.click(previous);

    expect(getCardTitles()).toHaveLength(4);
    expect(previous).toBeDisabled();
  });

  it("jumps to a specific page from its indicator", () => {
    render(<DestinationCarousel destinations={STUB_HOTELS} />);

    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }));

    expect(getCardTitles()).toEqual(["Alajuela Heights", "Cartago View"]);
  });

  it("notifies the parent when a destination is selected", () => {
    const onDestinationClick = jest.fn();
    render(
      <DestinationCarousel
        destinations={STUB_HOTELS}
        onDestinationClick={onDestinationClick}
      />,
    );

    fireEvent.click(screen.getByText("La sabana sur"));

    expect(onDestinationClick).toHaveBeenCalledTimes(1);
    expect(onDestinationClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "1", name: "La sabana sur" }),
    );
  });

  it("shows an empty state when there are no destinations", () => {
    render(<DestinationCarousel destinations={[]} />);

    expect(screen.getByText(/no destinations available/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /next destinations/i }),
    ).not.toBeInTheDocument();
  });
});
