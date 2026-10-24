"use client";

import { Badge } from "@/components/ui/badge";
import { CLAIMS_AVAILABLE } from "@/features/escrow/claims";
import { ClaimsPanel } from "./ClaimsPanel";
import { EscrowJustification } from "./EscrowJustification";
import { EscrowPartyInfo } from "./EscrowPartyInfo";
import { EscrowProcessStepper } from "./EscrowProcessStepper";
import type { StubEscrowDetail } from "@/types/escrow";

export function EscrowReleasedView({ data }: { data: StubEscrowDetail }) {
  return (
    <div className="space-y-8">
      <EscrowProcessStepper view="released" />

      <header className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Deposit / Escrow released
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {data.invoiceNumber}
            </span>
            <Badge className="border-transparent bg-emerald-600 text-white hover:bg-emerald-600">
              Deposit released
            </Badge>
          </div>
        </div>
      </header>

      <EscrowJustification value={data.escrowJustification} />

      <EscrowPartyInfo variant="beneficiary" beneficiary={data.beneficiary} />

      <ClaimsPanel
        escrowId={data.id}
        placeholder={data.claimsPlaceholder}
        available={CLAIMS_AVAILABLE}
      />

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">
          Beneficiary contact
        </h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Phone</dt>
            <dd className="mt-1">{data.beneficiary.phone}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Email</dt>
            <dd className="mt-1 break-all">{data.beneficiary.email}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
