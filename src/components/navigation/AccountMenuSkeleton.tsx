import { CircleUserRound, Menu } from "lucide-react";

/**
 * Size- and shape-matched stand-in for the `AccountMenu` trigger.
 *
 * The real menu pulls in the Radix dropdown and Firebase auth state, so both
 * headers load it as a separate chunk to keep it out of their first-load JS
 * (see `scripts/route-budgets.js`). Rendering the same pill while that chunk
 * loads means the header never shifts or flashes an empty slot.
 */
export function AccountMenuSkeleton() {
  return (
    <div
      aria-hidden="true"
      data-testid="header-account-menu-loading"
      className="flex min-h-11 items-center gap-2 rounded-full border border-border px-2 py-1"
    >
      <Menu aria-hidden="true" className="h-4 w-4" />
      <CircleUserRound
        aria-hidden="true"
        className="h-8 w-8 text-muted-foreground"
      />
    </div>
  );
}
