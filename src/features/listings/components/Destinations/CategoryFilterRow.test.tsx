import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { CategoryFilterRow } from "./CategoryFilterRow";
import type { Category } from "../filters/useRentFilters";

it("toggles multiple categories independently and All clears them", () => {
  function Filters() {
    const [value, setValue] = useState<Category[]>([]);
    return (
      <CategoryFilterRow
        categories={["Family", "Students", "Travelers"]}
        value={value}
        onChange={setValue}
      />
    );
  }
  render(<Filters />);
  const all = screen.getByRole("button", { name: "All" });
  const family = screen.getByRole("button", { name: "Family" });
  const students = screen.getByRole("button", { name: "Students" });
  expect(all).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(family);
  fireEvent.click(students);
  expect(family).toHaveAttribute("aria-pressed", "true");
  expect(students).toHaveAttribute("aria-pressed", "true");
  expect(all).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(family);
  expect(family).toHaveAttribute("aria-pressed", "false");
  expect(students).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(all);
  expect(all).toHaveAttribute("aria-pressed", "true");
  expect(students).toHaveAttribute("aria-pressed", "false");
});
