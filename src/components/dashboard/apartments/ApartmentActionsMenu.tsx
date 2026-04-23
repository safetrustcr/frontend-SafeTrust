"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ApartmentActionsMenuProps {
  apartmentId: number;
  onDeleteConfirmed: (id: number) => void;
}

export function ApartmentActionsMenu({ apartmentId, onDeleteConfirmed }: ApartmentActionsMenuProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleConfirmDelete = () => {
    // TODO: replace with DELETE /api/apartments/:id or GraphQL mutation
    toast.success(`Apartment ${apartmentId} deleted (stub)`);
    onDeleteConfirmed(apartmentId);
    setDeleteOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Open apartment actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={`/dashboard/apartments/${apartmentId}/offers`}>
              <Users className="mr-2 h-4 w-4" />
              View interested people
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={`/dashboard/apartments/${apartmentId}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit apartment
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete apartment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete apartment</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete apartment #{apartmentId}{" "}
              from your listings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
