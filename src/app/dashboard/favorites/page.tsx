"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WishlistCard } from "@/components/dashboard/WishlistCard";
import { MOCK_APARTMENTS } from "@/lib/mockData/apartments";

// TODO: replace with Hasura query → public.favorites
//       WHERE user_id = currentUser.id
const STUB_WISHLISTS = [
  {
    id: "wl-1",
    name: "Recently viewed",
    savedAt: "Today",
    apartments: MOCK_APARTMENTS.slice(0, 4),
  },
  {
    id: "wl-2",
    name: "La Sabana picks",
    savedAt: "Yesterday",
    apartments: MOCK_APARTMENTS.slice(1, 5),
  },
  {
    id: "wl-3",
    name: "Escazú options",
    savedAt: "3 days ago",
    apartments: MOCK_APARTMENTS.slice(2, 6),
  },
];

export default function FavoritesPage() {
  const router = useRouter();

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Wishlist</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {STUB_WISHLISTS.length} saved
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/rent")}
          className="text-sm"
        >
          Browse apartments
        </Button>
      </div>

      {/* Grid */}
      {STUB_WISHLISTS.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STUB_WISHLISTS.map((wl) => (
            <WishlistCard
              key={wl.id}
              name={wl.name}
              apartments={wl.apartments}
              savedAt={wl.savedAt}
              onClick={() => router.push("/rent")}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
          <Heart className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground">
            No saved apartments yet
          </p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Browse apartments and tap the heart icon to save them to your wishlist.
          </p>
          <Button
            onClick={() => router.push("/rent")}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Browse apartments →
          </Button>
        </div>
      )}
    </div>
  );
}
