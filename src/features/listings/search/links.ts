type ListingPath = "/rent" | "/guest/suggestions" | `/rent/${string}`;

/** Keep the active listing search when navigating between listing pages. */
export function listingHref(
  pathname: ListingPath,
  current: URLSearchParams,
): string {
  const query = new URLSearchParams(current);
  query.delete("selected");
  for (const key of ["lat", "lng", "latitude", "longitude", "coordinates"]) {
    query.delete(key);
  }
  const search = query.toString();
  return search ? `${pathname}?${search}` : pathname;
}
