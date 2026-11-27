import { Globe } from "lucide-react";

import { clientEnv } from "@/config/env";
import { cn } from "@/lib/utils";

export type NetworkChipName = "testnet" | "mainnet";

/**
 * Labels the Stellar network a payment will use. The visible text ("Testnet" /
 * "Mainnet") carries the meaning on its own, so the chip never depends on
 * colour to be understood (WCAG 1.4.1). Pass `network` only to override the
 * config value (e.g. in tests); production reads the effective network.
 */
export function NetworkChip({
  network,
  className,
}: {
  network?: NetworkChipName;
  className?: string;
}) {
  const name = network ?? clientEnv.NEXT_PUBLIC_TRUSTLESS_NETWORK;
  const mainnet = name === "mainnet";

  return (
    <span
      data-testid="network-chip"
      data-network={name}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
        mainnet
          ? "border-amber-500/60 bg-amber-100 text-amber-900 dark:border-amber-400/50 dark:bg-amber-950 dark:text-amber-200"
          : "border-emerald-600/50 bg-emerald-100 text-emerald-900 dark:border-emerald-400/50 dark:bg-emerald-950 dark:text-emerald-200",
        className,
      )}
    >
      <Globe aria-hidden="true" className="h-3 w-3 shrink-0" />
      {mainnet ? "Mainnet" : "Testnet"}
    </span>
  );
}
