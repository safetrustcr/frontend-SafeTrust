import { useQuery } from "@tanstack/react-query";
import {
  GetEscrowsFromIndexerBySignerParams,
  useGetEscrowsFromIndexerBySigner,
} from "@trustless-work/escrow";
import { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";

interface UseEscrowsBySignerQueryParams
  extends GetEscrowsFromIndexerBySignerParams {
  enabled?: boolean;
  validateOnChain?: boolean;
}

/**
 * Use the query to get the escrows by signer
 *
 * @param params - The parameters for the query
 * @returns The query result
 */
export const useEscrowsBySignerQuery = ({
  signer,
  isActive,
  page,
  orderDirection,
  orderBy,
  startDate,
  endDate,
  maxAmount,
  minAmount,
  title,
  engagementId,
  status,
  type,
  enabled = true,
  validateOnChain = true,
}: UseEscrowsBySignerQueryParams) => {
  const { getEscrowsBySigner } = useGetEscrowsFromIndexerBySigner();

  // Get the escrows by signer
  return useQuery({
    queryKey: [
      "escrows",
      signer,
      isActive,
      page,
      orderDirection,
      orderBy,
      startDate,
      endDate,
      maxAmount,
      minAmount,
      title,
      engagementId,
      status,
      type,
      validateOnChain,
    ],
    queryFn: async (): Promise<Escrow[]> => {
      /**
       * Call the query to get the escrows from the Trustless Work Indexer
       *
       * @param params - The parameters for the query
       * @returns The query result
       */
      const escrows = await getEscrowsBySigner({
        signer,
        isActive,
        page,
        orderDirection,
        orderBy,
        startDate,
        endDate,
        maxAmount,
        minAmount,
        title,
        engagementId,
        status,
        type,
        validateOnChain,
      });

      if (!escrows) {
        throw new Error("Failed to fetch escrows");
      }

      return escrows;
    },
    enabled: enabled && !!signer,
    staleTime: 1000 * 60 * 5, // 5 min
  });
};
