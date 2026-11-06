import { act, fireEvent, render, screen } from "@testing-library/react";
import FilterSidebar from "./FilterSidebar";
import { DEFAULT_FILTERS } from "../../model/filters";
import type { Listing } from "../../model/types";

const listing = (location: string, category: string, price: number) =>
  ({ location, category, price, bedrooms: 1, promoted: false }) as Listing;

const listings = [
  listing("Heredia", "Family", 40),
  listing("Heredia", "Students", 60),
  listing("Cartago", "Family", 80),
];

function renderSidebar(filters = DEFAULT_FILTERS) {
  const setFilters = jest.fn();
  render(
    <FilterSidebar
      filters={filters}
      setFilters={setFilters}
      reset={jest.fn()}
      listings={listings}
    />,
  );
  return setFilters;
}

describe("FilterSidebar", () => {
  it("adds a province to the ones already selected", () => {
    const setFilters = renderSidebar({
      ...DEFAULT_FILTERS,
      locations: ["Heredia"],
    });

    fireEvent.click(screen.getByRole("checkbox", { name: /Cartago/ }));

    expect(setFilters).toHaveBeenCalledWith({
      locations: ["Heredia", "Cartago"],
    });
  });

  it("shows counts and disables options with no stays", () => {
    renderSidebar();

    expect(screen.getByRole("checkbox", { name: "Heredia 2" })).toBeEnabled();
    expect(screen.getByRole("checkbox", { name: /Limón/ })).toBeDisabled();
  });

  it("keeps a selected option with no stays clearable", () => {
    renderSidebar({ ...DEFAULT_FILTERS, locations: ["Limón"] });

    expect(screen.getByRole("checkbox", { name: /Limón/ })).toBeEnabled();
  });

  it("does not let the price handles cross", () => {
    jest.useFakeTimers();
    const setFilters = renderSidebar({
      ...DEFAULT_FILTERS,
      minPrice: 50,
      maxPrice: 100,
    });

    fireEvent.change(screen.getByLabelText("Minimum price"), {
      target: { value: "150" },
    });

    expect(setFilters).not.toHaveBeenCalled(); // commits once the handle settles
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(setFilters).toHaveBeenCalledWith({ minPrice: 100, maxPrice: 100 });
    jest.useRealTimers();
  });
});
