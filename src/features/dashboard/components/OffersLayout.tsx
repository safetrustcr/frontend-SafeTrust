import type { ReactNode } from "react";
import { ProfileSettingsSidebar } from "@/components/dashboard/profile/ProfileSettingsSidebar";

export function OffersLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col rounded-lg border border-border bg-background md:flex-row">
      <ProfileSettingsSidebar className="w-full border-b border-r-0 md:w-44 md:border-b-0 md:border-r" />
      <div className="min-w-0 flex-1 space-y-6 p-4 sm:p-6">{children}</div>
    </div>
  );
}
