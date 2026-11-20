"use client";

import dynamic from "next/dynamic";
import { ProfileSettingsSidebar } from "@/components/dashboard/profile/ProfileSettingsSidebar";
import { HostPayoutGuidance } from "@/components/dashboard/profile/HostPayoutGuidance";

const EditProfileForm = dynamic(
  () =>
    import("@/components/dashboard/profile/EditProfileForm").then(
      (mod) => mod.EditProfileForm,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        aria-label="Loading profile"
        className="h-96 rounded-lg bg-muted motion-safe:animate-pulse"
      />
    ),
  },
);

export function ProfilePageContent() {
  return (
    <div className="flex w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <ProfileSettingsSidebar />
      <div className="min-w-0 flex-1 p-6 lg:p-8">
        <HostPayoutGuidance className="mb-6" />
        <EditProfileForm />
      </div>
    </div>
  );
}
