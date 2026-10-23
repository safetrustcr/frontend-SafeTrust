import { Suspense } from "react";
import VerifyEmail from "@/components/auth/VerifyEmail";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}
