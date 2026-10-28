import dynamic from "next/dynamic";
import { Suspense } from "react";
import GuestDashboard from "@/components/dashboard/guest/GuestDashboard";

const HotelHeader = dynamic(() => import("@/components/listings/HotelHeader"));

export default function GuestDashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={null}>
        <HotelHeader />
      </Suspense>
      <Suspense
        fallback={
          <main className="min-h-screen bg-white px-6 py-12 dark:bg-slate-900" />
        }
      >
        <GuestDashboard />
      </Suspense>
    </div>
  );
}
