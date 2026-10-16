import { Suspense } from "react";
import type { Metadata } from "next";
import { Login } from "@/features/auth";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
