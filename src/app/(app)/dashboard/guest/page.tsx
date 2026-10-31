import dynamic from "next/dynamic";
import { Suspense } from "react";
import GuestDashboard from "@/components/dashboard/guest/GuestDashboard";

const HotelHeader = dynamic(() => import("@/components/listings/HotelHeader"));

export default function GuestDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <HotelHeader />
      </Suspense>
      <Suspense
        fallback={<main className="min-h-screen bg-background px-6 py-12" />}
      >
        <GuestDashboard />
      </Suspense>
    </div>
  );
}
