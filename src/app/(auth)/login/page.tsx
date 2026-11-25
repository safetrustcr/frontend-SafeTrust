import { Suspense } from "react";
import type { Metadata } from "next";
import Login from "@/components/auth/Login";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
