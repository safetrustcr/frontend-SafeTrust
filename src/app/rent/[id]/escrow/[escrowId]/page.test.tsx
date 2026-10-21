import { render, screen } from "@testing-library/react";
import { stellarExpertContractUrl } from "@/features/escrow/config";
import RentalEscrowReferencePage from "./page";

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "1", escrowId: "C123" }),
}));

describe("RentalEscrowReferencePage", () => {
  it("does not present mock data as verified escrow status", () => {
    render(<RentalEscrowReferencePage />);

    expect(
      screen.getByRole("heading", { name: "Escrow status is not verified here" }),
    ).toBeInTheDocument();
    expect(screen.getByText("C123")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /verify contract on stellar expert/i }),
    ).toHaveAttribute("href", stellarExpertContractUrl("C123"));
    expect(screen.queryByText("Booking confirmed")).not.toBeInTheDocument();
  });
});
