import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <main className="grid min-h-[70dvh] place-items-center px-4">
      <EmptyState
        title="We couldn't find that page"
        description="The link may be broken or the listing may no longer be available."
        action={
          <Button asChild>
            <Link href="/rent">Browse places</Link>
          </Button>
        }
      />
    </main>
  );
}
