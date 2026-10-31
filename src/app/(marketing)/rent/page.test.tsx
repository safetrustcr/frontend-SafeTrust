import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import type { ApartmentListing } from "@/types/hotel";
import { addDays, localToday } from "@/features/listings";
import HotelListingPage from "./page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  usePathname: () => "/rent",
  useSearchParams: jest.fn(),
}));

jest.mock("@/components/listings/HotelHeader", () => ({
  __esModule: true,
  default: () => <header data-testid="hotel-header" />,
}));

jest.mock("@/components/listings/RentMotion", () => ({
  RentMotion: ({ children }: { children: ReactNode }) => <>{children}</>,
  RentReveal: ({
    children,
    delay: _delay,
    ...rest
  }: ComponentProps<"div"> & { delay?: number }) => (
    <div {...rest}>{children}</div>
  ),
}));

jest.mock("@/components/listings/ApartmentGrid", () => ({
  __esModule: true,
  default: ({ apartments }: { apartments: ApartmentListing[] }) => (
    <ul data-testid="apartment-grid">
      {apartments.map((apartment) => (
        <li key={apartment.id} data-testid={`listing-${apartment.id}`}>
          {apartment.name}
        </li>
      ))}
    </ul>
  ),
}));

jest.mock("vaul", () => ({
  Drawer: {
    Root: ({ children }: { children: ReactNode }) => <>{children}</>,
    Trigger: ({
      children,
      asChild: _asChild,
    }: {
      children: ReactNode;
      asChild?: boolean;
    }) => <>{children}</>,
    Portal: ({ children }: { children: ReactNode }) => <>{children}</>,
    Overlay: (props: ComponentProps<"div">) => <div {...props} />,
    Content: ({
      children,
      onOpenAutoFocus: _onOpenAutoFocus,
      ...rest
    }: ComponentProps<"div"> & {
      onOpenAutoFocus?: (event: unknown) => void;
    }) => <div {...rest}>{children}</div>,
    Title: ({ children, ...rest }: ComponentProps<"div">) => (
      <div {...rest}>{children}</div>
    ),
    Description: ({ children, ...rest }: ComponentProps<"div">) => (
      <div {...rest}>{children}</div>
    ),
    Close: ({
      children,
      asChild: _asChild,
    }: {
      children: ReactNode;
      asChild?: boolean;
    }) => <>{children}</>,
  },
}));

async function renderRent(query: string) {
  (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(query));
  render(<HotelListingPage />);
  await screen.findByTestId("apartment-grid");
}

const shownListingIds = () =>
  Array.from(document.querySelectorAll('[data-testid^="listing-"]')).map(
    (node) => node.getAttribute("data-testid")?.replace("listing-", "") ?? "",
  );

const sortedShownIds = () =>
  [...shownListingIds()].sort((left, right) => +left - +right);

describe("RentPage – stay search from the URL", () => {
  beforeAll(() => {
    // jsdom implements neither of the APIs the destination carousel touches.
    window.matchMedia = ((query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }) as unknown as MediaQueryList) as typeof window.matchMedia;
    Element.prototype.scrollBy = jest.fn();
  });
  it("shows all 12 listings and no availability note without stay params", async () => {
    await renderRent("");

    expect(sortedShownIds()).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
    ]);
    // The existing promoted-first ordering is unchanged by the stay pipeline.
    expect(shownListingIds().slice(0, 3)).toEqual(["1", "4", "9"]);
    expect(screen.getByText("12 units available")).toBeInTheDocument();
    expect(screen.queryByText(/Demo availability/)).not.toBeInTheDocument();
  });

  it("excludes every listing for ?adults=10 and shows the empty state", async () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("adults=10"),
    );
    render(<HotelListingPage />);

    expect(
      await screen.findByText("No places match these filters"),
    ).toBeInTheDocument();
    expect(sortedShownIds()).toEqual([]);
    expect(screen.getByText("0 units available")).toBeInTheDocument();
    expect(screen.queryByText(/Demo availability/)).not.toBeInTheDocument();
  });

  it("keeps only pet-friendly listings with capacity for ?adults=2&pets=1", async () => {
    await renderRent("adults=2&pets=1");

    expect(sortedShownIds()).toEqual(["1", "4", "6", "7", "10", "11"]);
    expect(screen.getByText("6 units available")).toBeInTheDocument();
    expect(screen.queryByText(/Demo availability/)).not.toBeInTheDocument();
  });

  it("filters booked listings for ?checkIn&checkOut and shows the demo note", async () => {
    const today = localToday();
    // [today+5, today+7) overlaps the demo bookings of listings 1, 2, 4, 7, 12.
    await renderRent(
      `checkIn=${addDays(today, 5)}&checkOut=${addDays(today, 7)}`,
    );

    expect(sortedShownIds()).toEqual(["3", "5", "6", "8", "9", "10", "11"]);
    expect(screen.getByText("7 units available")).toBeInTheDocument();
    expect(
      screen.getByText("Demo availability — confirm dates with the host."),
    ).toBeInTheDocument();
  });

  it("shows every listing and no note when the date params are empty", async () => {
    await renderRent("checkIn=&checkOut=");

    expect(sortedShownIds()).toHaveLength(12);
    expect(screen.getByText("12 units available")).toBeInTheDocument();
    expect(screen.queryByText(/Demo availability/)).not.toBeInTheDocument();
  });
});
