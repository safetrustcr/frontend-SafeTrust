import FavoriteButton from '@/components/room/mobile/FavoriteButton';

const STUB_FAVORITES = [
  {
    id: '1',
    name: 'La sabana sur',
    address: '329 Calle santos, paseo colón, San José',
    price: 4058,
    bedrooms: 2,
    bathrooms: 1,
    petFriendly: true,
  },
  {
    id: '2',
    name: 'Los yoses',
    address: '329 Calle santos, paseo colón, San José',
    price: 4000,
    bedrooms: 2,
    bathrooms: 1,
    petFriendly: true,
  },
];

export default function FavoritesPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Favorites</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Apartments you have saved
        </p>
      </div>

      {STUB_FAVORITES.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No favorites yet</p>
          <p className="text-sm mt-1">
            Save apartments by clicking the heart icon on any listing.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STUB_FAVORITES.map((apartment) => (
            <div
              key={apartment.id}
              className="border rounded-xl p-4 bg-card space-y-3"
            >
              <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-xs text-muted-foreground">
                  Image placeholder
                </span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{apartment.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {apartment.address}
                  </p>
                  <p className="text-sm text-primary font-semibold mt-1">
                    ${apartment.price.toLocaleString()}/mo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {apartment.bedrooms}bd ·{' '}
                    {apartment.petFriendly ? 'pet friendly' : 'no pets'} ·{' '}
                    {apartment.bathrooms}ba
                  </p>
                </div>

                {/* TODO: wire isLiked state from user favorites store */}
                <FavoriteButton isLiked={true} showCount={false} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
