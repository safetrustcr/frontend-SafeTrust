import { Suspense } from "react";
import Login from "@/components/auth/Login";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  // `Login` reads the `?redirect=` parameter with `useSearchParams()`, which
  // Next 15 requires to be wrapped in a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}
