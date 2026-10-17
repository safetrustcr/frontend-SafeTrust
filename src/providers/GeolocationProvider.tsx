"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useGeolocation } from "@/hooks/useGeolocation";

type Geo = ReturnType<typeof useGeolocation>;

const GeoContext = createContext<Geo | null>(null);

export function GeolocationProvider({ children }: { children: ReactNode }) {
  const geo = useGeolocation();

  useEffect(() => {
    if (geo.status === "denied") {
      toast.info(
        "Location is off. Pick a destination instead, or enable it in your browser settings.",
      );
    }
    if (geo.status === "error") {
      toast.error(
        "We couldn't get your location. Try again or choose a destination.",
      );
    }
  }, [geo.status]);

  return <GeoContext.Provider value={geo}>{children}</GeoContext.Provider>;
}

/** Returns null outside listing pages, where Nearby is not available. */
export function useSharedGeolocation() {
  return useContext(GeoContext);
}

export function useRequiredSharedGeolocation(): Geo {
  const geo = useSharedGeolocation();
  if (!geo) {
    throw new Error(
      "This page must be rendered inside GeolocationProvider.",
    );
  }
  return geo;
}
