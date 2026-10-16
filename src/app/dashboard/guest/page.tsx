import GuestDashboard from "@/components/dashboard/guest/GuestDashboard";
import { HotelHeader } from "@/features/listings";

export default function GuestDashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <HotelHeader />
      <GuestDashboard />
    </div>
  );
}
