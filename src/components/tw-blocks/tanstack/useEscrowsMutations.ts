import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  EscrowType,
  FundEscrowPayload,
  InitializeMultiReleaseEscrowPayload,
  InitializeSingleReleaseEscrowPayload,
  UpdateMultiReleaseEscrowPayload,
  UpdateSingleReleaseEscrowPayload,
  useFundEscrow,
  useInitializeEscrow,
  useUpdateEscrow,
  ChangeMilestoneStatusPayload,
  useChangeMilestoneStatus,
  ApproveMilestonePayload,
  useApproveMilestone,
  useSendTransaction,
  useStartDispute,
  useReleaseFunds,
  useResolveDispute,
  MultiReleaseStartDisputePayload,
  SingleReleaseStartDisputePayload,
  MultiReleaseReleaseFundsPayload,
  SingleReleaseReleaseFundsPayload,
  MultiReleaseResolveDisputePayload,
  SingleReleaseResolveDisputePayload,
} from "@trustless-work/escrow";
import { signTransaction } from "../wallet-kit/wallet-kit";

/**
 * Optional hooks into a sign-and-send mutation (SafeTrust local modification).
 *
 * They let callers tell "nothing was sent" apart from "the signed transaction
 * may have landed", which is what makes booking escrow retries safe.
 */
export interface EscrowTxLifecycle {
  /** The unsigned transaction was built; the wallet prompt opens next. */
  onAwaitingSignature?: () => void;
  /** Runs after signing, before sending. Throw here to abort (nothing is sent). */
  beforeSubmit?: () => void;
  /** The signed transaction is about to be sent. Persist this before awaiting. */
  onSubmitted?: (signedTxXdr: string) => void;
}

/**
 * Use the mutations to interact with the escrows
 *
 * - Deploy Escrow
 * - Update Escrow
 * - Fund Escrow
 * - Change Milestone Status
 * - Approve Milestone
 * - Start Dispute
 * - Release Funds
 * - Resolve Dispute
 */
export const useEscrowsMutations = () => {
  const queryClient = useQueryClient();
  const { deployEscrow } = useInitializeEscrow();
  const { updateEscrow } = useUpdateEscrow();
  const { fundEscrow } = useFundEscrow();
  const { changeMilestoneStatus } = useChangeMilestoneStatus();
  const { approveMilestone } = useApproveMilestone();
  const { sendTransaction } = useSendTransaction();
  const { startDispute } = useStartDispute();
  const { releaseFunds } = useReleaseFunds();
  const { resolveDispute } = useResolveDispute();

  /**
   * Deploy Escrow
   */
  const deployEscrowMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
      address,
      lifecycle,
    }: {
      payload:
        | InitializeSingleReleaseEscrowPayload
        | InitializeMultiReleaseEscrowPayload;
      type: EscrowType;
      address: string;
      lifecycle?: EscrowTxLifecycle;
    }) => {
      const { unsignedTransaction } = await deployEscrow(payload, type);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from deployEscrow response.",
        );
      }

      lifecycle?.onAwaitingSignature?.();

      const signedTxXdr = await signTransaction({
        unsignedTransaction,
        address,
      });

      if (!signedTxXdr) {
        throw new Error("Signed transaction is missing.");
      }

      lifecycle?.beforeSubmit?.();
      lifecycle?.onSubmitted?.(signedTxXdr);

      const response = await sendTransaction(signedTxXdr);

      if (response.status !== "SUCCESS") {
        throw new Error("Transaction failed to send");
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Update Escrow
   */
  const updateEscrowMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
      address,
    }: {
      payload:
        UpdateSingleReleaseEscrowPayload | UpdateMultiReleaseEscrowPayload;
      type: EscrowType;
      address: string;
    }) => {
      const { unsignedTransaction } = await updateEscrow(payload, type);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from updateEscrow response.",
        );
      }

      const signedTxXdr = await signTransaction({
        unsignedTransaction,
        address,
      });

      if (!signedTxXdr) {
        throw new Error("Signed transaction is missing.");
      }

      const response = await sendTransaction(signedTxXdr);

      if (response.status !== "SUCCESS") {
        throw new Error("Transaction failed to send");
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Fund Escrow
   */
  const fundEscrowMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
      address,
      lifecycle,
    }: {
      payload: FundEscrowPayload;
      type: EscrowType;
      address: string;
      lifecycle?: EscrowTxLifecycle;
    }) => {
      // Step 1: Get unsigned transaction
      const { unsignedTransaction } = await fundEscrow(payload, type);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from fundEscrow response.",
        );
      }

      lifecycle?.onAwaitingSignature?.();

      // Step 2: Sign transaction
      const signedTxXdr = await signTransaction({
        unsignedTransaction,
        address,
      });

      if (!signedTxXdr) {
        throw new Error("Signed transaction is missing.");
      }

      lifecycle?.beforeSubmit?.();
      lifecycle?.onSubmitted?.(signedTxXdr);

      // Step 3: Send transaction
      const response = await sendTransaction(signedTxXdr);

      if (response.status !== "SUCCESS") {
        throw new Error("Transaction failed to send");
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Approve Milestone
   */
  const approveMilestoneMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
      address,
    }: {
      payload: ApproveMilestonePayload;
      type: EscrowType;
      address: string;
    }) => {
      const { unsignedTransaction } = await approveMilestone(payload, type);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from approveMilestone response.",
        );
      }

      const signedTxXdr = await signTransaction({
        unsignedTransaction,
        address,
      });

      if (!signedTxXdr) {
        throw new Error("Signed transaction is missing.");
      }

      const response = await sendTransaction(signedTxXdr);

      if (response.status !== "SUCCESS") {
        throw new Error("Transaction failed to send");
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Change Milestone Status
   */
  const changeMilestoneStatusMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
      address,
    }: {
      payload: ChangeMilestoneStatusPayload;
      type: EscrowType;
      address: string;
    }) => {
      const { unsignedTransaction } = await changeMilestoneStatus(
        payload,
        type,
      );

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from changeMilestoneStatus response.",
        );
      }

      const signedTxXdr = await signTransaction({
        unsignedTransaction,
        address,
      });

      if (!signedTxXdr) {
        throw new Error("Signed transaction is missing.");
      }

      const response = await sendTransaction(signedTxXdr);

      if (response.status !== "SUCCESS") {
        throw new Error("Transaction failed to send");
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Start Dispute
   */
  const startDisputeMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
      address,
    }: {
      payload:
        MultiReleaseStartDisputePayload | SingleReleaseStartDisputePayload;
      type: EscrowType;
      address: string;
    }) => {
      const { unsignedTransaction } = await startDispute(payload, type);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from startDispute response.",
        );
      }

      const signedTxXdr = await signTransaction({
        unsignedTransaction,
        address,
      });

      if (!signedTxXdr) {
        throw new Error("Signed transaction is missing.");
      }

      const response = await sendTransaction(signedTxXdr);

      if (response.status !== "SUCCESS") {
        throw new Error("Transaction failed to send");
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Release Funds
   */
  const releaseFundsMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
      address,
    }: {
      payload:
        MultiReleaseReleaseFundsPayload | SingleReleaseReleaseFundsPayload;
      type: EscrowType;
      address: string;
    }) => {
      const { unsignedTransaction } = await releaseFunds(payload, type);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from releaseFunds response.",
        );
      }

      const signedTxXdr = await signTransaction({
        unsignedTransaction,
        address,
      });

      if (!signedTxXdr) {
        throw new Error("Signed transaction is missing.");
      }

      const response = await sendTransaction(signedTxXdr);

      if (response.status !== "SUCCESS") {
        throw new Error("Transaction failed to send");
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Resolve Dispute
   */
  const resolveDisputeMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
      address,
    }: {
      payload:
        MultiReleaseResolveDisputePayload | SingleReleaseResolveDisputePayload;
      type: EscrowType;
      address: string;
    }) => {
      const { unsignedTransaction } = await resolveDispute(payload, type);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from resolveDispute response.",
        );
      }

      const signedTxXdr = await signTransaction({
        unsignedTransaction,
        address,
      });

      if (!signedTxXdr) {
        throw new Error("Signed transaction is missing.");
      }

      const response = await sendTransaction(signedTxXdr);

      if (response.status !== "SUCCESS") {
        throw new Error("Transaction failed to send");
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return {
    deployEscrow: deployEscrowMutation,
    updateEscrow: updateEscrowMutation,
    fundEscrow: fundEscrowMutation,
    changeMilestoneStatus: changeMilestoneStatusMutation,
    approveMilestone: approveMilestoneMutation,
    startDispute: startDisputeMutation,
    releaseFunds: releaseFundsMutation,
    resolveDispute: resolveDisputeMutation,
  };
};
