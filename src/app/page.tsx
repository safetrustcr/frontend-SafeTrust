import Link from "next/link";
import { Button } from "@/components/ui/button";
import DestinationCarousel from "@/components/DestinationCarousel";
import Header from "@/components/layouts/Header";
import {
  HomeMotion,
  HomeMotionSection,
  HomeMotionItem,
  HomeMotionStep,
} from "@/components/home/HomeMotion";

export default function Page() {
  return (
    <>
      <Header />
      <HomeMotion>
        <main className="flex min-h-dvh flex-col">
          <HomeMotionSection
            revealOnScroll={false}
            className="px-4 py-16 text-center sm:py-24"
          >
            <div className="mx-auto max-w-3xl space-y-6">
              <HomeMotionItem>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  Book stays with your deposit protected by escrow on Stellar
                </h1>
              </HomeMotionItem>
              <HomeMotionItem>
                <p className="text-lg text-muted-foreground">
                  Find apartments and hotels in Costa Rica. Your deposit is held
                  in a Stellar escrow until check-out.
                </p>
              </HomeMotionItem>
              <HomeMotionItem className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button asChild size="lg">
                  <Link
                    className="motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.98]"
                    href="/rent"
                  >
                    Find a place
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link
                    className="motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.98]"
                    href="/login?redirect=/dashboard/hotels/new"
                  >
                    List your property
                  </Link>
                </Button>
              </HomeMotionItem>
            </div>
          </HomeMotionSection>

          <HomeMotionSection className="px-4 py-12">
            <HomeMotionItem>
              <DestinationCarousel />
            </HomeMotionItem>
          </HomeMotionSection>

          <HomeMotionSection className="px-4 py-16">
            <div className="mx-auto max-w-5xl">
              <HomeMotionItem>
                <h2 className="mb-8 text-center text-3xl font-semibold">
                  How escrow protects you
                </h2>
              </HomeMotionItem>
              <ol className="grid gap-6 sm:grid-cols-3">
                <HomeMotionStep className="rounded-lg border p-6">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Step 1
                  </span>
                  <h3 className="mt-2 text-lg font-semibold">Book</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choose a stay and reserve with your deposit securely held.
                  </p>
                </HomeMotionStep>
                <HomeMotionStep className="rounded-lg border p-6">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Step 2
                  </span>
                  <h3 className="mt-2 text-lg font-semibold">
                    Deposit held in escrow
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your deposit is locked in a Stellar escrow until check-out.
                  </p>
                </HomeMotionStep>
                <HomeMotionStep className="rounded-lg border p-6">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Step 3
                  </span>
                  <h3 className="mt-2 text-lg font-semibold">
                    Released at check-out
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Once you check out, the deposit is released to the host.
                  </p>
                </HomeMotionStep>
              </ol>
            </div>
          </HomeMotionSection>
        </main>
      </HomeMotion>
    </>
  );
}
