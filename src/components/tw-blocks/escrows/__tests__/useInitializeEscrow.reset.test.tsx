/**
 * Local modification (see tw-blocks/README.md): the initialize-escrow forms
 * reset only after a successful deploy. A failed or rejected deploy must
 * keep what the user typed.
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import { Keypair } from "stellar-sdk";
import { useInitializeEscrow as useSingleRelease } from "../single-release/initialize-escrow/form/useInitializeEscrow";
import { useInitializeEscrow as useMultiRelease } from "../multi-release/initialize-escrow/form/useInitializeEscrow";

const mockMutateAsync = jest.fn();
const mockWallet = Keypair.random().publicKey();

jest.mock("@/components/tw-blocks/tanstack/useEscrowsMutations", () => ({
  useEscrowsMutations: () => ({
    deployEscrow: { mutateAsync: mockMutateAsync },
  }),
}));
jest.mock("@/components/tw-blocks/wallet-kit/WalletProvider", () => ({
  useWalletContext: () => ({ walletAddress: mockWallet }),
}));
jest.mock("@/components/tw-blocks/providers/EscrowProvider", () => ({
  useEscrowContext: () => ({ setSelectedEscrow: jest.fn() }),
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

beforeEach(() => mockMutateAsync.mockReset());

/** The part of both hooks this test drives (their form types differ). */
type InitializeEscrowHook = () => {
  form: { getValues: (field: "engagementId" | "title") => unknown };
  fillTemplateForm: () => void;
  handleSubmit: () => Promise<void>;
  isSubmitting: boolean;
};

describe.each<[string, InitializeEscrowHook]>([
  ["single-release", useSingleRelease as unknown as InitializeEscrowHook],
  ["multi-release", useMultiRelease as unknown as InitializeEscrowHook],
])("%s initialize-escrow form", (_type, useHook) => {
  async function submitFilledForm() {
    const { result } = renderHook(() => useHook());
    act(() => result.current.fillTemplateForm());
    await waitFor(() =>
      expect(result.current.form.getValues("engagementId")).toBe("ENG-001"),
    );
    await act(async () => {
      await result.current.handleSubmit();
    });
    return result;
  }

  it("keeps the input when the wallet rejects the signature", async () => {
    mockMutateAsync.mockRejectedValueOnce({
      code: -4,
      message: "User declined access",
    });
    const result = await submitFilledForm();

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    expect(result.current.form.getValues("engagementId")).toBe("ENG-001");
    expect(result.current.form.getValues("title")).toBe("Design Landing Page");
    expect(result.current.isSubmitting).toBe(false);
  });

  it("resets the form after a successful deploy", async () => {
    mockMutateAsync.mockResolvedValueOnce({
      status: "SUCCESS",
      contractId: "C1",
    });
    const result = await submitFilledForm();

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    expect(result.current.form.getValues("engagementId")).toBe("");
  });
});
