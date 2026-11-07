import Link from "next/link";
import { Button } from "@/components/ui/button";
import DestinationCarousel from "@/components/home/DestinationCarousel";
import Header from "@/components/layouts/Header";
import {
  HomeMotion,
  HomeMotionSection,
  HomeMotionItem,
  HomeMotionStep,
} from "@/components/home/HomeMotion";
import { HomeSkyline } from "@/components/home/HomeSkyline";
import { SupportedBy } from "@/components/home/SupportedBy";
import { HomeFooter } from "@/components/home/HomeFooter";

export default function Page() {
  return (
    <>
      <Header />
      <HomeMotion>
        <main className="home-page flex min-h-dvh flex-col">
          <HomeMotionSection
            revealOnScroll={false}
            className="relative isolate overflow-hidden px-4 pb-16 pt-12 text-center sm:pb-20 sm:pt-14"
          >
            <div aria-hidden="true" className="home-streaks" />
            <HomeSkyline />
            <div className="home-glass home-hero-glass mx-auto max-w-5xl rounded-2xl px-6 py-10 sm:px-10 sm:py-12">
              <div className="mx-auto max-w-3xl space-y-6">
                <HomeMotionItem>
                  <h1 className="home-ink text-4xl font-extrabold tracking-tight sm:text-5xl">
                    Book stays with your deposit protected by escrow on Stellar
                  </h1>
                </HomeMotionItem>
                <HomeMotionItem>
                  <p className="text-lg text-muted-foreground">
                    Discover a new way to rent worldwide with SafeTrust. Secure
                    rental payments through escrow on Stellar.
                  </p>
                </HomeMotionItem>
                <HomeMotionItem className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Button asChild size="lg" className="home-cta-glass">
                    <Link
                      className="motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.98]"
                      href="/rent"
                    >
                      Find a place
                    </Link>
                  </Button>
                  <Button asChild size="lg" className="home-cta-orange">
                    <Link
                      className="motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.98]"
                      href="/login?redirect=/dashboard/apartments/new"
                    >
                      List your property
                    </Link>
                  </Button>
                </HomeMotionItem>
              </div>
            </div>
          </HomeMotionSection>

          <HomeMotionSection className="px-4 py-12">
            <HomeMotionItem>
              <DestinationCarousel />
            </HomeMotionItem>
          </HomeMotionSection>

          <HomeMotionSection>
            <HomeMotionItem>
              <SupportedBy />
            </HomeMotionItem>
          </HomeMotionSection>

          <HomeMotionSection className="px-4 py-16">
            <div className="mx-auto max-w-5xl">
              <HomeMotionItem>
                <h2 className="home-ink mb-8 text-center text-3xl font-bold">
                  How escrow protects you
                </h2>
              </HomeMotionItem>
              <ol className="grid gap-6 sm:grid-cols-3">
                <HomeMotionStep className="home-glass rounded-2xl p-6">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Step 1
                  </span>
                  <h3 className="home-ink mt-2 text-lg font-semibold">Book</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choose a stay and reserve with your deposit securely held.
                  </p>
                </HomeMotionStep>
                <HomeMotionStep className="home-glass rounded-2xl p-6">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Step 2
                  </span>
                  <h3 className="home-ink mt-2 text-lg font-semibold">
                    Deposit held in escrow
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your deposit is locked in a Stellar escrow until check-out.
                  </p>
                </HomeMotionStep>
                <HomeMotionStep className="home-glass rounded-2xl p-6">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Step 3
                  </span>
                  <h3 className="home-ink mt-2 text-lg font-semibold">
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
        <HomeFooter />
      </HomeMotion>
    </>
  );
}
