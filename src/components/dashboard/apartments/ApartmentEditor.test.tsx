import "@testing-library/jest-dom";
import { Component, type ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import type {
  ApartmentsRepository,
  OwnedApartment,
} from "@/features/apartments";
import { ApartmentEditor } from "./ApartmentEditor";

const push = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn() } }));

class Boundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    return this.state.error ? (
      <p>caught: {this.state.error.message}</p>
    ) : (
      this.props.children
    );
  }
}

const apartment: OwnedApartment = {
  id: "6f1c2a7e-1111-4222-8333-944455556666",
  name: "Los Yoses Apartment",
  description: "Near university.",
  price: 950,
  warrantyDeposit: 1900,
  address: {
    street: "Avenida Central",
    neighborhood: "Los Yoses",
    city: "San José",
    country: "Costa Rica",
  },
  coordinates: { lat: 9.93, lng: -84.06 },
  isAvailable: true,
  availableFrom: "2026-07-01T00:00:00.000Z",
  availableUntil: null,
  bedrooms: 2,
  bathrooms: 1,
  petFriendly: true,
  imageUrls: ["https://example.com/a.jpg"],
  createdAt: "2026-05-20T10:00:00.000Z",
  offers: 3,
};

const repository = (
  overrides: Partial<ApartmentsRepository> = {},
): ApartmentsRepository => ({
  mode: "live",
  listMine: jest.fn().mockResolvedValue([apartment]),
  get: jest.fn().mockResolvedValue(apartment),
  create: jest.fn().mockResolvedValue(apartment),
  update: jest.fn().mockResolvedValue(apartment),
  remove: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe("ApartmentEditor", () => {
  beforeEach(() => jest.clearAllMocks());
  // React logs the error the boundary catches.
  beforeEach(() => jest.spyOn(console, "error").mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  it("creates, then toasts and goes back to the list", async () => {
    const repo = repository();
    render(<ApartmentEditor repository={repo} />);
    fireEvent.change(screen.getByLabelText("Apartment Name *"), {
      target: { value: "New place" },
    });
    fireEvent.change(screen.getByLabelText("Street Address *"), {
      target: { value: "Calle 1" },
    });
    fireEvent.change(screen.getByLabelText("Latitude *"), {
      target: { value: "9.93" },
    });
    fireEvent.change(screen.getByLabelText("Longitude *"), {
      target: { value: "-84.06" },
    });
    fireEvent.change(screen.getByLabelText("Monthly Price (USD) *"), {
      target: { value: "800" },
    });
    fireEvent.change(screen.getByLabelText("Warranty Deposit (USD) *"), {
      target: { value: "1600" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/dashboard/apartments"),
    );
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "New place", price: 800 }),
    );
    expect(toast.success).toHaveBeenCalledWith("Apartment created");
  });

  it("shows a skeleton while the apartment loads", () => {
    const repo = repository({ get: jest.fn(() => new Promise(() => {})) });
    render(<ApartmentEditor apartmentId={apartment.id} repository={repo} />);
    expect(
      screen.getByRole("status", { name: "Loading apartment" }),
    ).toBeInTheDocument();
    expect(notFound).not.toHaveBeenCalled();
  });

  it("calls notFound for an unknown or foreign id", async () => {
    const repo = repository({ get: jest.fn().mockResolvedValue(null) });
    render(
      <Boundary>
        <ApartmentEditor apartmentId="unknown" repository={repo} />
      </Boundary>,
    );
    await waitFor(() => expect(notFound).toHaveBeenCalled());
    expect(repo.get).toHaveBeenCalledWith("unknown");
    expect(await screen.findByText("caught: NEXT_NOT_FOUND")).toBeVisible();
  });

  it("prefills the form and saves changes with update", async () => {
    const repo = repository();
    render(<ApartmentEditor apartmentId={apartment.id} repository={repo} />);

    expect(await screen.findByLabelText("Apartment Name *")).toHaveValue(
      "Los Yoses Apartment",
    );
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() =>
      expect(repo.update).toHaveBeenCalledWith(
        apartment.id,
        expect.objectContaining({ name: "Los Yoses Apartment" }),
      ),
    );
    expect(toast.success).toHaveBeenCalledWith("Apartment updated");
    expect(push).toHaveBeenCalledWith("/dashboard/apartments");
  });

  it("keeps every edited value, images included, when update fails", async () => {
    const repo = repository({
      update: jest
        .fn()
        .mockRejectedValue(new Error("Apartment has active reservations")),
    });
    render(<ApartmentEditor apartmentId={apartment.id} repository={repo} />);

    fireEvent.change(await screen.findByLabelText("Apartment Name *"), {
      target: { value: "Edited name" },
    });
    fireEvent.change(screen.getByLabelText("Image URL 1"), {
      target: { value: "https://example.com/edited.jpg" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Apartment has active reservations",
    );
    expect(screen.getByLabelText("Apartment Name *")).toHaveValue(
      "Edited name",
    );
    expect(screen.getByLabelText("Image URL 1")).toHaveValue(
      "https://example.com/edited.jpg",
    );
    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("shows a retry when loading fails, without falling back to fixtures", async () => {
    const get = jest
      .fn()
      .mockRejectedValueOnce(new Error("Couldn't load"))
      .mockResolvedValueOnce(apartment);
    render(
      <ApartmentEditor
        apartmentId={apartment.id}
        repository={repository({ get })}
      />,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load");
    expect(screen.queryByLabelText("Apartment Name *")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByLabelText("Apartment Name *")).toHaveValue(
      "Los Yoses Apartment",
    );
  });

  it("labels demo mode and says changes aren't stored", async () => {
    const repo = repository({ mode: "demo" });
    render(<ApartmentEditor apartmentId={apartment.id} repository={repo} />);

    expect(await screen.findByText("Demo")).toBeInTheDocument();
    fireEvent.click(
      await screen.findByRole("button", { name: "Save changes" }),
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Saved in demo mode (not stored)",
      ),
    );
  });
});
