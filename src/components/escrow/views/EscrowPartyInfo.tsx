"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StubEscrowBeneficiary, StubEscrowParty, StubEscrowTenant } from "./types";

type Variant = "tenant" | "owner" | "beneficiary";

type Props = {
  variant: Variant;
  tenant?: StubEscrowTenant;
  owner?: StubEscrowParty;
  beneficiary?: StubEscrowBeneficiary;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground break-words">{value}</dd>
    </div>
  );
}

export function EscrowPartyInfo({ variant, tenant, owner, beneficiary }: Props) {
  if (variant === "tenant" && tenant) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Tenant information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label="Name" value={tenant.name} />
          <Row label="Wallet" value={tenant.wallet} />
          <Row label="Email" value={tenant.email} />
          <Row label="Rental date" value={tenant.rentalDate} />
          <Row label="Deposit amount" value={tenant.depositAmount} />
        </CardContent>
      </Card>
    );
  }

  if (variant === "owner" && owner) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Owner information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label="Name" value={owner.name} />
          <Row label="Wallet" value={owner.wallet} />
          <Row label="Email" value={owner.email} />
        </CardContent>
      </Card>
    );
  }

  if (variant === "beneficiary" && beneficiary) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Beneficiary information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label="Name" value={beneficiary.name} />
          <Row label="Wallet address" value={beneficiary.wallet} />
          <Row label="Released date" value={beneficiary.releasedDate} />
          <Row label="Deposit amount" value={beneficiary.depositAmount} />
        </CardContent>
      </Card>
    );
  }

  return null;
}
