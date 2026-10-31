import { getStubEscrow, DEMO_SOROBAN_CONTRACT_ID } from "./stubEscrow";

describe("getStubEscrow", () => {
  it("preserves row ID and assigns valid Soroban contract ID for demo records", () => {
    const demoEscrow = getStubEscrow("demo-escrow-0001");
    expect(demoEscrow.id).toBe("demo-escrow-0001");
    expect(demoEscrow.contractId).toBe(DEMO_SOROBAN_CONTRACT_ID);
  });

  it("assigns valid Soroban contract ID for escrow_* demo IDs", () => {
    const escrow = getStubEscrow("escrow_1");
    expect(escrow.id).toBe("escrow_1");
    expect(escrow.contractId).toBe(DEMO_SOROBAN_CONTRACT_ID);
  });

  it("preserves contractId when escrowId is already a valid Soroban contract ID", () => {
    const validContractId =
      "CA3D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ";
    const escrow = getStubEscrow(validContractId);
    expect(escrow.id).toBe(validContractId);
    expect(escrow.contractId).toBe(validContractId);
  });

  it("leaves contractId undefined for non-demo, non-contract IDs like reservation or invoice numbers", () => {
    const reservation = getStubEscrow("res-1");
    expect(reservation.id).toBe("res-1");
    expect(reservation.contractId).toBeUndefined();

    const invoice = getStubEscrow("INV4257-09-012");
    expect(invoice.id).toBe("INV4257-09-012");
    expect(invoice.contractId).toBeUndefined();
  });
});
