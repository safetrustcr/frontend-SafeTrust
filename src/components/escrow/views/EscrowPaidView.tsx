"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EscrowProcessStepper } from "./EscrowProcessStepper";
import { InvoiceMetadata } from "./InvoiceMetadata";
import { PaymentBatchTable } from "./PaymentBatchTable";
import type { StubEscrowDetail } from "./types";

export function EscrowPaidView({ data }: { data: StubEscrowDetail }) {
  return (
    <div className="space-y-8">
      <EscrowProcessStepper view="paid" />

      <header className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            {data.paymentBatchTitle}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{data.invoiceNumber}</span>
            <Badge className="border-transparent bg-emerald-600 text-white hover:bg-emerald-600">
              Paid
            </Badge>
          </div>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Billing info
        </h2>
        <div className="rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-border">
                <th className="w-[40%] px-4 py-3 text-left font-medium text-muted-foreground">
                  Billed to
                </th>
                <td className="px-4 py-3">{data.billedTo}</td>
              </tr>
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Billing details
                </th>
                <td className="px-4 py-3">{data.billingDetails}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Invoice
        </h2>
        <InvoiceMetadata
          invoiceNumber={data.invoiceNumber}
          subject={data.subject}
          currency={data.currency}
          issued={data.issued}
          dueDate={data.dueDate}
          notes={data.notes}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Line items
        </h2>
        <PaymentBatchTable
          products={data.products}
          subtotal={data.subtotal}
          discount={data.discount}
          total={data.total}
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Terms &amp; conditions
        </h2>
        <p className="rounded-lg border border-border bg-muted/20 p-4 text-sm leading-relaxed text-foreground">
          {data.terms}
        </p>
      </section>

    </div>
  );
}
