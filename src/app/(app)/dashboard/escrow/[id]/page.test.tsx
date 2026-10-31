import { render, screen } from "@testing-library/react";
import EscrowDetailPage from "./page";

jest.mock("@/components/escrow/EscrowOverviewCard", () => ({
  EscrowOverviewCard: () => <div data-testid="overview-card" />,
}));

describe("EscrowDetailPage", () => {
  it("renders EscrowContractCard after EscrowOverviewCard with unavailable message for non-contract IDs", async () => {
    const Component = await EscrowDetailPage({
      params: Promise.resolve({ id: "res-1" }),
    });
    render(Component);

    expect(screen.getByTestId("overview-card")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^contract$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /the on-chain contract isn't available yet\. it appears here once the escrow is created\./i,
      ),
    ).toBeInTheDocument();
  });

  it("renders the contract ID and link when id is a valid Soroban contract ID", async () => {
    const validContractId =
      "CA3D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ";
    const Component = await EscrowDetailPage({
      params: Promise.resolve({ id: validContractId }),
    });
    const { container } = render(Component);

    const contractSection = container.querySelector("#contract");
    expect(contractSection).toBeInTheDocument();
    expect(contractSection).toHaveTextContent(validContractId);
    expect(
      screen.getByRole("link", { name: /view on stellar\.expert/i }),
    ).toBeInTheDocument();
  });

  it("renders the contract ID and link for demo escrow records loaded by row ID", async () => {
    const Component = await EscrowDetailPage({
      params: Promise.resolve({ id: "demo-escrow-0001" }),
    });
    const { container } = render(Component);

    const contractSection = container.querySelector("#contract");
    expect(contractSection).toBeInTheDocument();
    expect(contractSection).toHaveTextContent(
      "CA3D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ",
    );
    expect(
      screen.getByRole("link", { name: /view on stellar\.expert/i }),
    ).toBeInTheDocument();
  });
});
