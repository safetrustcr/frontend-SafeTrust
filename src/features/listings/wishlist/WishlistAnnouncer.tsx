/** Polite live region for "Saved to / Removed from Wishlists". */
export function WishlistAnnouncer({ message }: { message: string }) {
  return (
    <p aria-live="polite" role="status" className="sr-only">
      {message}
    </p>
  );
}
