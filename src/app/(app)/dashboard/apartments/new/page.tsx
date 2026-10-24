import { DashboardGlassCard } from "@/components/dashboard/ui/DashboardGlassCard";
import { ApartmentEditor } from "@/components/dashboard/apartments/ApartmentEditor";

export default function NewApartmentPage() {
  return (
    <DashboardGlassCard className="p-4 sm:p-6 lg:p-8">
      <ApartmentEditor />
    </DashboardGlassCard>
  );
}
