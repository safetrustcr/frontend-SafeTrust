import { Suspense } from "react";
import Register from "@/components/auth/Register";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense>
      <Register />
    </Suspense>
  );
}
