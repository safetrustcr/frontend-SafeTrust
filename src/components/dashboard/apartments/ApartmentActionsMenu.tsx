"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteApartmentDialog } from "./DeleteApartmentDialog";

interface ApartmentActionsMenuProps {
  apartmentId: string;
  apartmentName: string;
  onDelete: (id: string) => Promise<void>;
}

export function ApartmentActionsMenu({
  apartmentId,
  apartmentName,
  onDelete,
}: ApartmentActionsMenuProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleEdit = () => {
    router.push(`/dashboard/apartments/${apartmentId}/edit`);
  };

  const handleViewOffers = () => {
    router.push(`/dashboard/apartments/${apartmentId}/offers`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center justify-center h-8 w-8
                       rounded-lg hover:bg-accent
                       transition-colors text-muted-foreground"
            aria-label={`Apartment actions for ${apartmentName}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={handleViewOffers}
            className="flex items-center gap-2 cursor-pointer
                       text-muted-foreground"
          >
            <Users className="h-4 w-4 text-primary" />
            View offers
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleEdit}
            className="flex items-center gap-2 cursor-pointer
                       text-muted-foreground"
          >
            <Pencil className="h-4 w-4 text-orange-500" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setConfirmOpen(true)}
            className="flex items-center gap-2 cursor-pointer
                       text-muted-foreground"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteApartmentDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        apartmentName={apartmentName}
        onConfirm={() => onDelete(apartmentId)}
      />
    </>
  );
}
