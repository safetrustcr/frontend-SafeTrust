import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  PlatformReleasesView,
  type ApprovedEscrowItem,
} from "./PlatformReleasesView";

describe("PlatformReleasesView", () => {
  const mockEscrows: ApprovedEscrowItem[] = [
    {
      id: "escrow-101",
      contractId: "CA3D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ",
      listingName: "La Sabana Luxury Suite",
      amount: 4000,
      currency: "USDC",
      guestAddress: "GBGUESTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      hostAddress: "GBHOSTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      approvedAt: "2025-02-15",
    },
  ];

  it("renders empty state when there are no escrows", () => {
    render(<PlatformReleasesView escrows={[]} onRelease={jest.fn()} />);

    expect(
      screen.getByText("Platform Releases (Option A)"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("All approved escrows have been released"),
    ).toBeInTheDocument();
  });

  it("renders approved escrows and triggers release callback", () => {
    const onRelease = jest.fn();
    render(
      <PlatformReleasesView escrows={mockEscrows} onRelease={onRelease} />,
    );

    expect(screen.getByText("La Sabana Luxury Suite")).toBeInTheDocument();
    expect(screen.getByText("4,000 USDC")).toBeInTheDocument();
    expect(screen.getByText("1 pending release")).toBeInTheDocument();

    const releaseBtn = screen.getByRole("button", { name: /release funds/i });
    fireEvent.click(releaseBtn);

    expect(onRelease).toHaveBeenCalledWith(mockEscrows[0]);
  });
});
