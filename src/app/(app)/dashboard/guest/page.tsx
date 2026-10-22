import dynamic from "next/dynamic";
import HotelHeader from "@/components/listings/HotelHeader";

const GuestDashboardClient = dynamic(
  () => import("@/components/dashboard/guest/GuestDashboard"),
);

export default function GuestDashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <HotelHeader />
      <GuestDashboardClient />
    </div>
  );
}
