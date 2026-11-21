import { clientEnv } from "@/config/env";

export function DemoBanner() {
  if (clientEnv.NEXT_PUBLIC_DEMO_MODE !== "true") return null;

  // The banner must never assume the network: a production build without an
  // explicit NEXT_PUBLIC_TRUSTLESS_NETWORK runs on mainnet and moves real USDC.
  const mainnet = clientEnv.NEXT_PUBLIC_TRUSTLESS_NETWORK === "mainnet";

  return (
    <div
      role="note"
      className="bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200"
    >
      You&apos;re viewing SafeTrust with <strong>demo listings</strong>.{" "}
      {mainnet ? (
        <>
          Bookings and payments use the Stellar <strong>mainnet</strong> — real
          USDC.
        </>
      ) : (
        <>
          Bookings and payments use the Stellar <strong>testnet</strong> — test
          money only.
        </>
      )}
    </div>
  );
}
