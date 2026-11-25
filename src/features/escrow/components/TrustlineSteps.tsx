import { getUsdcTrustlineAddress, STELLAR_NETWORK } from "../config";
import { cn } from "@/lib/utils";

const shortIssuer = (issuer: string) =>
  issuer.length > 12 ? `${issuer.slice(0, 4)}…${issuer.slice(-4)}` : issuer;

/**
 * Short, wallet-agnostic steps to add the USDC trustline for the active
 * network. Shared by the guest checklist and the host payout banner.
 */
export function TrustlineSteps({
  finalStep,
  showFaucetHint = false,
  className,
}: {
  /** What to do once the trustline is added (e.g. "select Check again"). */
  finalStep: string;
  /** Testnet only: where to get test USDC. */
  showFaucetHint?: boolean;
  className?: string;
}) {
  const issuer = getUsdcTrustlineAddress();

  return (
    <div className={cn("space-y-2 text-sm", className)}>
      <ol className="list-decimal space-y-1 pl-5 text-foreground">
        <li>Open your Stellar wallet (Freighter, xBull, Lobstr…).</li>
        <li>
          Go to <span className="font-medium">Manage assets</span> and add{" "}
          <span className="font-medium">USDC</span>
          {issuer ? (
            <>
              {" "}
              issued by{" "}
              <code
                className="break-all rounded bg-muted px-1 font-mono text-xs"
                title={issuer}
              >
                {shortIssuer(issuer)}
              </code>
            </>
          ) : null}
          .
        </li>
        <li>Approve the trustline. It reserves 0.5 XLM in your wallet.</li>
        <li>{finalStep}</li>
      </ol>
      {showFaucetHint && <TestnetFaucetHint />}
    </div>
  );
}

/** Where to get test USDC. Renders nothing off testnet. */
export function TestnetFaucetHint() {
  if (STELLAR_NETWORK !== "testnet") return null;
  return (
    <p className="text-muted-foreground" data-testid="testnet-faucet-hint">
      On testnet, get free test USDC from{" "}
      <a
        href="https://faucet.circle.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline"
      >
        faucet.circle.com
      </a>{" "}
      after adding the trustline.
    </p>
  );
}
