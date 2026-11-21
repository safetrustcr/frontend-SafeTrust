import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { EscrowLifecycleDemo } from "@/features/escrow";

export const metadata: Metadata = {
  title: "Escrow Lifecycle Demo | SafeTrust",
  description:
    "Interactive testbench demonstrating the Trustless Work escrow lifecycle, role-based action panels, release options, and dispute resolution.",
};

export default function EscrowLifecycleDemoPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 text-sm w-fit">
        <Link
          href="/dashboard/escrow"
          className="flex items-center gap-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Escrows
        </Link>
      </div>

      <EscrowLifecycleDemo />
    </div>
  );
}
