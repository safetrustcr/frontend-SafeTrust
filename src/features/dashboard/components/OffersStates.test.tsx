import { fireEvent, render, screen } from "@testing-library/react";
import { OffersErrorState, OffersSkeleton } from "./OffersStates";

it("announces loading without exposing decorative skeletons", () => {
  render(<OffersSkeleton />);
  expect(
    screen.getByRole("status", { name: "Loading offers" }),
  ).toHaveTextContent("Loading offers...");
});

it("only retries when the user activates the retry button", () => {
  const onRetry = jest.fn();
  render(
    <OffersErrorState onRetry={onRetry} backHref="/dashboard/apartments" />,
  );
  expect(onRetry).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(onRetry).toHaveBeenCalledTimes(1);
});
