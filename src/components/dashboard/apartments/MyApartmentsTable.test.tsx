import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import type {
  ApartmentsRepository,
  OwnedApartment,
} from "@/features/apartments";
import { MyApartmentsTable } from "./MyApartmentsTable";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn() } }));

const base: OwnedApartment = {
  id: "a",
  name: "Escazú Loft",
  description: null,
  price: 1100,
  warrantyDeposit: 2200,
  address: {
    street: "Calle 5",
    neighborhood: "San Rafael",
    city: "Escazú",
    country: "Costa Rica",
  },
  coordinates: null,
  isAvailable: true,
  availableFrom: "2026-11-01T00:00:00.000Z",
  availableUntil: null,
  bedrooms: 2,
  bathrooms: 1,
  petFriendly: false,
  imageUrls: [],
  createdAt: "2026-10-01T00:00:00.000Z",
  offers: 4,
};

function repositoryWith(apartments: OwnedApartment[]): ApartmentsRepository {
  let rows = [...apartments];
  return {
    mode: "live",
    listMine: jest.fn(async () => [...rows]),
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(async (id: string) => {
      rows = rows.filter((row) => row.id !== id);
    }),
  };
}

describe("MyApartmentsTable", () => {
  beforeEach(() => jest.clearAllMocks());

  it("lists the host's apartments from the repository", async () => {
    const repo = repositoryWith([
      base,
      { ...base, id: "b", name: "Heredia House", isAvailable: false },
    ]);
    render(<MyApartmentsTable repository={repo} />);

    expect((await screen.findAllByText("Escazú Loft")).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText("Heredia House").length).toBeGreaterThan(0);
    expect(screen.getByText("Showing 2 of 2")).toBeInTheDocument();
    expect(repo.listMine).toHaveBeenCalledTimes(1);
  });

  it("removes through the repository, then refetches", async () => {
    const repo = repositoryWith([
      base,
      { ...base, id: "b", name: "Heredia House" },
    ]);
    render(<MyApartmentsTable repository={repo} />);
    await screen.findByText("Showing 2 of 2");

    const [trigger] = screen.getAllByRole("button", {
      name: "Apartment actions for Escazú Loft",
    });
    fireEvent.keyDown(trigger, { key: "Enter" });
    fireEvent.click(await screen.findByRole("menuitem", { name: "Delete" }));
    fireEvent.click(await screen.findByRole("button", { name: "Remove" }));

    await waitFor(() => expect(repo.remove).toHaveBeenCalledWith("a"));
    expect(await screen.findByText("Showing 1 of 1")).toBeInTheDocument();
    expect(screen.queryByText("Escazú Loft")).not.toBeInTheDocument();
    expect(repo.listMine).toHaveBeenCalledTimes(2);
    expect(toast.success).toHaveBeenCalledWith("Apartment removed");
  });

  it("shows the error instead of fixtures when the list can't load", async () => {
    const repo = repositoryWith([]);
    (repo.listMine as jest.Mock).mockRejectedValueOnce(
      new Error("Couldn't reach the server"),
    );
    render(<MyApartmentsTable repository={repo} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Couldn't reach the server",
    );
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Showing 0 of 0")).toBeInTheDocument();
  });

  it("labels demo mode", async () => {
    const repo = { ...repositoryWith([base]), mode: "demo" as const };
    render(<MyApartmentsTable repository={repo} />);
    expect(await screen.findByText("Demo")).toBeInTheDocument();
  });
});
