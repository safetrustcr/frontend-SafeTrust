import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyEmail from "@/components/auth/VerifyEmail";

export const metadata: Metadata = { title: "Verify email" };
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}
