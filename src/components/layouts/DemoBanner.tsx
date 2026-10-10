export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return null;

  return (
    <div
      role="note"
      className="bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200"
    >
      You&apos;re viewing SafeTrust with <strong>demo listings</strong>. Bookings and
      payments use the Stellar <strong>testnet</strong>.
    </div>
  );
}