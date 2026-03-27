"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Shown when escrow is still pending signature / deployment.
 * Users are redirected here from the escrow detail route until signing completes.
 */
export default function HotelEscrowCreatePage() {
  const params = useParams<{ id: string }>();
  const hotelId = params.id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Complete escrow signing</CardTitle>
          <CardDescription>
            Hotel ID: {hotelId}. Signing has not finished yet. Continue the create
            flow to deploy your escrow, then return to the detail page to track
            status.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/dashboard/hotel/create-escrow`}>Create escrow</Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href={`/dashboard/hotel`}>Hotel dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
