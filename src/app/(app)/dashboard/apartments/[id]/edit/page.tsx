import { DashboardGlassCard } from "@/components/dashboard/ui/DashboardGlassCard";
import { ApartmentEditor } from "@/components/dashboard/apartments/ApartmentEditor";

export default async function EditApartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <DashboardGlassCard className="p-4 sm:p-6 lg:p-8">
      <ApartmentEditor apartmentId={id} />
    </DashboardGlassCard>
  );
}
