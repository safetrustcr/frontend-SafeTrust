"use client";

import { useParams } from "next/navigation";
import { EscrowStatusView } from "@/features/escrow";

export default function RentalEscrowReferencePage() {
  const { id, escrowId } = useParams<{ id: string; escrowId: string }>();

  return (
    <EscrowStatusView
      rentalId={id || "1"}
      escrowId={escrowId || "demo-escrow"}
    />
  );
}
