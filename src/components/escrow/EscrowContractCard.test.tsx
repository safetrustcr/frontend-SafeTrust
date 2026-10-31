import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EscrowContractCard } from "./EscrowContractCard";
import {
  STELLAR_NETWORK,
  stellarExpertContractUrl,
} from "@/features/escrow/config";

const VALID_CONTRACT_ID =
  "CA3D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ";

describe("EscrowContractCard", () => {
  const originalClipboard = navigator.clipboard;

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    Object.assign(navigator, { clipboard: originalClipboard });
  });

  it("renders contract ID, network, and stellar.expert link for a valid contract ID", () => {
    render(<EscrowContractCard contractId={VALID_CONTRACT_ID} />);

    expect(
      screen.getByRole("heading", { name: /^contract$/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(VALID_CONTRACT_ID)).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(STELLAR_NETWORK, "i")),
    ).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /view on stellar\.expert/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      stellarExpertContractUrl(VALID_CONTRACT_ID),
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("copies the contract ID when clicking the copy button", async () => {
    render(<EscrowContractCard contractId={VALID_CONTRACT_ID} />);

    const copyBtn = screen.getByRole("button", { name: /copy id/i });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      VALID_CONTRACT_ID,
    );
    await waitFor(() =>
      expect(screen.getByText(/copied!/i)).toBeInTheDocument(),
    );
  });

  it.each([undefined, null, ""])(
    "shows unavailable message and no link when contractId is %p (missing)",
    (contractId) => {
      render(<EscrowContractCard contractId={contractId} />);

      expect(
        screen.getByText(
          /the on-chain contract isn't available yet\. it appears here once the escrow is created\./i,
        ),
      ).toBeInTheDocument();
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.queryByText(/contract id/i)).not.toBeInTheDocument();
    },
  );

  it.each([
    "res-1",
    "INV4257-09-012",
    "BK10293",
    "contract_12345",
    "C123", // too short
    "GA3D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ", // starts with G (account, not contract)
    "CA3D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCC1", // contains '1' (invalid base32)
    "ca3d5krymcmfzvacnohqpb2dbqlprdhtph5vffh75bltxftryvvpoccz", // lowercase
  ])(
    "shows unavailable message and no link when contractId is invalid: %s",
    (invalidId) => {
      render(<EscrowContractCard contractId={invalidId} />);

      expect(
        screen.getByText(
          /the on-chain contract isn't available yet\. it appears here once the escrow is created\./i,
        ),
      ).toBeInTheDocument();
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.queryByText(invalidId)).not.toBeInTheDocument();
    },
  );

  it("points to the configured network URL", () => {
    render(<EscrowContractCard contractId={VALID_CONTRACT_ID} />);

    const link = screen.getByRole("link", { name: /view on stellar\.expert/i });
    expect(link.getAttribute("href")).toBe(
      `https://stellar.expert/explorer/${STELLAR_NETWORK}/contract/${VALID_CONTRACT_ID}`,
    );
  });
});
