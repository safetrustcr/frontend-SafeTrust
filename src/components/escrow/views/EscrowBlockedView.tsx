"use client";

import { Badge } from "@/components/ui/badge";
import { formatEscrowAmount } from "@/lib/formatEscrowAmount";
import { EscrowPartyInfo } from "./EscrowPartyInfo";
import { EscrowProcessStepper } from "./EscrowProcessStepper";
import type { StubEscrowDetail } from "./types";

export function EscrowBlockedView({ data }: { data: StubEscrowDetail }) {
  return (
    <div className="space-y-8">
      <EscrowProcessStepper view="blocked" />

      <header className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            {data.paymentBatchTitle} — Escrow status
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{data.invoiceNumber}</span>
            <Badge className="border-transparent bg-blue-600 text-white hover:bg-blue-600">
              Deposit blocked
            </Badge>
          </div>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Escrow description
        </h2>
        <div className="rounded-lg border border-border bg-card p-4 text-sm">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Creation date</dt>
              <dd className="mt-1 font-medium">{data.createdAt}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Amount blocked</dt>
              <dd className="mt-1 font-medium tabular-nums">
                {formatEscrowAmount(data.amount, data.currency)}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <EscrowPartyInfo variant="tenant" tenant={data.tenant} />
        <EscrowPartyInfo variant="owner" owner={data.owner} />
      </div>
    </div>
  );
}
