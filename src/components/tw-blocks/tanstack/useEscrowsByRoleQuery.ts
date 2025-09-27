import { useQuery } from "@tanstack/react-query";
import {
  GetEscrowsFromIndexerByRoleParams,
  useGetEscrowsFromIndexerByRole,
} from "@trustless-work/escrow";
import { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";

type UseEscrowsByRoleQueryParams = Omit<
  GetEscrowsFromIndexerByRoleParams,
  "role"
> & {
  role?: GetEscrowsFromIndexerByRoleParams["role"];
  enabled?: boolean;
  validateOnChain?: boolean;
};

/**
 * Use the query to get the escrows by role
 *
 * @param params - The parameters for the query
 * @returns The query result
 */
export const useEscrowsByRoleQuery = ({
  role,
  roleAddress,
  isActive = true,
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
}: UseEscrowsByRoleQueryParams) => {
  // Get the escrows by role
  const { getEscrowsByRole } = useGetEscrowsFromIndexerByRole();

  return useQuery({
    queryKey: [
      "escrows",
      roleAddress,
      role,
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
      if (!role) {
        throw new Error("Role is required to fetch escrows by role");
      }

      /**
       * Call the query to get the escrows from the Trustless Work Indexer
       *
       * @param params - The parameters for the query
       * @returns The query result
       */
      const escrows = await getEscrowsByRole({
        role,
        roleAddress,
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
    enabled: enabled && !!roleAddress && !!role,
    staleTime: 1000 * 60 * 5,
  });
};
