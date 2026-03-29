"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

interface InvoiceHeaderProps {
  invoiceNumber: string;
  status: string;
}

export const InvoiceHeader = ({ invoiceNumber, status }: InvoiceHeaderProps) => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
        {invoiceNumber}
      </h1>
      <Badge
        className="bg-rose-500 hover:bg-rose-600 text-white border-transparent px-4 py-1.5 rounded-full text-sm font-medium capitalize"
      >
        {status}
      </Badge>
    </div>
  );
};
