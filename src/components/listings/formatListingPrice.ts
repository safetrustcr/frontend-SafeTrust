const listingPriceFormatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatListingPrice(price: number) {
  return `$${listingPriceFormatter.format(price)}`;
}
