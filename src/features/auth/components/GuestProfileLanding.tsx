"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import HotelHeader from "@/components/listings/HotelHeader";

const RETURN_TO = "/dashboard/profile";

const BENEFITS = [
  {
    Icon: Heart,
    title: "Save stays",
    text: "Keep a wishlist of places you like.",
  },
  {
    Icon: MessageSquare,
    title: "Message hosts",
    text: "Ask questions before you book.",
  },
  {
    Icon: ShieldCheck,
    title: "Protected deposits",
    text: "Your deposit is held in a Stellar escrow until check-out.",
  },
] as const;

/**
 * Public profile page for signed-out visitors (issue #655).
 *
 * Signed-out guests see why an account is worth having plus Log in /
 * Create account buttons that carry `?redirect=/dashboard/profile` through
 * both auth forms. Signed-in visitors are sent straight to the real profile;
 * until `useCurrentUser` resolves nothing identity-related is rendered, so
 * there is never a flash of somebody else's (or a fake) identity.
 */
export function GuestProfileLanding() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (!loading && user) router.replace(RETURN_TO);
  }, [loading, user, router]);

  const redirect = `?redirect=${encodeURIComponent(RETURN_TO)}`;

  return (
    <div className="min-h-screen">
      <HotelHeader />
      {loading || user ? (
        // Stable empty shell while auth resolves or the redirect happens.
        <div aria-busy="true" className="mx-auto min-h-[60vh] max-w-xl" />
      ) : (
        <main className="theme-guest mx-auto max-w-xl px-4 py-12 text-center">
          <Image
            src="/img/logo.png"
            alt=""
            width={56}
            height={56}
            className="mx-auto"
          />
          <h1 className="mt-4 text-3xl font-bold">Your SafeTrust account</h1>
          <p className="mt-2 text-muted-foreground">
            Log in or create an account to see your profile.
          </p>

          <ul className="mt-8 space-y-4 text-left">
            {BENEFITS.map(({ Icon, title, text }) => (
              <li
                key={title}
                className="flex gap-3 rounded-xl border border-border p-4"
              >
                <Icon
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href={`/login${redirect}`}>Log in</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`/register${redirect}`}>Create account</Link>
            </Button>
          </div>
          <Link
            href="/rent"
            className="mt-6 inline-block text-sm text-primary underline-offset-4 hover:underline dark:text-orange-400"
          >
            Back to stays
          </Link>
        </main>
      )}
    </div>
  );
}
