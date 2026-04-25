"use client";

import { Badge } from "@/components/ui/badge";

export type BidStatus = "pending" | "accepted" | "rejected";

interface BidStatusBadgeProps {
  status: BidStatus;
}

export function BidStatusBadge({ status }: BidStatusBadgeProps) {
  const variants: Record<BidStatus, { label: string; className: string }> = {
    pending: {
      label: "Pending",
      className: "bg-red-100 text-red-700 hover:bg-red-100",
    },
    accepted: {
      label: "Accepted",
      className: "bg-cyan-100 text-cyan-700 hover:bg-cyan-100",
    },
    rejected: {
      label: "Rejected",
      className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
    },
  };

  const config = variants[status] || variants.pending;

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}
