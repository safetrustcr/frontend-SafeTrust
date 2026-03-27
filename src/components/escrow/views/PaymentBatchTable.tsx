"use client";

import type { StubEscrowProductRow } from "./types";

type Props = {
  products: StubEscrowProductRow[];
  subtotal: string;
  discount: string;
  total: string;
};

export function PaymentBatchTable({
  products,
  subtotal,
  discount,
  total,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left">
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">Price per month</th>
            <th className="px-4 py-3 font-medium">Deposit</th>
          </tr>
        </thead>
        <tbody>
          {products.map((row) => (
            <tr key={row.product} className="border-b border-border last:border-b-0">
              <td className="px-4 py-3">{row.product}</td>
              <td className="px-4 py-3 tabular-nums">{row.pricePerMonth}</td>
              <td className="px-4 py-3 tabular-nums">{row.deposit}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-muted/30">
            <td colSpan={2} className="px-4 py-2 text-right font-medium">
              Subtotal
            </td>
            <td className="px-4 py-2 tabular-nums">{subtotal}</td>
          </tr>
          <tr>
            <td colSpan={2} className="px-4 py-2 text-right font-medium">
              Discount
            </td>
            <td className="px-4 py-2 tabular-nums">{discount}</td>
          </tr>
          <tr className="font-semibold">
            <td colSpan={2} className="px-4 py-3 text-right">
              Total
            </td>
            <td className="px-4 py-3 tabular-nums">{total}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
