import { fireEvent, render, screen } from "@testing-library/react";
import { DestinationCard } from "./DestinationCard";
import type { Destination } from "@/types/destination";

jest.mock("next/image", () => {
  function Image({
    src,
    alt,
    onError,
  }: React.ImgHTMLAttributes<HTMLImageElement>) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} onError={onError} />;
  }
  return { __esModule: true, default: Image };
});
const destination: Destination = {
  id: "heredia",
  location: "Heredia",
  name: "Heredia",
  tagline: "University town, coffee hills",
  imageUrl: "/img/destinations/heredia.webp",
  coordinates: { lat: 9.9981, lng: -84.1165 },
};

it("shows the destination, zero count and selected state, and selects the object", () => {
  const select = jest.fn();
  render(
    <DestinationCard
      destination={destination}
      selected
      listingCount={0}
      distanceKm={12.4}
      onSelect={select}
    />,
  );
  const button = screen.getByRole("button", {
    name: /Heredia, University town, coffee hills, 0 places/,
  });
  expect(button).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByText("0 places · 12 km")).toBeInTheDocument();
  fireEvent.click(button);
  expect(select).toHaveBeenCalledWith(destination);
});

it("uses a placeholder after an image failure and can recover for a new source", () => {
  const { container, rerender } = render(
    <DestinationCard destination={destination} listingCount={1} />,
  );
  expect(screen.getByText("1 place")).toBeInTheDocument();
  expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  fireEvent.error(container.querySelector("img")!);
  expect(container.querySelector("img")).toHaveAttribute(
    "src",
    "/img/placeholder.svg",
  );
  rerender(
    <DestinationCard
      destination={{ ...destination, imageUrl: "/replacement.webp" }}
    />,
  );
  expect(container.querySelector("img")).toHaveAttribute(
    "src",
    "/replacement.webp",
  );
});
