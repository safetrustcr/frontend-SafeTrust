import type { Metadata } from "next";
import { VerifyEmail } from "@/features/auth";

export const metadata: Metadata = { title: "Verify email" };

export default function Page() {
  return <VerifyEmail />;
}
