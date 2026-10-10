import { DashboardGlassCard } from "@/components/dashboard/ui/DashboardGlassCard";
import { NewApartmentForm } from "@/components/dashboard/apartments/NewApartmentForm";

export default function NewApartmentPage() {
  return (
    <DashboardGlassCard className="p-4 sm:p-6 lg:p-8">
      <NewApartmentForm />
    </DashboardGlassCard>
  );
}
