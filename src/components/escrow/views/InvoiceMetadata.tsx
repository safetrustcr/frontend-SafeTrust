"use client";

import type { StubEscrowDetail } from "./types";

type Props = Pick<
  StubEscrowDetail,
  "invoiceNumber" | "subject" | "currency" | "issued" | "dueDate" | "notes"
>;

export function InvoiceMetadata({
  invoiceNumber,
  subject,
  currency,
  issued,
  dueDate,
  notes,
}: Props) {
  const rows: { label: string; value: string }[] = [
    { label: "Invoice Number", value: invoiceNumber },
    { label: "Subject", value: subject },
    { label: "Currency", value: currency },
    { label: "Issued", value: issued },
    { label: "Due date", value: dueDate },
    { label: "Notes", value: notes },
  ];

  return (
    <div className="rounded-lg border border-border bg-card">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className="border-b border-border last:border-b-0"
            >
              <th className="w-[40%] px-4 py-3 text-left font-medium text-muted-foreground">
                {row.label}
              </th>
              <td className="px-4 py-3 text-foreground">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
