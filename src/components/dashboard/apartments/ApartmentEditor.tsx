"use client";

import { useCallback, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { toast } from "sonner";
import { NewApartmentForm } from "@/components/dashboard/apartments/NewApartmentForm";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/ui/demo-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  apartmentsRepository,
  DEMO_SAVED_MESSAGE,
  describeApartmentError,
  type ApartmentInput,
  type ApartmentsRepository,
  type OwnedApartment,
} from "@/features/apartments";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; apartment: OwnedApartment | null }
  | { status: "error"; message: string };

interface ApartmentEditorProps {
  /** Omitted to create a new apartment. */
  apartmentId?: string;
  repository?: ApartmentsRepository;
}

/** Loads (when editing) and saves an apartment through the repository. */
export function ApartmentEditor({
  apartmentId,
  repository = apartmentsRepository,
}: ApartmentEditorProps) {
  const router = useRouter();
  const [state, setState] = useState<LoadState>(
    apartmentId ? { status: "loading" } : { status: "ready", apartment: null },
  );

  const load = useCallback(async () => {
    if (!apartmentId) return;
    setState({ status: "loading" });
    try {
      const apartment = await repository.get(apartmentId);
      setState({ status: "ready", apartment });
    } catch (error) {
      setState({
        status: "error",
        message: describeApartmentError(error).message,
      });
    }
  }, [apartmentId, repository]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async (input: ApartmentInput) => {
    if (apartmentId) {
      await repository.update(apartmentId, input);
    } else {
      await repository.create(input);
    }
    toast.success(
      repository.mode === "demo"
        ? DEMO_SAVED_MESSAGE
        : apartmentId
          ? "Apartment updated"
          : "Apartment created",
    );
    router.push("/dashboard/apartments");
  };

  const demoNotice = repository.mode === "demo" && (
    <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
      <DemoBadge />
      Demo mode: changes stay in this tab and are not stored.
    </p>
  );

  if (state.status === "loading") {
    return (
      <div
        role="status"
        aria-label="Loading apartment"
        className="max-w-4xl mx-auto space-y-6"
      >
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <p
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {state.message}
        </p>
        <Button variant="outline" onClick={() => void load()}>
          Try again
        </Button>
      </div>
    );
  }

  if (apartmentId && !state.apartment) notFound();

  return (
    <>
      {demoNotice}
      {state.apartment ? (
        <NewApartmentForm
          initialValues={state.apartment}
          onSave={handleSave}
          title="Edit apartment"
          submitLabel="Save changes"
        />
      ) : (
        <NewApartmentForm onSave={handleSave} />
      )}
    </>
  );
}
