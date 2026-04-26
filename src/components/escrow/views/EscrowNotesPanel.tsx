"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RealTimeEscrowStatus } from "@/components/escrow/RealTimeEscrowStatus";
import type { EscrowSubscriptionResult } from "@/hooks/useEscrowSubscription";

type Props = {
  escrowId: string;
  subscription: EscrowSubscriptionResult;
};

export function EscrowNotesPanel({ escrowId, subscription }: Props) {
  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Live status</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <RealTimeEscrowStatus escrowId={escrowId} subscription={subscription} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Internal notes and activity will appear here when connected to the
            activity feed.
          </p>
        </CardContent>
      </Card>
    </aside>
  );
}
