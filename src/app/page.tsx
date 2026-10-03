import Link from "next/link";
import { Button } from "@/components/ui/button";
import DestinationCarousel from "@/components/DestinationCarousel";
import Header from "@/components/layouts/Header";

export default function Page() {
  return (
    <>
      <Header />
      <main className="flex min-h-dvh flex-col">
        <section className="px-4 py-16 text-center sm:py-24">
          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Book stays with your deposit protected by escrow on Stellar
            </h1>
            <p className="text-lg text-muted-foreground">
              Find apartments and hotels in Costa Rica. Your deposit is held in a Stellar escrow until check-out.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/rent">Find a place</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login?redirect=/dashboard/hotels/new">List your property</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="px-4 py-12">
          <DestinationCarousel />
        </section>

        <section className="px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-center text-3xl font-semibold">
              How escrow protects you
            </h2>
            <ol className="grid gap-6 sm:grid-cols-3">
              <li className="rounded-lg border p-6">
                <span className="text-sm font-semibold text-muted-foreground">Step 1</span>
                <h3 className="mt-2 text-lg font-semibold">Book</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose a stay and reserve with your deposit securely held.
                </p>
              </li>
              <li className="rounded-lg border p-6">
                <span className="text-sm font-semibold text-muted-foreground">Step 2</span>
                <h3 className="mt-2 text-lg font-semibold">Deposit held in escrow</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your deposit is locked in a Stellar escrow until check-out.
                </p>
              </li>
              <li className="rounded-lg border p-6">
                <span className="text-sm font-semibold text-muted-foreground">Step 3</span>
                <h3 className="mt-2 text-lg font-semibold">Released at check-out</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Once you check out, the deposit is released to the host.
                </p>
              </li>
            </ol>
          </div>
        </section>
      </main>
    </>
  );
}
