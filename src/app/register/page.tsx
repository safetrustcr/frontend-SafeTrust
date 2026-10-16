import type { Metadata } from "next";
import { Register } from "@/features/auth";

export const metadata: Metadata = { title: "Create account" };

export default function Page() {
  return <Register />;
}
