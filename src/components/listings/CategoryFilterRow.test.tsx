import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import CategoryFilterRow from "./CategoryFilterRow";

const onCategoryToggle = jest.fn();
const onLocationToggle = jest.fn();
const onBedroomSelect = jest.fn();
const onMinPriceChange = jest.fn();
const onMaxPriceChange = jest.fn();
const onReset = jest.fn();

const renderFilterRow = (selectedCategories: string[] = ["Family"]) =>
  render(
    <CategoryFilterRow
      selectedCategories={selectedCategories}
      selectedLocations={[]}
      selectedBedrooms="all"
      minPrice={3200}
      maxPrice={206000}
      onCategoryToggle={onCategoryToggle}
      onLocationToggle={onLocationToggle}
      onBedroomSelect={onBedroomSelect}
      onMinPriceChange={onMinPriceChange}
      onMaxPriceChange={onMaxPriceChange}
      onReset={onReset}
    />,
  );

beforeAll(() => {
  // Radix popovers measure their content, which jsdom does not implement.
  Object.defineProperty(global, "ResizeObserver", {
    writable: true,
    value: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  });
});

describe("CategoryFilterRow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("toggles a category, a location and a bedroom count", () => {
    renderFilterRow();

    fireEvent.click(screen.getByRole("button", { name: "Students" }));
    expect(onCategoryToggle).toHaveBeenCalledWith("Students");

    fireEvent.click(screen.getByRole("button", { name: "Cartago" }));
    expect(onLocationToggle).toHaveBeenCalledWith("Cartago");

    fireEvent.click(screen.getByRole("button", { name: "2 bedrooms" }));
    expect(onBedroomSelect).toHaveBeenCalledWith("2");
  });

  it("clears every category from the All Categories pill", () => {
    renderFilterRow();

    fireEvent.click(screen.getByRole("button", { name: "All Categories" }));

    expect(onCategoryToggle).toHaveBeenCalledWith("");
  });

  it("highlights the selected pills", () => {
    renderFilterRow(["Family"]);

    expect(screen.getByRole("button", { name: "Family" })).toHaveClass(
      "bg-orange-500",
    );
    expect(screen.getByRole("button", { name: "Students" })).not.toHaveClass(
      "bg-orange-500",
    );
    expect(screen.getByRole("button", { name: "All apartments" })).toHaveClass(
      "bg-orange-500",
    );
  });

  it("updates and resets the price range from the advanced popover", () => {
    renderFilterRow();

    fireEvent.click(screen.getByRole("button", { name: /advanced/i }));

    fireEvent.change(screen.getByPlaceholderText("Min"), {
      target: { value: "5000" },
    });
    expect(onMinPriceChange).toHaveBeenCalledWith(5000);

    fireEvent.change(screen.getByPlaceholderText("Max"), {
      target: { value: "90000" },
    });
    expect(onMaxPriceChange).toHaveBeenCalledWith(90000);

    fireEvent.click(screen.getByRole("button", { name: /reset filters/i }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
