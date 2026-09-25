"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ApartmentActionsMenuProps {
  apartmentId: string;
  apartmentName: string;
  onDeleteConfirm?: (id: string) => void;
}

export function ApartmentActionsMenu({
  apartmentId,
  apartmentName,
  onDeleteConfirm,
}: ApartmentActionsMenuProps) {
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleEdit = () => {
    router.push(`/dashboard/apartments/${apartmentId}/edit`);
  };

  const handleDelete = () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    // TODO: wire to Hasura mutation → DELETE FROM public.apartments WHERE id = $id
    onDeleteConfirm?.(apartmentId);
    setConfirmingDelete(false);
  };

  return (
    <DropdownMenu onOpenChange={() => setConfirmingDelete(false)}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center h-8 w-8
                     rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700
                     transition-colors text-gray-500 dark:text-gray-400"
          aria-label="Apartment actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={handleEdit}
          className="flex items-center gap-2 cursor-pointer
                     text-gray-700 dark:text-gray-300"
        >
          <Pencil className="h-4 w-4 text-orange-500" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(event) => {
            if (!confirmingDelete) event.preventDefault();
            handleDelete();
          }}
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            confirmingDelete
              ? "text-red-600 dark:text-red-400 font-semibold"
              : "text-gray-700 dark:text-gray-300",
          )}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
          {confirmingDelete ? `Delete "${apartmentName}"?` : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
