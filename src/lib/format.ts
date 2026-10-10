const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

/** Listing prices: "$4,058". */
export const formatPrice = (amount: number) => usd.format(amount);

/** Escrow and invoice amounts: "$4,058.00". */
export const formatAmount = (amount: number) => usdCents.format(amount);
