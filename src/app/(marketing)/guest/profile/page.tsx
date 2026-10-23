import type { Metadata } from "next";
import { GuestProfileLanding } from "@/features/auth";

export const metadata: Metadata = { title: "Your account | SafeTrust" };

export default function GuestProfilePage() {
  return <GuestProfileLanding />;
}
