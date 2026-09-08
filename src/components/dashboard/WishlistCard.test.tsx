import { render, screen, fireEvent } from "@testing-library/react";
import { WishlistCard } from "./WishlistCard";
import FavoritesPage from "@/app/dashboard/favorites/page";
import type { Apartment } from "@/lib/mockData/apartments";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockApartments: Apartment[] = [
  {
    id: "apt-1",
    name: "Apartment 1",
    price: 1000,
    warranty_deposit: 2000,
    is_available: true,
    image_urls: ["/img/room1.png", "/img/room2.png"],
    address: { city: "San José" },
    location: "San José",
    offers: 1,
    status: "inhabited",
    promoted: true,
    available_from: "2026-01-01",
    created_at: "2026-01-01",
    owner_id: "owner-1",
  },
  {
    id: "apt-2",
    name: "Apartment 2",
    price: 1500,
    warranty_deposit: 3000,
    is_available: true,
    image_urls: ["/img/room3.png"],
    address: { city: "Escazú" },
    location: "Escazú",
    offers: 0,
    status: "inhabited",
    promoted: false,
    available_from: "2026-01-01",
    created_at: "2026-01-01",
    owner_id: "owner-2",
  },
];

describe("WishlistCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders collection name and savedAt timestamp correctly", () => {
    render(
      <WishlistCard
        name="Recently viewed"
        savedAt="Today"
        apartments={mockApartments}
      />
    );

    expect(screen.getByText("Recently viewed")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("triggers onClick callback when clicked", () => {
    const handleClick = jest.fn();
    render(
      <WishlistCard
        name="Escazú picks"
        savedAt="Yesterday"
        apartments={mockApartments}
        onClick={handleClick}
      />
    );

    fireEvent.click(screen.getByText("Escazú picks"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe("FavoritesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the page title and stub wishlist collections", () => {
    render(<FavoritesPage />);

    expect(screen.getByText("My Wishlist")).toBeInTheDocument();
    expect(screen.getByText("3 saved")).toBeInTheDocument();
    expect(screen.getByText("Recently viewed")).toBeInTheDocument();
    expect(screen.getByText("La Sabana picks")).toBeInTheDocument();
    expect(screen.getByText("Escazú options")).toBeInTheDocument();
  });

  it("navigates to /rent when browse apartments button is clicked", () => {
    render(<FavoritesPage />);

    const browseBtn = screen.getByRole("button", { name: /browse apartments/i });
    fireEvent.click(browseBtn);

    expect(mockPush).toHaveBeenCalledWith("/rent");
  });

  it("navigates to /rent when a wishlist card is clicked", () => {
    render(<FavoritesPage />);

    const card = screen.getByText("Recently viewed");
    fireEvent.click(card);

    expect(mockPush).toHaveBeenCalledWith("/rent");
  });
});
