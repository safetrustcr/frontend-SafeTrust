import { Suspense } from "react";
import Login from "@/components/auth/Login";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
