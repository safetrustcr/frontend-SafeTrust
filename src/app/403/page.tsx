import Link from "next/link";
import { ShieldX } from "lucide-react";

/**
 * 403 – Forbidden
 *
 * Shown when the middleware rewrites to /403 because the authenticated user's
 * role does not satisfy the access requirement for the requested route
 * (e.g. a guest visiting a host-only area).
 */
export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <ShieldX className="h-16 w-16 text-orange-500" aria-hidden="true" />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Access denied
        </h1>
        <p className="text-muted-foreground">
          You don&apos;t have access to this page.
        </p>
      </div>

      <Link
        href="/dashboard"
        className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
      >
        Go to dashboard
      </Link>
    </main>
  );
}
