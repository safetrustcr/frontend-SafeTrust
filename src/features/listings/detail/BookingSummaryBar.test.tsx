import "@testing-library/jest-dom";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { BookingSummaryBar } from "./BookingSummaryBar";
import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";

describe("BookingSummaryBar", () => {
  const mockListing = APARTMENT_LISTINGS[0]!;

  it("handles exact dates and guests with 'Book' action", () => {
    const onBookExact = jest.fn();
    render(
      <BookingSummaryBar
        listing={mockListing}
        intent={{
          checkIn: "2026-11-01",
          checkOut: "2026-11-06",
          adults: 2,
        }}
        onBookExact={onBookExact}
      />,
    );

    const mobileBar = screen.getByTestId("booking-summary-bar");
    expect(
      within(mobileBar).getByText("Nov 1 – 6 · 2 guests"),
    ).toBeInTheDocument();
    expect(
      within(mobileBar).getByRole("button", { name: "Book" }),
    ).toBeInTheDocument();

    fireEvent.click(within(mobileBar).getByRole("button", { name: "Book" }));
    expect(onBookExact).toHaveBeenCalledWith({
      checkIn: "2026-11-01",
      checkOut: "2026-11-06",
      adults: 2,
    });
  });

  it("handles flexible dates with 'Choose dates' action and opens calendar", () => {
    render(
      <BookingSummaryBar
        listing={mockListing}
        intent={{
          isFlexible: true,
          flexibleLabel: "A week in Nov or Dec",
        }}
      />,
    );

    const mobileBar = screen.getByTestId("booking-summary-bar");
    expect(
      within(mobileBar).getByText("A week in Nov or Dec"),
    ).toBeInTheDocument();
    const chooseDatesBtn = within(mobileBar).getByRole("button", {
      name: "Choose dates",
    });
    expect(chooseDatesBtn).toBeInTheDocument();

    fireEvent.click(chooseDatesBtn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("handles missing dates with 'Add dates for availability' and opens calendar", () => {
    render(<BookingSummaryBar listing={mockListing} />);

    const mobileBar = screen.getByTestId("booking-summary-bar");
    expect(
      within(mobileBar).getByText("Add dates for availability"),
    ).toBeInTheDocument();
    const chooseDatesBtn = within(mobileBar).getByRole("button", {
      name: "Choose dates",
    });
    expect(chooseDatesBtn).toBeInTheDocument();

    fireEvent.click(chooseDatesBtn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders desktop sticky card on lg+ screens", () => {
    render(
      <BookingSummaryBar
        listing={mockListing}
        intent={{
          checkIn: "2026-11-01",
          checkOut: "2026-11-06",
          adults: 1,
        }}
      />,
    );

    const desktopCard = screen.getByTestId("booking-summary-desktop-card");
    expect(desktopCard).toBeInTheDocument();
    expect(
      within(desktopCard).getByText("Nov 1 – 6 · 1 guest"),
    ).toBeInTheDocument();
  });
});
