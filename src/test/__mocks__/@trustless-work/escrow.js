/**
 * Default Jest stub for @trustless-work/escrow.
 *
 * The published package declares a CommonJS build (dist/index.cjs) but ships
 * only ESM, so Jest cannot load the real module. This stub lets a test import
 * code that merely reaches the package, such as a page using the
 * @/features/escrow index. Calling any Trustless Work action throws: a test
 * that exercises the escrow flow must mock the package explicitly, e.g.
 *
 *   jest.mock("@trustless-work/escrow", () =>
 *     require("@/test/harness/escrow").trustlessWorkModule());
 */
const unavailable = (name) => () => {
  throw new Error(
    `@trustless-work/escrow ${name} is not available in unit tests; mock the package (see src/test/harness/escrow.tsx).`,
  );
};

const hook = (...methods) =>
  function useStubbedTrustlessWork() {
    return Object.fromEntries(methods.map((m) => [m, unavailable(m)]));
  };

module.exports = {
  TrustlessWorkConfig: ({ children }) => children,
  useInitializeEscrow: hook("deployEscrow"),
  useFundEscrow: hook("fundEscrow"),
  useSendTransaction: hook("sendTransaction"),
  useGetEscrowsFromIndexerBySigner: hook("getEscrowsBySigner"),
  useUpdateFromTxHash: hook("updateFromTxHash"),
  useUpdateEscrow: hook("updateEscrow"),
  useChangeMilestoneStatus: hook("changeMilestoneStatus"),
  useApproveMilestone: hook("approveMilestone"),
  useStartDispute: hook("startDispute"),
  useReleaseFunds: hook("releaseFunds"),
  useResolveDispute: hook("resolveDispute"),
};
