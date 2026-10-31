"use client";

import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import {
  STELLAR_NETWORK,
  stellarExpertContractUrl,
} from "@/features/escrow/config";
import { CopyButton } from "@/components/ui/copy-button";

const SOROBAN_CONTRACT_ID = /^C[A-Z2-7]{55}$/;

export function EscrowContractCard({
  contractId,
}: {
  contractId?: string | null;
}) {
  const valid = Boolean(contractId && SOROBAN_CONTRACT_ID.test(contractId));

  useEffect(() => {
    const handleHash = () => {
      if (
        typeof window !== "undefined" &&
        window.location.hash === "#contract"
      ) {
        const el = document.getElementById("contract");
        if (el) {
          el.scrollIntoView();
          el.focus();
        }
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  return (
    <section
      id="contract"
      tabIndex={-1}
      aria-labelledby="contract-heading"
      className="scroll-mt-24 rounded-lg border border-border bg-card p-4 outline-none"
    >
      <h2 id="contract-heading" className="text-sm font-semibold">
        Contract
      </h2>
      {valid ? (
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Contract ID</dt>
            <dd className="mt-1 flex items-center justify-between gap-2 break-all font-mono">
              <span>{contractId}</span>
              <CopyButton text={contractId!} label="Copy ID" />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Network</dt>
            <dd className="mt-1 capitalize">{STELLAR_NETWORK}</dd>
          </div>
          <div className="sm:col-span-2">
            <a
              href={stellarExpertContractUrl(contractId!)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              View on stellar.expert
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </dl>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          The on-chain contract isn&apos;t available yet. It appears here once
          the escrow is created.
        </p>
      )}
    </section>
  );
}
