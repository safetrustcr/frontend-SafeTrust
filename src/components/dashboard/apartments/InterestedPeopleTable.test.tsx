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

describe("InterestedPeopleTable pagination", () => {
  it("labels each page and marks only the current one", () => {
    render(
      <InterestedPeopleTable offers={offers} totalCount={offers.length} />,
    );

    const first = screen.getByRole("button", { name: "Page 1" });
    const second = screen.getByRole("button", { name: "Page 2" });

    expect(first).toHaveAttribute("aria-current", "page");
    expect(second).not.toHaveAttribute("aria-current");

    fireEvent.click(second);

    expect(second).toHaveAttribute("aria-current", "page");
    expect(first).not.toHaveAttribute("aria-current");
  });
});
