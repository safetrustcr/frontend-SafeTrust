import { act, fireEvent, render, screen } from "@testing-library/react";
import FilterSidebar from "./FilterSidebar";
import {
  DEFAULT_FILTERS,
  type RentFilters,
  type RentFiltersPatch,
} from "../../model/filters";
import type { Listing } from "../../model/types";

const listing = (location: string, category: string, price: number) =>
  ({ location, category, price, bedrooms: 1, promoted: false }) as Listing;

const listings = [
  listing("Heredia", "Family", 40),
  listing("Heredia", "Students", 60),
  listing("Cartago", "Family", 80),
];

/** A setFilters that applies patches like useRentFilters: to the latest filters. */
function filterStore(initial: RentFilters = DEFAULT_FILTERS) {
  let current = initial;
  const setFilters = jest.fn((patch: RentFiltersPatch) => {
    current = {
      ...current,
      ...(typeof patch === "function" ? patch(current) : patch),
    };
  });
  return { setFilters, latest: () => current };
}

function renderSidebar(
  filters = DEFAULT_FILTERS,
  store = filterStore(filters),
  reset = jest.fn(),
) {
  const view = render(
    <FilterSidebar
      filters={filters}
      setFilters={store.setFilters}
      reset={reset}
      listings={listings}
    />,
  );
  return { ...store, reset, view };
}

afterEach(() => jest.useRealTimers());

describe("FilterSidebar", () => {
  it("keeps both of two quick ticks made before the URL updates", () => {
    const { latest } = renderSidebar();

    fireEvent.click(screen.getByRole("checkbox", { name: /Heredia/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Cartago/ }));

    expect(latest().locations).toEqual(["Heredia", "Cartago"]);
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

  it("commits a price once the handle settles, without crossing", () => {
    jest.useFakeTimers();
    const { setFilters } = renderSidebar({
      ...DEFAULT_FILTERS,
      minPrice: 50,
      maxPrice: 100,
    });

    fireEvent.change(screen.getByLabelText("Minimum price"), {
      target: { value: "150" },
    });
    expect(setFilters).not.toHaveBeenCalled();
    act(() => jest.runOnlyPendingTimers());

    expect(setFilters).toHaveBeenCalledWith({ minPrice: 100, maxPrice: 100 });
  });

  it("drops a pending price change on Clear all", () => {
    jest.useFakeTimers();
    const { setFilters, reset } = renderSidebar();

    fireEvent.change(screen.getByLabelText("Maximum price"), {
      target: { value: "75" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Clear all filters" }));
    act(() => jest.runOnlyPendingTimers());

    expect(reset).toHaveBeenCalled();
    expect(setFilters).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Maximum price")).toHaveValue("200");
  });

  it("commits a price on top of filters chosen while it waited", () => {
    jest.useFakeTimers();
    const first = filterStore();
    const { view } = renderSidebar(DEFAULT_FILTERS, first);

    fireEvent.change(screen.getByLabelText("Maximum price"), {
      target: { value: "75" },
    });
    // A category commits to the URL first: the page rerenders with new props.
    const committed = { ...DEFAULT_FILTERS, categories: ["Family" as const] };
    const second = filterStore(committed);
    view.rerender(
      <FilterSidebar
        filters={committed}
        setFilters={second.setFilters}
        reset={jest.fn()}
        listings={listings}
      />,
    );
    act(() => jest.runOnlyPendingTimers());

    expect(first.setFilters).not.toHaveBeenCalled();
    expect(second.latest()).toMatchObject({
      categories: ["Family"],
      maxPrice: 75,
    });
  });

  it("lets overlapping handles move either way", () => {
    jest.useFakeTimers();
    const { setFilters } = renderSidebar({
      ...DEFAULT_FILTERS,
      minPrice: 100,
      maxPrice: 100,
    });

    // The maximum handle is on top: dragging it left lowers the minimum.
    fireEvent.change(screen.getByLabelText("Maximum price"), {
      target: { value: "80" },
    });
    act(() => jest.runOnlyPendingTimers());
    expect(setFilters).toHaveBeenLastCalledWith({
      minPrice: 80,
      maxPrice: 100,
    });
  });
});
