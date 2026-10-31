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

  it("renders segmented control with 'Dates' and 'Flexible' options in a radiogroup", () => {
    render(
      <WhenSection dates={defaultDates} today={today} onChange={jest.fn()} />,
    );

    const radiogroup = screen.getByRole("radiogroup", {
      name: /date selection mode/i,
    });
    expect(radiogroup).toBeInTheDocument();

    const datesRadio = screen.getByRole("radio", { name: "Dates" });
    const flexibleRadio = screen.getByRole("radio", { name: "Flexible" });

    expect(datesRadio).toHaveAttribute("aria-checked", "true");
    expect(flexibleRadio).toHaveAttribute("aria-checked", "false");
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

  it("renders tolerance chips with aria-pressed and updates exact date tolerance", () => {
    const exactDates: DateSearch = {
      mode: "exact",
      checkIn: "2026-11-01",
      checkOut: "2026-11-06",
      tolerance: 0,
    };
    const handleChange = jest.fn();

    const { rerender } = render(
      <WhenSection dates={exactDates} today={today} onChange={handleChange} />,
    );

    const exactChip = screen.getByRole("button", { name: "Exact dates" });
    const plus1Chip = screen.getByRole("button", { name: "± 1 day" });
    const plus2Chip = screen.getByRole("button", { name: "± 2 days" });

    expect(exactChip).toHaveAttribute("aria-pressed", "true");
    expect(plus1Chip).toHaveAttribute("aria-pressed", "false");
    expect(plus2Chip).toHaveAttribute("aria-pressed", "false");

    // Click ± 1 day
    fireEvent.click(plus1Chip);
    expect(handleChange).toHaveBeenCalledWith({
      mode: "exact",
      checkIn: "2026-11-01",
      checkOut: "2026-11-06",
      tolerance: 1,
    });

    // Re-render with tolerance 1
    rerender(
      <WhenSection
        dates={{ ...exactDates, tolerance: 1 }}
        today={today}
        onChange={handleChange}
      />,
    );
    expect(screen.getByTestId("when-summary")).toHaveTextContent(
      "Nov 1 – 6 (± 1)",
    );
    expect(plus1Chip).toHaveAttribute("aria-pressed", "true");

    // Click ± 2 days
    fireEvent.click(plus2Chip);
    expect(handleChange).toHaveBeenCalledWith({
      mode: "exact",
      checkIn: "2026-11-01",
      checkOut: "2026-11-06",
      tolerance: 2,
    });

    // Re-render with tolerance 2
    rerender(
      <WhenSection
        dates={{ ...exactDates, tolerance: 2 }}
        today={today}
        onChange={handleChange}
      />,
    );
    expect(screen.getByTestId("when-summary")).toHaveTextContent(
      "Nov 1 – 6 (± 2)",
    );
    expect(plus2Chip).toHaveAttribute("aria-pressed", "true");
  });

  it("switches to flexible mode and allows picking stay length and next 12 months", () => {
    const handleChange = jest.fn();
    const { rerender } = render(
      <WhenSection
        dates={defaultDates}
        today={today}
        onChange={handleChange}
      />,
    );

    const flexibleRadio = screen.getByRole("radio", { name: "Flexible" });
    fireEvent.click(flexibleRadio);

    // Initial flexible view has 0 months selected, so summary says "Select months"
    expect(screen.getByTestId("when-summary")).toHaveTextContent(
      "Select months",
    );

    // Stay length chips
    const weekendChip = screen.getByRole("button", { name: "Weekend" });
    const weekChip = screen.getByRole("button", { name: "Week" });
    const monthChip = screen.getByRole("button", { name: "Month" });

    expect(weekChip).toHaveAttribute("aria-pressed", "true"); // default stay
    expect(weekendChip).toHaveAttribute("aria-pressed", "false");
    expect(monthChip).toHaveAttribute("aria-pressed", "false");

    // Month toggles: verify exactly 12 month buttons are rendered
    const monthGroup = screen.getByRole("group", { name: /select months/i });
    const monthButtons = monthGroup.querySelectorAll("button");
    expect(monthButtons).toHaveLength(12);

    // First month is November 2026
    const novButton = screen.getByRole("button", { name: "November 2026" });
    expect(novButton).toHaveAttribute("aria-pressed", "false");

    // Toggle November 2026 on
    fireEvent.click(novButton);
    expect(handleChange).toHaveBeenCalledWith({
      mode: "flexible",
      stay: "week",
      months: ["2026-11"],
    });

    // Re-render with 1 month selected
    rerender(
      <WhenSection
        dates={{ mode: "flexible", stay: "week", months: ["2026-11"] }}
        today={today}
        onChange={handleChange}
      />,
    );
    expect(screen.getByTestId("when-summary")).toHaveTextContent(
      "A week in Nov",
    );

    // Click "Weekend" stay length
    fireEvent.click(weekendChip);
    expect(handleChange).toHaveBeenCalledWith({
      mode: "flexible",
      stay: "weekend",
      months: ["2026-11"],
    });

    // Re-render with weekend stay
    rerender(
      <WhenSection
        dates={{ mode: "flexible", stay: "weekend", months: ["2026-11"] }}
        today={today}
        onChange={handleChange}
      />,
    );
    expect(screen.getByTestId("when-summary")).toHaveTextContent(
      "A weekend in Nov",
    );

    // Select second month December 2026
    const decButton = screen.getByRole("button", { name: "December 2026" });
    fireEvent.click(decButton);
    expect(handleChange).toHaveBeenCalledWith({
      mode: "flexible",
      stay: "weekend",
      months: ["2026-11", "2026-12"],
    });

    // Re-render with 2 months
    rerender(
      <WhenSection
        dates={{
          mode: "flexible",
          stay: "weekend",
          months: ["2026-11", "2026-12"],
        }}
        today={today}
        onChange={handleChange}
      />,
    );
    expect(screen.getByTestId("when-summary")).toHaveTextContent(
      "A weekend in Nov or Dec",
    );

    // Select third month January 2027
    const janButton = screen.getByRole("button", { name: "January 2027" });
    fireEvent.click(janButton);
    expect(handleChange).toHaveBeenCalledWith({
      mode: "flexible",
      stay: "weekend",
      months: ["2026-11", "2026-12", "2027-01"],
    });

    // Re-render with 3 months
    rerender(
      <WhenSection
        dates={{
          mode: "flexible",
          stay: "month",
          months: ["2026-11", "2026-12", "2027-01"],
        }}
        today={today}
        onChange={handleChange}
      />,
    );
    expect(screen.getByTestId("when-summary")).toHaveTextContent(
      "A month in Nov, Dec or Jan",
    );
  });

  it("clears dates and returns to 'Any dates' when Clear dates is clicked in flexible mode", () => {
    const flexibleDates: DateSearch = {
      mode: "flexible",
      stay: "week",
      months: ["2026-11"],
    };
    const handleChange = jest.fn();
    const handleClear = jest.fn();

    render(
      <WhenSection
        dates={flexibleDates}
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

  it("switching Dates ↔ Flexible clears the other mode", () => {
    const exactDates: DateSearch = {
      mode: "exact",
      checkIn: "2026-11-01",
      checkOut: "2026-11-06",
      tolerance: 1,
    };
    const handleChange = jest.fn();

    render(
      <WhenSection dates={exactDates} today={today} onChange={handleChange} />,
    );

    // Switch to Flexible
    const flexibleRadio = screen.getByRole("radio", { name: "Flexible" });
    fireEvent.click(flexibleRadio);

    // Since no months are selected yet in flexible mode, onChange is called with { mode: "any" }
    expect(handleChange).toHaveBeenCalledWith({ mode: "any" });
  });

  it("clears dates and returns to 'Any dates' when Clear dates is clicked in exact mode", () => {
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
