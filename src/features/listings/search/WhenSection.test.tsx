import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { WhenSection } from "./WhenSection";
import type { DateSearch } from "./stay-search";

describe("WhenSection Component", () => {
  const today = "2026-11-01";
  const defaultDates: DateSearch = { mode: "any" };

  it("renders with default state showing 'Any dates' and demo availability note", () => {
    const handleChange = jest.fn();
    render(
      <WhenSection
        dates={defaultDates}
        today={today}
        onChange={handleChange}
      />,
    );

    expect(screen.getByText("When")).toBeInTheDocument();
    expect(screen.getByTestId("when-summary")).toHaveTextContent("Any dates");
    expect(screen.getByTestId("demo-availability-note")).toHaveTextContent(
      "Demo availability: confirm dates with the host before booking.",
    );
  });

  it("displays exact dates summary when exact mode is active", () => {
    const exactDates: DateSearch = {
      mode: "exact",
      checkIn: "2026-11-01",
      checkOut: "2026-11-06",
      tolerance: 0,
    };
    render(
      <WhenSection dates={exactDates} today={today} onChange={jest.fn()} />,
    );

    expect(screen.getByTestId("when-summary")).toHaveTextContent("Nov 1 – 6");
    expect(screen.getByTestId("clear-dates-button")).toBeInTheDocument();
  });

  it("clears dates and returns to 'Any dates' when Clear dates is clicked", () => {
    const exactDates: DateSearch = {
      mode: "exact",
      checkIn: "2026-11-01",
      checkOut: "2026-11-06",
      tolerance: 0,
    };
    const handleChange = jest.fn();
    const handleClear = jest.fn();

    render(
      <WhenSection
        dates={exactDates}
        today={today}
        onChange={handleChange}
        onClear={handleClear}
      />,
    );

    const clearButton = screen.getByTestId("clear-dates-button");
    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith({ mode: "any" });
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it("does not display any price, cancellation policy, or availability guarantee", () => {
    const exactDates: DateSearch = {
      mode: "exact",
      checkIn: "2026-11-01",
      checkOut: "2026-11-06",
      tolerance: 0,
    };
    render(
      <WhenSection dates={exactDates} today={today} onChange={jest.fn()} />,
    );

    expect(screen.queryByText(/total/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/nightly/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/cancellation/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/guaranteed/i)).not.toBeInTheDocument();
  });
});
