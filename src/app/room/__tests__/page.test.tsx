import { fireEvent, render, screen } from "@testing-library/react";
import RoomPage from "../page";
import { getApartmentById } from "@/lib/mockData/apartmentListings";

const push = jest.fn();
let mockUser: { uid: string } | null = null;
let mockLoading = false;

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, back: jest.fn() }),
  usePathname: () => "/room",
}));

jest.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ user: mockUser, loading: mockLoading }),
}));

jest.mock("@/providers/EscrowProviders", () => ({
  EscrowProviders: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@/components/rooms/booking/BookingButton", () => ({
  BookingButton: () => null,
}));

jest.mock("@/components/rooms/gallery/RoomPhotos", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/rooms/gallery/AdditionalRoomPhotos", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/hotels/payment/Map", () => ({
  __esModule: true,
  default: () => <div data-testid="map" />,
}));

const MESSAGES = "/dashboard/messages/new?listing=1";

describe("RoomPage actions", () => {
  beforeEach(() => {
    push.mockClear();
    mockUser = null;
    mockLoading = false;
  });

  it("sends signed-out visitors to login with a redirect back to /room", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    render(<RoomPage />);

    fireEvent.click(
      screen.getAllByRole("button", { name: /contact host/i })[0],
    );

    expect(push).toHaveBeenCalledWith("/login?redirect=%2Froom");
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it("opens the listing conversation for signed-in users", async () => {
    mockUser = { uid: "u1" };
    render(<RoomPage />);

    const buttons = screen.getAllByRole("button", { name: /contact host/i });
    fireEvent.click(buttons[0]);
    expect(push).toHaveBeenLastCalledWith(MESSAGES);
    fireEvent.click(buttons[buttons.length - 1]);
    expect(push).toHaveBeenLastCalledWith(MESSAGES);
  });

  it("does nothing while auth is loading", async () => {
    mockLoading = true;
    render(<RoomPage />);
    fireEvent.click(
      screen.getAllByRole("button", { name: /contact host/i })[0],
    );
    expect(push).not.toHaveBeenCalled();
  });

  describe("geolocation", () => {
    const original = Object.getOwnPropertyDescriptor(navigator, "geolocation");
    afterEach(() => {
      if (original) Object.defineProperty(navigator, "geolocation", original);
      else Reflect.deleteProperty(navigator, "geolocation");
    });

    it("opens the map dialog, and never asks for geolocation", async () => {
      const getCurrentPosition = jest.fn();
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: { getCurrentPosition, watchPosition: jest.fn() },
      });
      render(<RoomPage />);

      const trigger = screen.getAllByRole("button", { name: "View on Map" })[1];
      fireEvent.click(trigger);
      expect(await screen.findByRole("dialog")).toBeInTheDocument();
      expect(await screen.findByTestId("map")).toBeInTheDocument();
      expect(getCurrentPosition).not.toHaveBeenCalled();
    });
  });

  it("disables Get Directions when the listing coordinates are invalid", () => {
    const listing = getApartmentById("1");
    const original = listing.coordinates;
    listing.coordinates = { lat: Number.NaN, lng: 0 };
    try {
      render(<RoomPage />);
      expect(
        screen.getByRole("button", { name: /get directions/i }),
      ).toBeDisabled();
    } finally {
      listing.coordinates = original;
    }
  });

  it("opens directions in a new tab without an opener", async () => {
    const open = jest.spyOn(window, "open").mockImplementation(() => null);
    render(<RoomPage />);

    fireEvent.click(screen.getByRole("button", { name: /Get Directions/ }));

    expect(open).toHaveBeenCalledWith(
      expect.stringMatching(
        /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=-?\d+\.\d{6},-?\d+\.\d{6}$/,
      ),
      "_blank",
      "noopener,noreferrer",
    );
    open.mockRestore();
  });

  it("points the breadcrumb at /rent", () => {
    render(<RoomPage />);
    expect(screen.getByRole("link", { name: "Search" })).toHaveAttribute(
      "href",
      "/rent",
    );
  });

  describe("mobile and desktop booking card containers", () => {
    it("renders booking card in desktop sidebar when viewport is xl+", () => {
      window.matchMedia = jest.fn().mockImplementation((query: string) => ({
        matches: query === "(min-width: 1280px)",
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(<RoomPage />);
      expect(
        screen.getByRole("heading", { name: "Book This Room" }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders sticky Reserve bar on mobile, and opens the same booking card in a bottom sheet", () => {
      window.matchMedia = jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(<RoomPage />);

      // On mobile when closed, Book This Room is not mounted in the desktop container or sheet
      expect(
        screen.queryByRole("heading", { name: "Book This Room" }),
      ).not.toBeInTheDocument();

      // Sticky bar is visible with Reserve button
      const reserveBtn = screen.getByRole("button", { name: "Reserve" });
      expect(reserveBtn).toBeInTheDocument();

      // Click Reserve to open bottom sheet
      fireEvent.click(reserveBtn);

      // Now sheet is open, containing the exact same booking card
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Book your stay" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Book This Room" }),
      ).toBeInTheDocument();
    });
  });
});
