"use client";



type SortOption = "relevance" | "price-low" | "price-high" | "nearest";

export default function ApartmentListingPage() {
  const router = useRouter();
  const geo = useGeolocation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Family",
    "Students",
  ]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([
    "San José",
    "Heredia",
  ]);
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
  const [minPrice, setMinPrice] = useState<number>(3200);
  const [maxPrice, setMaxPrice] = useState<number>(206000);
  const [favorites, setFavorites] = useState<string[]>(
    APARTMENT_LISTINGS.filter((h) => h.favorite).map((h) => h.id),
  );

  const toggleFavorite = (id: string) => {
    setFavorites((curr) =>
      curr.includes(id) ? curr.filter((f) => f !== id) : [...curr, id],
    );
  };

  const isOutsideCostaRica = useMemo(() => {
    if (!geo.position) return false;
    const origin = geo.position;
    const nearestListingKm = Math.min(
      ...APARTMENT_LISTINGS.map((apartment) =>
        distanceKm(origin, apartment.coordinates),
      ),
    );
    return nearestListingKm > 300;
  }, [geo.position]);

  useEffect(() => {
    if (geo.position) {
      setSortOption(isOutsideCostaRica ? "relevance" : "nearest");
    } else if (geo.status === "idle") {
      setSortOption("relevance");
    }
  }, [geo.position, geo.status, isOutsideCostaRica]);

  const distances = useMemo(
    () =>
      geo.position
        ? Object.fromEntries(
            APARTMENT_LISTINGS.map((apartment) => [
              apartment.id,
              distanceKm(geo.position!, apartment.coordinates),
            ]),
          )
        : undefined,
    [geo.position],
  );

  const filteredApartments = useMemo(() => {
    const apartments = APARTMENT_LISTINGS.filter((apartment) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(apartment.category);
      const matchesLocation =
        selectedLocations.length === 0 ||
        selectedLocations.includes(apartment.location);
      const matchesBedroom =
        selectedBedrooms === "all" ||
        apartment.bedrooms === Number(selectedBedrooms);
      const matchesPrice =
        apartment.price >= minPrice && apartment.price <= maxPrice;

      return (
        matchesCategory && matchesLocation && matchesBedroom && matchesPrice
      );
    });

    if (sortOption === "nearest" && geo.position && !isOutsideCostaRica) {
      return sortByDistance(
        apartments,
        geo.position,
        (apartment) => apartment.coordinates,
      );
    }

    if (sortOption === "price-low") {
      return [...apartments].sort((left, right) => left.price - right.price);
    }

    if (sortOption === "price-high") {
      return [...apartments].sort((left, right) => right.price - left.price);
    }

    return [...apartments].sort(
      (left, right) => Number(right.promoted) - Number(left.promoted),
    );
  }, [

    maxPrice,
    minPrice,
    selectedBedrooms,
    selectedCategories,
    selectedLocations,
    sortOption,
  ]);


  const handleApartmentClick = (apartment: ApartmentListing) => {
    router.push(`/rent/${apartment.id}`);
  };

  const handleReset = () => {
    setSortOption("relevance");
    setSelectedCategories(["Family", "Students"]);
    setSelectedLocations(["San José", "Heredia"]);
    setSelectedBedrooms("all");
    setMinPrice(3200);
    setMaxPrice(206000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
      <HotelHeader />


          </div>
        </div>

        <div className="mt-8">
          <DestinationCarousel
            destinations={filteredApartments}
            onDestinationClick={handleApartmentClick}
          />
        </div>

        <div className="mt-6">
          <CategoryFilterRow
            selectedCategories={selectedCategories}
            selectedLocations={selectedLocations}
            selectedBedrooms={selectedBedrooms}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onCategoryToggle={handleCategoryToggle}
            onLocationToggle={(location) =>
              setSelectedLocations((current) => toggleValue(current, location))
            }
            onBedroomSelect={setSelectedBedrooms}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            onReset={handleReset}
          />
        </div>
      </div>
    </div>
  );
}
