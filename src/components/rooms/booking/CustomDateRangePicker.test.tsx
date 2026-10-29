import { act, fireEvent, render, screen } from "@testing-library/react";
import { differenceInCalendarDays } from "date-fns";
import { CustomDateRangePicker } from "./CustomDateRangePicker";

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

it("changes the number of visible months on resize without changing the selected range", () => {
  let resize: (() => void) | undefined;
  const media = {
    matches: false,
    addEventListener: jest.fn((_event, listener) => {
      resize = listener;
    }),
    removeEventListener: jest.fn(),
  };
  window.matchMedia = jest.fn().mockReturnValue(media);
  const onDateChange = jest.fn();
  const date = { from: new Date(2030, 10, 1), to: new Date(2030, 10, 6) };
  const { unmount } = render(
    <CustomDateRangePicker date={date} onDateChange={onDateChange} />,
  );

  fireEvent.click(
    screen.getByRole("button", { name: "Nov 01 - Nov 06 (5 nights)" }),
  );
  expect(screen.getAllByRole("grid")).toHaveLength(1);
  act(() => {
    media.matches = true;
    resize?.();
  });
  expect(screen.getAllByRole("grid")).toHaveLength(2);
  expect(onDateChange).not.toHaveBeenCalled();
  expect(
    screen.getByRole("dialog", { name: "Choose rental dates" }),
  ).toBeVisible();

  unmount();
  expect(media.removeEventListener).toHaveBeenCalledWith("change", resize);
});

it("keeps quick date selection functional in the single-month layout", () => {
  window.matchMedia = jest.fn().mockReturnValue({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  });
  const onDateChange = jest.fn();
  render(<CustomDateRangePicker onDateChange={onDateChange} />);
  fireEvent.click(screen.getByRole("button", { name: "Select your dates" }));
  fireEvent.click(screen.getByRole("button", { name: "2 Nights" }));
  const range = onDateChange.mock.calls[0][0];
  expect(differenceInCalendarDays(range.to, range.from)).toBe(2);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
