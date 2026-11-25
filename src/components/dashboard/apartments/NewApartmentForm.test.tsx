import "@testing-library/jest-dom";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { GraphQLError } from "@/lib/hasura/gql";
import type { ApartmentInput } from "@/features/apartments";
import { NewApartmentForm } from "./NewApartmentForm";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const change = (label: string | RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

const existing: ApartmentInput = {
  name: "Los Yoses Apartment",
  description: "Pet friendly, 2 bedrooms, near university.",
  price: 950,
  warrantyDeposit: 1900,
  address: {
    street: "Avenida Central",
    neighborhood: "Los Yoses",
    city: "San José",
    country: "Costa Rica",
  },
  coordinates: { lat: 9.93, lng: -84.06 },
  isAvailable: false,
  availableFrom: "2026-07-01T00:00:00.000Z",
  availableUntil: "2027-01-31T00:00:00.000Z",
  bedrooms: 2,
  bathrooms: 1,
  petFriendly: true,
  imageUrls: ["https://example.com/a.jpg", "https://example.com/b.jpg"],
};

function fillValidForm() {
  change("Apartment Name *", "Escazú Loft");
  change("Street Address *", "Calle 5");
  change("Neighborhood", "San Rafael");
  change("City", "Escazú");
  change("Latitude *", "9.93");
  change("Longitude *", "-84.06");
  change("Monthly Price (USD) *", "1100");
  change("Warranty Deposit (USD) *", "2200");
  change("Available From *", "2026-11-01");
  change("Apartment Details", "Bright loft near the park.");
  fireEvent.click(
    within(screen.getByRole("group", { name: "Bedrooms" })).getByRole(
      "button",
      { name: "3" },
    ),
  );
  fireEvent.click(screen.getByRole("checkbox", { name: "Pet friendly" }));
  fireEvent.change(screen.getByLabelText("Image URL 1"), {
    target: { value: "https://example.com/a.jpg" },
  });
}

describe("NewApartmentForm", () => {
  it("defaults the submit label to Register", () => {
    render(<NewApartmentForm onSave={jest.fn()} />);
    expect(
      screen.getByRole("button", { name: "Register" }),
    ).toBeInTheDocument();
  });

  it("calls onSave with the exact ApartmentInput, coordinates as {lat,lng}", async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(<NewApartmentForm onSave={onSave} />);
    fillValidForm();

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith({
      name: "Escazú Loft",
      description: "Bright loft near the park.",
      price: 1100,
      warrantyDeposit: 2200,
      address: {
        street: "Calle 5",
        neighborhood: "San Rafael",
        city: "Escazú",
        country: "Costa Rica",
      },
      coordinates: { lat: 9.93, lng: -84.06 },
      isAvailable: true,
      availableFrom: "2026-11-01T00:00:00.000Z",
      availableUntil: null,
      bedrooms: 3,
      bathrooms: 1,
      petFriendly: true,
      imageUrls: ["https://example.com/a.jpg"],
    } satisfies ApartmentInput);
  });

  it("disables submit while saving", async () => {
    let resolve: () => void = () => {};
    const onSave = jest.fn(() => new Promise<void>((done) => (resolve = done)));
    render(<NewApartmentForm onSave={onSave} />);
    fillValidForm();

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    const saving = await screen.findByRole("button", { name: "Saving..." });
    expect(saving).toBeDisabled();
    fireEvent.click(saving);
    expect(onSave).toHaveBeenCalledTimes(1);
    resolve();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Register" })).toBeEnabled(),
    );
  });

  it("keeps every value and shows the message when onSave rejects", async () => {
    const onSave = jest
      .fn()
      .mockRejectedValue(new Error("Apartment has active reservations"));
    render(
      <NewApartmentForm
        initialValues={existing}
        onSave={onSave}
        submitLabel="Save changes"
      />,
    );
    change("Apartment Name *", "Edited name");
    change("Monthly Price (USD) *", "990");
    fireEvent.click(screen.getByRole("button", { name: "Add URL" }));
    fireEvent.change(screen.getByLabelText("Image URL 3"), {
      target: { value: "https://example.com/c.jpg" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Apartment has active reservations",
    );
    expect(screen.getByLabelText("Apartment Name *")).toHaveValue(
      "Edited name",
    );
    expect(screen.getByLabelText("Monthly Price (USD) *")).toHaveValue(990);
    expect(screen.getByLabelText("Warranty Deposit (USD) *")).toHaveValue(1900);
    expect(screen.getByLabelText("Image URL 1")).toHaveValue(
      "https://example.com/a.jpg",
    );
    expect(screen.getByLabelText("Image URL 2")).toHaveValue(
      "https://example.com/b.jpg",
    );
    expect(screen.getByLabelText("Image URL 3")).toHaveValue(
      "https://example.com/c.jpg",
    );
    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
  });

  it("ties a constraint error to its field with aria-describedby", async () => {
    const onSave = jest
      .fn()
      .mockRejectedValue(
        new GraphQLError(
          'violates check constraint "valid_date_range"',
          "constraint-violation",
        ),
      );
    render(<NewApartmentForm initialValues={existing} onSave={onSave} />);

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Available Until must be later than Available From.",
    );
    const field = screen.getByLabelText("Available Until");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field.getAttribute("aria-describedby")).toBe(alert.id);
  });

  it("validates the price before calling onSave", async () => {
    const onSave = jest.fn();
    render(
      <NewApartmentForm
        initialValues={{ ...existing, price: 0 }}
        onSave={onSave}
      />,
    );
    fireEvent.submit(screen.getByRole("button", { name: "Register" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Please enter a valid price");
    expect(screen.getByLabelText("Monthly Price (USD) *")).toHaveAttribute(
      "aria-describedby",
      alert.id,
    );
    expect(onSave).not.toHaveBeenCalled();
  });

  it("requires longitude when only latitude is given", async () => {
    const onSave = jest.fn();
    render(<NewApartmentForm onSave={onSave} />);
    fillValidForm();
    change("Longitude *", "");

    fireEvent.submit(screen.getByRole("button", { name: "Register" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Enter both latitude and longitude.");
    expect(screen.getByLabelText("Longitude *")).toHaveAttribute(
      "aria-describedby",
      alert.id,
    );
    expect(screen.getByLabelText("Latitude *")).toHaveValue(9.93);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("requires coordinates when none are given", async () => {
    const onSave = jest.fn();
    render(
      <NewApartmentForm
        initialValues={{ ...existing, coordinates: null }}
        onSave={onSave}
      />,
    );

    fireEvent.submit(screen.getByRole("button", { name: "Register" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Enter both latitude and longitude.");
    expect(screen.getByLabelText("Latitude *")).toHaveAttribute(
      "aria-describedby",
      alert.id,
    );
    expect(onSave).not.toHaveBeenCalled();
  });

  it("ties a Not-NULL coordinates error from the backend to latitude", async () => {
    const onSave = jest
      .fn()
      .mockRejectedValue(
        new GraphQLError(
          'Not-NULL violation. null value in column "coordinates" violates not-null constraint',
          "constraint-violation",
        ),
      );
    render(<NewApartmentForm initialValues={existing} onSave={onSave} />);

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Enter both latitude and longitude.");
    expect(screen.getByLabelText("Latitude *")).toHaveAttribute(
      "aria-describedby",
      alert.id,
    );
  });

  it("prefills every field from initialValues", () => {
    render(<NewApartmentForm initialValues={existing} onSave={jest.fn()} />);

    expect(screen.getByLabelText("Apartment Name *")).toHaveValue(
      "Los Yoses Apartment",
    );
    expect(screen.getByLabelText("Street Address *")).toHaveValue(
      "Avenida Central",
    );
    expect(screen.getByLabelText("Neighborhood")).toHaveValue("Los Yoses");
    expect(screen.getByLabelText("Monthly Price (USD) *")).toHaveValue(950);
    expect(screen.getByLabelText("Warranty Deposit (USD) *")).toHaveValue(1900);
    expect(screen.getByLabelText("Latitude *")).toHaveValue(9.93);
    expect(screen.getByLabelText("Longitude *")).toHaveValue(-84.06);
    expect(screen.getByLabelText("Available From *")).toHaveValue("2026-07-01");
    expect(screen.getByLabelText("Available Until")).toHaveValue("2027-01-31");
    expect(screen.getByLabelText("Apartment Details")).toHaveValue(
      "Pet friendly, 2 bedrooms, near university.",
    );
    expect(
      screen.getByRole("checkbox", { name: "Pet friendly" }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "Available now" }),
    ).not.toBeChecked();
    expect(
      screen
        .getByRole("group", { name: "Bedrooms" })
        .querySelector('[aria-pressed="true"]'),
    ).toHaveTextContent("2");
    expect(screen.getByLabelText("Image URL 2")).toHaveValue(
      "https://example.com/b.jpg",
    );
    expect(
      screen.getAllByRole("button", { name: /^Remove image URL/ }),
    ).toHaveLength(2);
  });

  it("round-trips initialValues unchanged through a save", async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(<NewApartmentForm initialValues={existing} onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: "Register" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(existing));
  });
});
