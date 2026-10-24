"use client";

import { DashboardGlassCard } from "@/components/dashboard/ui/DashboardGlassCard";
import { notFound, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { DemoBadge } from "@/components/ui/demo-badge";
import { HotelForm } from "@/components/dashboard/hotels/HotelForm";
import {
  DEMO_SAVED_MESSAGE,
  useDemoHotelStore,
  type HotelDraft,
} from "@/features/hotels/manage";

export default function EditHotelPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const hotel = useDemoHotelStore((s) =>
    s.hotels.find((h) => h.id === params.id),
  );
  const update = useDemoHotelStore((s) => s.update);

  if (!hotel) {
    notFound();
  }

  const handleSubmit = (draft: HotelDraft) => {
    update(hotel.id, draft);
    toast.success(DEMO_SAVED_MESSAGE);
    router.push("/dashboard/hotels");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard/hotels"
        className="flex items-center gap-2 text-sm
                   text-gray-400 hover:text-white transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Hotels
      </Link>

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          Edit Hotel <DemoBadge />
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update details for hotel #{hotel.id}. Changes aren&apos;t saved.
        </p>
      </div>

      <DashboardGlassCard className="p-4 sm:p-6">
        <HotelForm
          key={hotel.id}
          initial={hotel}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
        />
      </DashboardGlassCard>
    </div>
  );
}
