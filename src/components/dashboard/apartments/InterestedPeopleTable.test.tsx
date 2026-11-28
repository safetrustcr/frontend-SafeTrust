import { fireEvent, render, screen } from "@testing-library/react";
import {
  InterestedPeopleTable,
  type RentalOffer,
} from "./InterestedPeopleTable";

const offers: RentalOffer[] = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  tenant_id: `tenant-${index + 1}`,
  tenant_name: `Tenant ${index + 1}`,
  tenant_phone: null,
  tenant_wallet_address: null,
  offer_date: "2026-01-15T00:00:00.000Z",
  bid_status: "pending",
}));

const currentPages = () =>
  screen
    .getAllByRole("button", { name: /^Page \d+$/ })
    .filter((page) => page.getAttribute("aria-current") === "page");

describe("InterestedPeopleTable pagination", () => {
  it("labels each page and marks only the current one", () => {
    render(
      <InterestedPeopleTable offers={offers} totalCount={offers.length} />,
    );

    const first = screen.getByRole("button", { name: "Page 1" });
    const second = screen.getByRole("button", { name: "Page 2" });

    expect(first).toHaveAttribute("aria-current", "page");
    expect(second).not.toHaveAttribute("aria-current");
    expect(currentPages()).toHaveLength(1);

    fireEvent.click(second);

    expect(second).toHaveAttribute("aria-current", "page");
    expect(first).not.toHaveAttribute("aria-current");
    expect(currentPages()).toHaveLength(1);
  });
});

describe("InterestedPeopleTable actions", () => {
  const handlers = () => ({
    onAcceptOffer: jest.fn(),
    onRejectOffer: jest.fn(),
    onViewTenant: jest.fn(),
  });

  it("names every action after the guest and starts with the visible text", () => {
    render(
      <InterestedPeopleTable
        offers={offers.slice(0, 2)}
        totalCount={2}
        {...handlers()}
      />,
    );

    for (const [visible, label] of [
      ["Accept", "Accept offer from Tenant 1"],
      ["Reject", "Reject offer from Tenant 1"],
      ["View profile", "View profile of Tenant 1"],
    ]) {
      const buttons = screen.getAllByRole("button", { name: label });
      expect(buttons).toHaveLength(2);
      for (const button of buttons) {
        expect(button).toHaveTextContent(visible);
        expect(button.getAttribute("aria-label")).toMatch(
          new RegExp(`^${visible}`),
        );
      }
    }
    expect(
      screen.getAllByRole("button", { name: "Accept offer from Tenant 2" }),
    ).toHaveLength(2);
  });

  it("calls the handlers with the offer and disables decided offers", () => {
    const h = handlers();
    render(
      <InterestedPeopleTable
        offers={[offers[0], { ...offers[1], bid_status: "accepted" as const }]}
        totalCount={2}
        {...h}
      />,
    );

    fireEvent.click(
      screen.getAllByRole("button", { name: "Accept offer from Tenant 1" })[1],
    );
    fireEvent.click(
      screen.getAllByRole("button", { name: "Reject offer from Tenant 1" })[1],
    );
    fireEvent.click(
      screen.getAllByRole("button", { name: "View profile of Tenant 1" })[1],
    );
    expect(h.onAcceptOffer).toHaveBeenCalledWith(1);
    expect(h.onRejectOffer).toHaveBeenCalledWith(1);
    expect(h.onViewTenant).toHaveBeenCalledWith("tenant-1");

    for (const button of screen.getAllByRole("button", {
      name: /offer from Tenant 2/,
    })) {
      expect(button).toBeDisabled();
    }
  });

  it("shows the empty message on both layouts", () => {
    render(<InterestedPeopleTable offers={[]} totalCount={0} />);
    expect(screen.getAllByText("No offers found.")).toHaveLength(2);
  });
});
